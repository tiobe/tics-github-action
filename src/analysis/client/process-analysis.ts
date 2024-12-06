import { decorateAction } from '../../action/decorate/action';
import { postToConversation } from '../../action/decorate/pull-request';
import { createErrorSummaryBody, createNothingAnalyzedSummaryBody } from '../../action/decorate/summary';
import { githubConfig } from '../../configuration/config';
import { getPostedComments, deletePreviousComments } from '../../github/comments';
import { ChangedFile } from '../../github/interfaces';
import { Analysis } from '../../helper/interfaces';
import { getClientAnalysisResults } from './analysis-results';

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

  if (analysisResult.missesQualityGate) {
    return 'Some quality gates could not be retrieved.';
  }

  // Construct message on how many projects failed the quality gate (if at least one fails).
  let failedMessage = '';

  const failedProjectQualityGateCount = analysisResult.projectResults.filter(p => p.qualityGate && !p.qualityGate.passed).length;
  if (failedProjectQualityGateCount >= 1) {
    if (analysis.explorerUrls.length > 1) {
      failedMessage = `${failedProjectQualityGateCount.toString()} out of ${analysis.explorerUrls.length.toString()} projects`;
    } else {
      failedMessage = 'Project';
    }
    failedMessage += ` failed quality gate(s)`;
  }

  await decorateAction(analysisResult, analysis);

  return failedMessage;
}
