import { ticsCli } from '../configuration/_config';
import { logger } from '../helper/logger';

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
  return ticsCli.project === 'auto' ? getItemFromUrl(url, 'Project') : ticsCli.project;
}
