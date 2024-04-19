import { existsSync } from 'fs';
import { deletePreviousComments, postComment, postErrorComment, postNothingAnalyzedComment, getPostedComments } from './github/comments';
import { baseUrl, githubConfig, ticsConfig } from './configuration';
import { changedFilesToFile, getChangedFilesOfPullRequest } from './github/pulls';
import { logger } from './helper/logger';
import { runTicsAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getClientAnalysisResults, getViewerVersion } from './tics/fetcher';
import { postNothingAnalyzedReview, postReview } from './github/review';
import { createSummaryBody } from './helper/summary';
import { getPostedReviewComments, postAnnotations, deletePreviousReviewComments } from './github/annotations';
import { Events, Mode, TrustStrategy } from './helper/enums';
import { exportVariable, summary } from '@actions/core';
import { Analysis, AnalysisResult, ChangedFiles } from './helper/interfaces';
import { uploadArtifact } from './github/artifacts';
import { getChangedFilesOfCommit } from './github/commits';
import { coerce, satisfies } from 'semver';
import { isOneOf } from './helper/compare';
import { ChangedFile } from './github/interfaces';
import { getAnalyzedFilesQServer, getLastQServerRunDate, getQServerQualityGate } from './tics/qserver_fetcher';
import { joinUrl } from './helper/url';

let actionFailed: string | undefined = undefined;

// export for testing purposes
export const resetActionFailed = () => (actionFailed = undefined);

main().catch((error: unknown) => {
  let message = 'TICS failed with unknown reason';
  if (error instanceof Error) message = error.message;
  logger.setFailed(message);
});

// exported for testing purposes
export async function main(): Promise<void> {
  logger.info(`Running action on event: ${githubConfig.eventName}`);

  configure();

  await meetsPrerequisites();

  let analysis: Analysis | undefined;
  switch (ticsConfig.mode) {
    case Mode.DIAGNOSTIC:
      analysis = await diagnosticAnalysis();
      break;
    case Mode.CLIENT:
      analysis = await clientAnalysis();
      break;
    case Mode.QSERVER:
      analysis = await qServerAnalysis();
      break;
  }

  if (analysis && (ticsConfig.tmpdir || githubConfig.debugger)) {
    await uploadArtifact();
  }

  if (actionFailed !== undefined) {
    logger.setFailed(actionFailed);
  }

  if (analysis) {
    cliSummary(analysis);
  }

  // Write the summary made to the action summary.
  await summary.write({ overwrite: true });
}

/**
 * Function for running the action in diagnostic mode.
 * @returns Analysis result from a diagnostic run.
 */
async function diagnosticAnalysis(): Promise<Analysis> {
  logger.header('Running action in diagnostic mode');
  let analysis = await runTicsAnalyzer('');

  if (analysis.statusCode !== 0) {
    actionFailed = 'Diagnostic run has failed.';
  }

  return analysis;
}

async function clientAnalysis(): Promise<Analysis | undefined> {
  let analysis: Analysis | undefined;
  const changedFiles = await getChangedFiles();

  if (changedFiles) {
    analysis = await runTicsClient(changedFiles);

    if (analysis.explorerUrls.length > 0) {
      try {
        await processClientAnalysis(analysis, changedFiles);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Something went wrong: reason unknown';
        logger.error(message);

        actionFailed = message;
      }
    }
  }

  return analysis;
}

async function qServerAnalysis(): Promise<Analysis | undefined> {
  const analysis = await runTicsAnalyzer('');
  const date = await getLastQServerRunDate();

  const qualityGate = await getQServerQualityGate(date);
  const analyzedFiles = await getAnalyzedFilesQServer(date);

  const analysisResult: AnalysisResult = {
    passed: qualityGate.passed,
    passedWithWarning: qualityGate.passedWithWarning ?? false,
    failureMessage: '',
    missesQualityGate: false,
    projectResults: [
      {
        project: ticsConfig.project,
        explorerUrl: joinUrl(baseUrl, qualityGate.url),
        analyzedFiles: analyzedFiles,
        qualityGate: qualityGate
      }
    ]
  };

  await processAnalysisResult(analysisResult);

  return analysis;
}

async function processClientAnalysis(analysis: Analysis, changedFiles: ChangedFiles) {
  const analysisResult = await getClientAnalysisResults(analysis.explorerUrls, changedFiles.files);

  if (analysisResult.missesQualityGate) {
    throw Error('Some quality gates could not be retrieved.');
  }

  await processAnalysisResult(analysisResult);
}

