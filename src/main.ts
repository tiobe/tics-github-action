import { existsSync } from 'fs';
import { postErrorComment } from './github/posting/comment';
import { githubConfig, ticsConfig } from './configuration';
import { changedFilesToFile, getChangedFiles } from './github/calling/pulls';
import Logger from './helper/logger';
import { runTicsAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate, getViewerVersion } from './tics/fetcher';
import { postNothingAnalyzedReview, postReview } from './github/posting/review';
import { createReviewComments } from './helper/summary';
import { deletePreviousReviewComments } from './github/posting/annotations';
import { getPostedReviewComments } from './github/calling/annotations';
import { Events } from './helper/enums';
import { satisfies } from 'compare-versions';
import { exportVariable } from '@actions/core';

run();

// exported for testing purposes
export async function run() {
  configure();

  const message = await meetsPrerequisites();
  if (message) return Logger.Instance.exit(message);

  await main();
}

async function main() {
  try {
    const changedFiles = await getChangedFiles();
    if (!changedFiles || changedFiles.length <= 0) return Logger.Instance.setFailed('No changed files found to analyze.');

    const changedFilesFilePath = changedFilesToFile(changedFiles);
    const analysis = await runTicsAnalyzer(changedFilesFilePath);

    if (!analysis.explorerUrl) {
      if (!analysis.completed) {
        postErrorComment(analysis);
        Logger.Instance.setFailed('Failed to run TiCS Github Action.');
      } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
        postNothingAnalyzedReview('No changed files applicable for TiCS analysis quality gating.', Events.APPROVE);
      } else {
        Logger.Instance.setFailed('Failed to run TiCS Github Action.');
        analysis.errorList.push('Explorer URL not returned from TiCS analysis.');
      }
      cliSummary(analysis);
      return;
    }

    const analyzedFiles = await getAnalyzedFiles(analysis.explorerUrl);
    const qualityGate = await getQualityGate(analysis.explorerUrl);
    let reviewComments;

    if (ticsConfig.postAnnotations) {
      const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
      if (annotations && annotations.length > 0) {
        reviewComments = await createReviewComments(annotations, changedFiles);
      }
      const previousReviewComments = await getPostedReviewComments();
      if (previousReviewComments && previousReviewComments.length > 0) {
        await deletePreviousReviewComments(previousReviewComments);
      }
    }

    await postReview(analysis, analyzedFiles, qualityGate, reviewComments);

    if (!qualityGate.passed) Logger.Instance.setFailed(qualityGate.message);

    cliSummary(analysis);
  } catch (error: any) {
    Logger.Instance.error('Failed to run TiCS Github Action');
    Logger.Instance.exit(error.message);
  }
}

/**
 * Configure the action before running the analysis.
 */
export function configure() {
  process.removeAllListeners('warning');
  process.on('warning', warning => {
    if (githubConfig.debugger) Logger.Instance.warning(warning.message.toString());
  });

  // set ticsAuthToken
  if (ticsConfig.ticsAuthToken) {
    exportVariable('TICSAUTHTOKEN', ticsConfig.ticsAuthToken);
  }

  // set hostnameVerification
  if (ticsConfig.hostnameVerification) {
    exportVariable('TICSHOSTNAMEVERIFICATION', ticsConfig.hostnameVerification);

    if (ticsConfig.hostnameVerification === '0' || ticsConfig.hostnameVerification === 'false') {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      Logger.Instance.debug('Hostname Verification disabled');
    }
  }

  // set trustStrategy
  if (ticsConfig.trustStrategy) {
    exportVariable('TICSTRUSTSTRATEGY', ticsConfig.trustStrategy);

    if (ticsConfig.trustStrategy === 'self-signed' || ticsConfig.trustStrategy === 'all') {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      Logger.Instance.debug(`Trust strategy set to ${ticsConfig.trustStrategy}`);
    }
  }
}

/**
 * Checks if prerequisites are met to run the Github Plugin.
 * If any of these checks fail it returns a message.
 * @returns Message containing why it failed the prerequisite.
 */
async function meetsPrerequisites() {
  let message;

  let viewerVersion = await getViewerVersion();

  if (githubConfig.eventName !== 'pull_request') {
    message = 'This action can only run on pull requests.';
  } else if (!satisfies(viewerVersion.version, '>=2022.4.0')) {
    message = `Minimum required TiCS Viewer version is 2022.4. Found version ${viewerVersion.version}.`;
  } else if (!isCheckedOut()) {
    message = 'No checkout found to analyze. Please perform a checkout before running the TiCS Action.';
  }

  return message;
}

/**
 * Checks if a .git directory exists to see if a checkout has been performed.
 * @returns Boolean value if the folder is found or not.
 */
function isCheckedOut() {
  if (!existsSync('.git')) {
    Logger.Instance.error('No git checkout found');
    return false;
  }
  return true;
}
