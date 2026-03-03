import { getRateLimit } from '../github/diagnostic.js';
import { Verdict } from '../helper/interfaces.js';
import { logger } from '../helper/logger.js';
import { runTicsAnalyzer } from '../tics/analyzer.js';

/**
 * Function for running the action in diagnostic mode.
 * @returns Verdict for a diagnostic run.
 */
export async function diagnosticAnalysis(): Promise<Verdict> {
  logger.header('Running action in diagnostic mode');

  await getRateLimit();

  const analysis = await runTicsAnalyzer('');

  const passed = analysis.completed && analysis.statusCode === 0;

  return {
    passed: passed,
    message: !passed ? 'Diagnostic run has failed.' : '',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };
}
