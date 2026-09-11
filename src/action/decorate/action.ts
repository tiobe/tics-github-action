import { decoratePullRequest } from './pull-request.js';
import { createErrorSummaryBody, createSummaryBody } from './summary.js';
import { githubConfig, actionConfig } from '../../configuration/config.js';
import { postAnnotations } from '../../github/annotations.js';
import { Analysis, AnalysisResult } from '../../helper/interfaces.js';

/**
 * Decorate the action with annotations, the summary and an optional
 * comment in the Pull Request conversation.
 * @param analysisResult
 */
export async function decorateAction(analysisResult: AnalysisResult | undefined, analysis: Analysis): Promise<void> {
  let summaryBody;
  if (analysisResult) {
    summaryBody = await createSummaryBody(analysisResult);
  } else {
    summaryBody = await createErrorSummaryBody(analysis.errorList, analysis.warningList);
  }

  if (githubConfig.event.isPullRequest) {
    await decoratePullRequest(analysisResult?.passed ?? false, summaryBody);
  }

  if (analysisResult && actionConfig.postAnnotations) {
    await postAnnotations(analysisResult.projectResults);
  }
}
