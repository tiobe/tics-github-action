import { Verdict } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { runTicsAnalyzer } from '../tics/analyzer';

/**
 * Function for running the action in diagnostic mode.
 * @returns Verdict for a diagnostic run.
 */
export async function diagnosticAnalysis(): Promise<Verdict> {
  logger.header('Running action in diagnostic mode');
  const analysis = await runTicsAnalyzer('');

  const passed = analysis.statusCode === 0;

  return {
    passed: passed,
    message: !passed ? 'Diagnostic run has failed.' : '',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };
}
