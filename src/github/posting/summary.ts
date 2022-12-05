import { ticsConfig } from '../configuration';

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TiCS run.
 * @param warningList list containing all the warnings found in the TiCS run.
 * @returns string containing the error summary.
 */
export function createErrorSummary(errorList: string[], warningList: string[]): string {
  let summary = '## TICS Quality Gate\r\n\r\n### :x: Failed';

  if (errorList.length > 0) {
    summary += '\r\n\r\n #### The following errors have occurred during analysis:\r\n\r\n';
    errorList.forEach(error => (summary += `> :x: ${error}\r\n`));
  }
  if (warningList.length > 0 && ticsConfig.logLevel === 'debug') {
    summary += '\r\n\r\n #### The following warnings have occurred during analysis:\r\n\r\n';
    warningList.forEach(warning => (summary += `> :warning: ${warning}\r\n`));
  }

  return summary;
}
