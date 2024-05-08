import { decorateAction } from '../action/decorate/action';
import { postToConversation } from '../action/decorate/pull-request';
import { createNothingAnalyzedSummaryBody } from '../action/decorate/summary';
import { githubConfig } from '../configuration/_config';
import { AnalysisResult, Verdict } from '../helper/interfaces';
import { runTicsAnalyzer } from '../tics/analyzer';
import { getAnalysisResult } from './qserver/analysis-result';

/**
 * Function for running the action in QServer mode.
 * @returns Verdict for a QServer run.
 */
export async function qServerAnalysis(): Promise<Verdict> {
  const analysis = await runTicsAnalyzer('');

  const verdict: Verdict = {
    passed: analysis.completed && analysis.statusCode === 0,
    message: '',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };

  if (!verdict.passed) {
    verdict.message = 'Failed to complete TICSQServer analysis.';
  } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
    const summaryBody = createNothingAnalyzedSummaryBody('No changed files applicable for TICS analysis quality gating.');
    if (githubConfig.eventName === 'pull_request') {
      await postToConversation(false, summaryBody);
    }
  } else {
    let analysisResult: AnalysisResult | undefined;
    try {
      analysisResult = await getAnalysisResult();
    } catch (error) {
      verdict.passed = false;
      verdict.message = error instanceof Error ? error.message : 'Something went wrong: reason unknown';
    }

    await decorateAction(analysisResult, analysis);
  }

  return verdict;
}
