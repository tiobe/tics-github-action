import { decoratePullRequest } from './pull-request';
import { createErrorSummaryBody, createSummaryBody } from './summary';
import { githubConfig, actionConfig } from '../../configuration/_config';
import { postAnnotations } from '../../github/annotations';
import { Analysis, AnalysisResult } from '../../helper/interfaces';

/**
 * Decorate the action with annotations, the summary and an optional
 * comment in the Pull Request conversation.
 * @param analysisResult
 */
export async function decorateAction(analysisResult: AnalysisResult | undefined, analysis: Analysis) {
  let summaryBody;
  if (analysisResult) {
    summaryBody = createSummaryBody(analysisResult);
  } else {
    summaryBody = createErrorSummaryBody(analysis.errorList, analysis.warningList);
  }

  if (githubConfig.eventName === 'pull_request') {
    await decoratePullRequest(analysisResult?.passed ?? false, summaryBody);
  }

  if (analysisResult && actionConfig.postAnnotations) {
    postAnnotations(analysisResult.projectResults);
  }
}