async function processAnalysisResult(analysisResult: AnalysisResult) {
  const summaryBody = createSummaryBody(analysisResult);

  if (githubConfig.eventName === 'pull_request') {
    await decoratePullRequest(analysisResult.passed, summaryBody);
  }

  if (ticsConfig.postAnnotations) {
    postAnnotations(analysisResult.projectResults);
  }

  if (!analysisResult.passed) {
    actionFailed = analysisResult.failureMessage;
  }
}

async function decoratePullRequest(passed: boolean, summaryBody: string) {
  const previousReviewComments = await getPostedReviewComments();
  if (previousReviewComments.length > 0) {
    await deletePreviousReviewComments(previousReviewComments);
  }

  const previousComments = await getPostedComments();
  if (previousComments.length > 0) {
    await deletePreviousComments(previousComments);
  }

  await postToConversation(true, summaryBody, passed ? Events.APPROVE : Events.REQUEST_CHANGES);
}

async function getChangedFiles(): Promise<ChangedFiles | undefined> {
  let changedFilesFilePath = undefined;
  let changedFiles: ChangedFile[];

  if (githubConfig.eventName === 'pull_request') {
    changedFiles = await getChangedFilesOfPullRequest();
  } else {
    changedFiles = await getChangedFilesOfCommit();
  }

  if (ticsConfig.filelist) {
    changedFilesFilePath = ticsConfig.filelist;
  } else {
    if (changedFiles.length <= 0) {
      logger.info('No changed files found to analyze.');
      return;
    }
    changedFilesFilePath = changedFilesToFile(changedFiles);
  }

  return {
    files: changedFiles,
    path: changedFilesFilePath
  };
}

async function runTicsClient(changedFiles: ChangedFiles): Promise<Analysis> {
  const analysis = await runTicsAnalyzer(changedFiles.path);

  if (analysis.explorerUrls.length === 0) {
    const previousComments = await getPostedComments();

    if (previousComments.length > 0) {
      await deletePreviousComments(previousComments);
    }

    if (!analysis.completed) {
      actionFailed = 'Failed to run TICS Github Action.';
      await postErrorComment(analysis);
    } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
      await postToConversation(false, 'No changed files applicable for TICS analysis quality gating.');
    } else {
      actionFailed = 'Explorer URL not returned from TICS analysis.';
      await postErrorComment(analysis);
    }
  }

  return analysis;
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
    } else if (ticsConfig.pullRequestApproval) {
      await postNothingAnalyzedReview(body);
    } else {
      await postNothingAnalyzedComment(body);
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

  if (ticsConfig.mode !== Mode.QSERVER) {
    exportVariable('TICSIDE', 'GITHUB');
  }

  // set ticsAuthToken
  if (ticsConfig.ticsAuthToken) {
    exportVariable('TICSAUTHTOKEN', ticsConfig.ticsAuthToken);
  }

  // set hostnameVerification
  exportVariable('TICSHOSTNAMEVERIFICATION', ticsConfig.hostnameVerification);

  if (!ticsConfig.hostnameVerification) {
    exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
    logger.debug('Hostname Verification disabled');
  }

  // set trustStrategy
  exportVariable('TICSTRUSTSTRATEGY', ticsConfig.trustStrategy);

  if (isOneOf(ticsConfig.trustStrategy, TrustStrategy.SELFSIGNED, TrustStrategy.ALL)) {
    exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
    logger.debug(`Trust strategy set to ${ticsConfig.trustStrategy}`);
  }
}

/**
 * Checks if prerequisites are met to run the Github Plugin.
 * If any of these checks fail it returns a message.
 */
async function meetsPrerequisites(): Promise<void> {
  const viewerVersion = await getViewerVersion();
  const cleanViewerVersion = coerce(viewerVersion.version);
  if (!cleanViewerVersion || !satisfies(cleanViewerVersion, '>=2022.4.0')) {
    const version = cleanViewerVersion?.toString() ?? 'unknown';
    throw Error(`Minimum required TICS Viewer version is 2022.4. Found version ${version}.`);
  } else if (ticsConfig.mode === Mode.DIAGNOSTIC) {
    // No need for checked out repository.
  } else if (githubConfig.eventName !== 'pull_request' && !ticsConfig.filelist) {
    throw Error('If the the action is run outside a pull request it should be run with a filelist.');
  } else if (!isCheckedOut()) {
    throw Error('No checkout found to analyze. Please perform a checkout before running the TICS Action.');
  } else if (ticsConfig.retryCodes.some(isNaN)) {
    throw Error('Given retry codes could not be parsed. Please check if the input is correct.');
  }
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
