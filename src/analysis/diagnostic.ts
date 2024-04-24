import { Verdict } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { runTicsAnalyzer } from '../tics/analyzer';

/**
 * Function for running the action in diagnostic mode.
 * @returns Verdict for a diagnostic run.
 */
export async function diagnosticAnalysis(): Promise<Verdict> {
  logger.header('Running action in diagnostic mode');
  let analysis = await runTicsAnalyzer('');

  return {
    passed: analysis.statusCode === 0,
    message: 'Diagnostic run has failed.',
    errorList: analysis.errorList,
    warningList: analysis.warningList
  };
}
