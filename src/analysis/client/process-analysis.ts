import { decorateAction } from '../../action/decorate/action.js';
import { postToConversation } from '../../action/decorate/pull-request.js';
import { createErrorSummaryBody, createNothingAnalyzedSummaryBody } from '../../action/decorate/summary.js';
import { githubConfig } from '../../configuration/config.js';
import { getPostedComments, deletePreviousComments } from '../../github/comments.js';
import { ChangedFile } from '../../github/interfaces.js';
import { createAndSetOutput } from '../../github/output.js';
import { Analysis } from '../../helper/interfaces.js';
import { getClientAnalysisResults } from './analysis-results.js';

export async function processIncompleteAnalysis(analysis: Analysis): Promise<string> {
  if (githubConfig.event.isPullRequest) {
    const previousComments = await getPostedComments();
    if (previousComments.length > 0) {
      await deletePreviousComments(previousComments);
    }
  }

  let failedMessage = '';
  let summaryBody: string;
  if (!analysis.completed) {
    failedMessage = 'Failed to complete TICS analysis.';
    summaryBody = await createErrorSummaryBody(analysis.errorList, analysis.warningList);
  } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
    summaryBody = await createNothingAnalyzedSummaryBody('No changed files applicable for TICS analysis quality gating.');
  } else {
    failedMessage = 'Explorer URL not returned from TICS analysis.';
    summaryBody = await createErrorSummaryBody(analysis.errorList, analysis.warningList);
  }

  if (githubConfig.event.isPullRequest) {
    await postToConversation(false, summaryBody);
  }

  return failedMessage;
}

export async function processCompleteAnalysis(analysis: Analysis, changedFiles: ChangedFile[]): Promise<string> {
  const analysisResult = await getClientAnalysisResults(analysis.explorerUrls, changedFiles);

  await decorateAction(analysisResult, analysis);
  createAndSetOutput(analysisResult.projectResults);

  return analysisResult.message;
}
