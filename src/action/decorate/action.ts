import { decoratePullRequest } from './pull-request';
import { createSummaryBody } from './summary';
import { githubConfig, actionConfig } from '../../configuration/_config';
import { postAnnotations } from '../../github/annotations';
import { AnalysisResult } from '../../helper/interfaces';

/**
 * Decorate the action with annotations, the summary and an optional
 * comment in the Pull Request conversation.
 * @param analysisResult
 */
export async function decorateAction(analysisResult: AnalysisResult) {
  const summaryBody = createSummaryBody(analysisResult);

  if (githubConfig.eventName === 'pull_request') {
    await decoratePullRequest(analysisResult.passed, summaryBody);
  }

  if (actionConfig.postAnnotations) {
    postAnnotations(analysisResult.projectResults);
  }
}
