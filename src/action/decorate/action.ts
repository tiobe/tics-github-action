import { decoratePullRequest } from './pull-request';
import { createErrorSummaryBody, createSummaryBody } from './summary';
import { githubConfig, actionConfig } from '../../configuration/config';
import { postAnnotations } from '../../github/annotations';
import { Analysis, AnalysisResult } from '../../helper/interfaces';

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
