import { existsSync } from 'fs';
import { deletePreviousComments, postComment, postErrorComment, postNothingAnalyzedComment } from './github/posting/comments';
import { githubConfig, ticsConfig } from './configuration';
import { changedFilesToFile, getChangedFiles } from './github/calling/pulls';
import { logger } from './helper/logger';
import { runTicsAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate, getViewerVersion } from './tics/fetcher';
import { postNothingAnalyzedReview, postReview } from './github/posting/review';
import { createSummaryBody, createReviewComments } from './helper/summary';
import { deletePreviousReviewComments, postAnnotations } from './github/posting/annotations';
import { getPostedReviewComments } from './github/calling/annotations';
import { Events } from './helper/enums';
import { satisfies } from 'compare-versions';
import { exportVariable } from '@actions/core';
import { Analysis, ReviewComments } from './helper/interfaces';
import { getPostedComments } from './github/calling/comments';

run().catch((error: unknown) => {
  let message = 'TICS failed with unknown reason';
  if (error instanceof Error) message = error.message;
  logger.exit(message);
});

// exported for testing purposes
export async function run(): Promise<void> {
  configure();

  const message = await meetsPrerequisites();
  if (message) return logger.exit(message);

  await main();
}

async function main() {
  try {
    let analysis: Analysis | undefined;

    if (ticsConfig.mode === 'diagnostic') {
      logger.header('Running action in diagnostic mode');
      analysis = await runTicsAnalyzer('');
      if (analysis.statusCode !== 0) logger.setFailed('Diagnostic run has failed.');
    } else {
      const changedFiles = await getChangedFiles();
      if (!changedFiles || changedFiles.length <= 0) return logger.info('No changed files found to analyze.');

      const changedFilesFilePath = changedFilesToFile(changedFiles);
      analysis = await runTicsAnalyzer(changedFilesFilePath);

      if (!analysis.explorerUrl) {
        if (!analysis.completed) {
          await postErrorComment(analysis);
          logger.setFailed('Failed to run TICS Github Action.');
        } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
          await postToConversation(false, 'No changed files applicable for TICS analysis quality gating.');
        } else {
          logger.setFailed('Failed to run TICS Github Action.');
          analysis.errorList.push('Explorer URL not returned from TICS analysis.');
        }
        cliSummary(analysis);
        return;
      }

      const analyzedFiles = await getAnalyzedFiles(analysis.explorerUrl, changedFiles);
      const qualityGate = await getQualityGate(analysis.explorerUrl);

      if (!qualityGate) return logger.exit('Quality gate could not be retrieved');

      let reviewComments: ReviewComments | undefined;

      const previousReviewComments = await getPostedReviewComments();
      if (previousReviewComments && previousReviewComments.length > 0) {
        deletePreviousReviewComments(previousReviewComments);
      }

      if (ticsConfig.postAnnotations) {
        const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
        if (annotations && annotations.length > 0) {
          reviewComments = createReviewComments(annotations, changedFiles);
          postAnnotations(reviewComments);
        }
      }

      let reviewBody = await createSummaryBody(analysis, analyzedFiles, qualityGate, reviewComments);

      deletePreviousComments(await getPostedComments());

      await postToConversation(true, reviewBody, qualityGate.passed ? Events.APPROVE : Events.REQUEST_CHANGES);

      if (!qualityGate.passed) logger.setFailed(qualityGate.message);
    }

    cliSummary(analysis);
  } catch (error: unknown) {
    throw error;
  }
}

/**
 * Function to combine the posting to conversation in a single location.
 * @param isGate if posting is done on a quality gate result.
 * @param body body of the summary to post.
 * @param event in case of posting a review an event should be given.
 */
async function postToConversation(isGate: boolean, body: string, event: Events = Events.COMMENT): Promise<void> {
  if (ticsConfig.postToConversation) {
    if (isGate) {
      if (ticsConfig.pullRequestApproval) {
        await postReview(body, event);
      } else {
        await postComment(body);
      }
    } else {
      if (ticsConfig.pullRequestApproval) {
        await postNothingAnalyzedReview(body);
      } else {
        await postNothingAnalyzedComment(body);
      }
    }
  }
}

/**
 * Configure the action before running the analysis.
 */
export function configure(): void {
  process.removeAllListeners('warning');
  process.on('warning', warning => {
    if (githubConfig.debugger) logger.debug(warning.message.toString());
  });

  exportVariable('TICSIDE', 'GITHUB');

  // set ticsAuthToken
  if (ticsConfig.ticsAuthToken) {
    exportVariable('TICSAUTHTOKEN', ticsConfig.ticsAuthToken);
  }

  // set hostnameVerification
  if (ticsConfig.hostnameVerification) {
    exportVariable('TICSHOSTNAMEVERIFICATION', ticsConfig.hostnameVerification);

    if (ticsConfig.hostnameVerification === '0' || ticsConfig.hostnameVerification === 'false') {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      logger.debug('Hostname Verification disabled');
    }
  }

  // set trustStrategy
  if (ticsConfig.trustStrategy) {
    exportVariable('TICSTRUSTSTRATEGY', ticsConfig.trustStrategy);

    if (ticsConfig.trustStrategy === 'self-signed' || ticsConfig.trustStrategy === 'all') {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      logger.debug(`Trust strategy set to ${ticsConfig.trustStrategy}`);
    }
  }
}

/**
 * Checks if prerequisites are met to run the Github Plugin.
 * If any of these checks fail it returns a message.
 * @returns Message containing why it failed the prerequisite.
 */
async function meetsPrerequisites(): Promise<string | undefined> {
  let message;

  const viewerVersion = await getViewerVersion();

  if (!viewerVersion || !satisfies(viewerVersion.version, '>=2022.4.0')) {
    const version = viewerVersion ? viewerVersion.version : 'unknown';
    message = `Minimum required TICS Viewer version is 2022.4. Found version ${version}.`;
  } else if (ticsConfig.mode === 'diagnostic') {
    // No need for pull_request and checked out repository.
  } else if (githubConfig.eventName !== 'pull_request') {
    message = 'This action can only run on pull requests.';
  } else if (!isCheckedOut()) {
    message = 'No checkout found to analyze. Please perform a checkout before running the TICS Action.';
  }

  return message;
}

/**
 * Checks if a .git directory exists to see if a checkout has been performed.
 * @returns Boolean value if the folder is found or not.
 */
function isCheckedOut(): boolean {
  if (!existsSync('.git')) {
    logger.error('No git checkout found');
    return false;
  }
  return true;
}
