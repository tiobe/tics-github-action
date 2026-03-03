import { Verdict } from '../helper/interfaces.js';
import { logger } from '../helper/logger.js';
import { runTicsAnalyzer } from '../tics/analyzer.js';
import { getChangedFiles } from './helper/changed-files.js';
import { processCompleteAnalysis, processIncompleteAnalysis } from './client/process-analysis.js';

export async function clientAnalysis(): Promise<Verdict> {
  const changedFiles = await getChangedFiles();

  const verdict: Verdict = {
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

  verdict.errorList = analysis.errorList;
  verdict.warningList = analysis.warningList;

  let failedMessage: string;
  if (analysis.explorerUrls.length === 0) {
    failedMessage = await processIncompleteAnalysis(analysis);
  } else {
    failedMessage = await processCompleteAnalysis(analysis, changedFiles.files);
  }

  if (failedMessage !== '') {
    verdict.passed = false;
    verdict.message = failedMessage;
  }

  return verdict;
}
