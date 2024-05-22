import { githubConfig } from '../../configuration/config';
import { Verdict } from '../../helper/interfaces';
import { logger } from '../../helper/logger';

/**
 * Creates a cli summary of all errors and bugs based on the logLevel.
 * @param verdict the verdict of the TICS analysis.
 */
export function postCliSummary(verdict: Verdict): void {
  verdict.errorList.forEach(error => {
    logger.error(error);
  });
  if (githubConfig.debugger) {
    verdict.warningList.forEach(warning => {
      logger.warning(warning);
    });
  }
}
