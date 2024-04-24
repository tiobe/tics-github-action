import { decorateAction } from '../action/decorate/action';
import { postToConversation } from '../action/decorate/pull-request';
import { createErrorSummaryBody, createNothingAnalyzedSummaryBody, createReviewComments } from '../action/decorate/summary';
import { actionConfig, githubConfig, ticsConfig } from '../configuration/_config';
import { getPostedComments, deletePreviousComments } from '../github/comments';
import { getChangedFilesOfCommit } from '../github/commits';
import { ChangedFile } from '../github/interfaces';
import { getChangedFilesOfPullRequest, changedFilesToFile } from '../github/pulls';
import { Analysis, AnalysisResult, ChangedFiles, ProjectResult, Verdict } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { runTicsAnalyzer } from '../tics/analyzer';
import { getItemFromUrl, getProjectName } from '../tics/url';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../viewer/analyzed-files';
import { getAnnotations } from '../viewer/annotations';
import { getQualityGate, getQualityGateUrl } from '../viewer/qualitygate';

export async function clientAnalysis(): Promise<Verdict> {
  const changedFiles = await getChangedFiles();

  const verdict = {
    passed: true,
    message: '',
    errorList: [],
    warningList: []
  };

  // if no changed files are found, return early
  if (changedFiles.files.length === 0) {
    logger.info('No changed files found to analyze.');
    return verdict;
  }

  const analysis = await runTicsAnalyzer(changedFiles.path);

  let failedMessage: string;
  if (analysis.explorerUrls.length === 0) {
    failedMessage = await processIncompleteAnalysis(analysis);
  } else {
    failedMessage = await processCompleteAnalysis(analysis.explorerUrls, changedFiles.files);
  }

  if (failedMessage !== '') {
    verdict.passed = false;
    verdict.message = failedMessage;
  }

  return verdict;
}

async function processIncompleteAnalysis(analysis: Analysis): Promise<string> {
  if (githubConfig.eventName === 'pull_request') {
    const previousComments = await getPostedComments();
    if (previousComments.length > 0) {
      await deletePreviousComments(previousComments);
    }
  }

  let failedMessage = '';
  let summaryBody: string;
  if (!analysis.completed) {
    failedMessage = 'Failed to complete TICS analysis.';
    summaryBody = createErrorSummaryBody(analysis.errorList, analysis.warningList);
  } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
    summaryBody = createNothingAnalyzedSummaryBody('No changed files applicable for TICS analysis quality gating.');
  } else {
    failedMessage = 'Explorer URL not returned from TICS analysis.';
    summaryBody = createErrorSummaryBody(analysis.errorList, analysis.warningList);
  }

  if (githubConfig.eventName === 'pull_request') {
    await postToConversation(false, summaryBody);
  }

  return failedMessage;
}

async function processCompleteAnalysis(explorerUrls: string[], changedFiles: ChangedFile[]): Promise<string> {
  const analysisResult = await getClientAnalysisResults(explorerUrls, changedFiles);

  if (analysisResult.missesQualityGate) {
    return 'Some quality gates could not be retrieved.';
  }

  // Construct message on how many projects failed the quality gate (if at least one fails).
  let failedMessage = '';

  const failedProjectQualityGateCount = analysisResult.projectResults.filter(p => p.qualityGate && !p.qualityGate.passed).length;
  if (failedProjectQualityGateCount >= 1) {
    if (explorerUrls.length > 1) {
      failedMessage = `${failedProjectQualityGateCount} out of ${explorerUrls.length} projects`;
    } else {
      failedMessage = 'Project';
    }
    failedMessage += ` failed quality gate(s)`;
  }

  await decorateAction(analysisResult);

  return failedMessage;
}

async function getChangedFiles(): Promise<ChangedFiles> {
  let changedFilesFilePath: string;
  let changedFiles: ChangedFile[];

  if (githubConfig.eventName === 'pull_request') {
    changedFiles = await getChangedFilesOfPullRequest();
  } else {
    changedFiles = await getChangedFilesOfCommit();
  }

  if (ticsConfig.filelist) {
    changedFilesFilePath = ticsConfig.filelist;
  } else if (changedFiles.length > 0) {
    changedFilesFilePath = changedFilesToFile(changedFiles);
  } else {
    changedFilesFilePath = '';
  }

  return {
    files: changedFiles,
    path: changedFilesFilePath
  };
}

/**
 * Retrieve all analysis results from the viewer in one convenient object.
 * @param explorerUrls All the explorer urls gotten from the TICS analysis.
 * @param changedFiles The changed files gotten from GitHub.
 * @returns Object containing the results of the analysis.
 */
export async function getClientAnalysisResults(explorerUrls: string[], changedFiles: ChangedFile[]): Promise<AnalysisResult> {
  const hasExplorerUrl = explorerUrls.length !== 0;
  const analysisResult: AnalysisResult = {
    passed: hasExplorerUrl,
    passedWithWarning: false,
    missesQualityGate: hasExplorerUrl,
    projectResults: []
  };

  for (const url of explorerUrls) {
    const cdtoken = getItemFromUrl(url, 'ClientData');

    const projectResult: ProjectResult = {
      project: getProjectName(url),
      explorerUrl: url,
      // import of itself is used for mocking the function in the same file
      analyzedFiles: await getAnalyzedFiles(getAnalyzedFilesUrl({ cdtoken }))
    };

    // import of itself is used for mocking the function in the same file
    const qualityGate = await getQualityGate(getQualityGateUrl({ cdtoken }));

    if (!qualityGate) {
      analysisResult.passed = false;
      analysisResult.missesQualityGate = true;
    } else {
      projectResult.qualityGate = qualityGate;

      if (!qualityGate.passed) {
        analysisResult.passed = false;
      }

      if (actionConfig.postAnnotations) {
        // import of itself is used for mocking the function in the same file
        const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
        if (annotations.length > 0) {
          projectResult.reviewComments = createReviewComments(annotations, changedFiles);
        }
      }
    }

    analysisResult.projectResults.push(projectResult);
  }

  analysisResult.passedWithWarning =
    analysisResult.passed && analysisResult.projectResults.filter(p => p.qualityGate?.passed && p.qualityGate.passedWithWarning).length > 0;

  return analysisResult;
}
