import { decorateAction } from '../action/decorate/action';
import { postToConversation } from '../action/decorate/pull-request';
import { createErrorSummaryBody, createNothingAnalyzedSummaryBody } from '../action/decorate/summary';
import { githubConfig } from '../configuration/config';
import { createAndSetOutput } from '../github/output';
import { AnalysisResult, Verdict } from '../helper/interfaces';
import { runTicsAnalyzer } from '../tics/analyzer';
import { getLastQServerRunDate } from '../viewer/qserver';
import { getAnalysisResult } from './qserver/analysis-result';

/**
 * Function for running the action in QServer mode.
 * @returns Verdict for a QServer run.
 */
export async function qServerAnalysis(): Promise<Verdict> {
  const oldDate = await getLastQServerRunDate();

  const analysis = await runTicsAnalyzer('');

  const newDate = await getLastQServerRunDate();

  const verdict: Verdict = {
    passed: analysis.completed && analysis.statusCode === 0 && newDate !== oldDate,
    message: '',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };

  if (!verdict.passed) {
    verdict.message = 'Failed to complete TICSQServer analysis.';

    const summaryBody = await createErrorSummaryBody(analysis.errorList, analysis.warningList);
    if (githubConfig.event.isPullRequest) {
      await postToConversation(false, summaryBody);
    }
  } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
    const summaryBody = await createNothingAnalyzedSummaryBody('No changed files applicable for TICS analysis quality gating.');
    if (githubConfig.event.isPullRequest) {
      await postToConversation(false, summaryBody);
    }
  } else {
    let analysisResult: AnalysisResult | undefined;
    try {
      analysisResult = await getAnalysisResult(newDate);
      if (!analysisResult.passed) {
        verdict.passed = false;
        verdict.message = analysisResult.message;
      }
    } catch (error) {
      verdict.passed = false;
      verdict.message = error instanceof Error ? error.message : 'Something went wrong: reason unknown';
    }

    await decorateAction(analysisResult, analysis);

    if (analysisResult) {
      createAndSetOutput(analysisResult.projectResults);
    }
  }

  return verdict;
}
