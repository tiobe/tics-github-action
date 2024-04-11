import { logger } from '../helper/logger';
import { githubConfig, ticsConfig } from '../configuration';
import { Analysis } from '../helper/interfaces';

/**
 * Creates a cli summary of all errors and bugs based on the logLevel.
 * @param analysis the output of the TICS analysis run.
 */
export function cliSummary(analysis: Analysis): void {
  analysis.errorList.forEach(error => logger.error(error));
  if (githubConfig.debugger) {
    analysis.warningList.forEach(warning => logger.warning(warning));
  }
}

/**
 * Gets query value form a url
 * @param url The TICS Explorer url (e.g. <ticsUrl>/Explorer.html#axes=Project%28c-demo%29%2CBranch%28main%)
 * @param query the query (e.g. Project)
 * @returns query value (e.g. c-demo)
 **/
export function getItemFromUrl(url: string, query: string): string {
  let regExpr = new RegExp(`${query}\\((.*?)\\)`);
  let cleanUrl = url.replace(/\+/g, '%20');
  let itemValue = RegExp(regExpr).exec(decodeURIComponent(cleanUrl));

  if (itemValue && itemValue.length >= 2) {
    logger.debug(`Retrieved ${query} value: ${itemValue[1]}`);
    return itemValue[1];
  }

  return '';
}

/**
 * In case of project auto this returns the project name from the explorer url.
 * @param url the TICS explorer url.
 * @returns project name.
 */
export function getProjectName(url: string): string {
  return ticsConfig.project === 'auto' ? getItemFromUrl(url, 'Project') : ticsConfig.project;
}
