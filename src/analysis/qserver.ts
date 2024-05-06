import { decorateAction } from '../action/decorate/action';
import { postToConversation } from '../action/decorate/pull-request';
import { createNothingAnalyzedSummaryBody, createReviewComments } from '../action/decorate/summary';
import { actionConfig, githubConfig, ticsCli, ticsConfig } from '../configuration/_config';
import { AnalysisResult, TicsReviewComments, Verdict } from '../helper/interfaces';
import { joinUrl } from '../helper/url';
import { runTicsAnalyzer } from '../tics/analyzer';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../viewer/analyzed-files';
import { getAnnotations } from '../viewer/annotations';
import { getLastQServerRunDate } from '../viewer/qserver';
import { getQualityGate, getQualityGateUrl } from '../viewer/qualitygate';
import { getChangedFiles } from './helper/changed-files';

/**
 * Function for running the action in QServer mode.
 * @returns Verdict for a QServer run.
 */
export async function qServerAnalysis(): Promise<Verdict> {
  const analysis = await runTicsAnalyzer('');

  const verdict: Verdict = {
    passed: analysis.completed,
    message: '',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };

  if (!analysis.completed) {
    verdict.message = 'Failed to complete TICSQServer analysis.';
  } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
    let summaryBody = createNothingAnalyzedSummaryBody('No changed files applicable for TICS analysis quality gating.');
    if (githubConfig.eventName === 'pull_request') {
      await postToConversation(false, summaryBody);
    }
  } else {
    let analysisResult!: AnalysisResult;
    try {
      analysisResult = await getAnalysisResult();
    } catch (error) {
      verdict.passed = false;
      verdict.message = error instanceof Error ? error.message : 'Something went wrong: reason unknown';
    }

    await decorateAction(analysisResult);
  }

  return verdict;
}

async function getAnalysisResult() {
  const date = await getLastQServerRunDate();
  const qualityGate = await getQualityGate(getQualityGateUrl({ date }));
  const analyzedFiles = await getAnalyzedFiles(getAnalyzedFilesUrl({ date }));

  let reviewComments: TicsReviewComments | undefined;
  if (actionConfig.postAnnotations) {
    let changedFiles = await getChangedFiles();

    const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
    if (annotations.length > 0) {
      reviewComments = createReviewComments(annotations, changedFiles.files);
    }
  }

  return {
    passed: qualityGate.passed,
    passedWithWarning: qualityGate.passedWithWarning ?? false,
    failureMessage: '',
    missesQualityGate: false,
    projectResults: [
      {
        project: ticsCli.project,
        explorerUrl: joinUrl(ticsConfig.baseUrl, qualityGate.url),
        analyzedFiles: analyzedFiles,
        qualityGate: qualityGate,
        reviewComments: reviewComments
      }
    ]
  };
}
