import { githubConfig } from '../../configuration/config.js';
import { Verdict } from '../../helper/interfaces.js';
import { logger } from '../../helper/logger.js';

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
