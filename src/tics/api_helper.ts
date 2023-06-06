import { OutgoingHttpHeaders } from 'http';
import { logger } from '../helper/logger';
import { githubConfig, requestInit, ticsConfig, viewerUrl } from '../configuration';
import { Analysis, HttpResponse } from '../helper/interfaces';
import fetch from 'node-fetch';

/**
 * Executes a GET request to the given url.
 * @param url api url to perform a GET request for.
 * @returns Promise of the data retrieved from the response.
 */
export async function httpRequest<T>(url: string): Promise<T | undefined> {
  var headers: OutgoingHttpHeaders = {
    XRequestedWith: 'tics'
  };
  if (ticsConfig.ticsAuthToken) {
    headers.Authorization = `Basic ${ticsConfig.ticsAuthToken}`;
  }

  requestInit.headers = headers;

  const response = await fetch(url, requestInit);

  switch (response.status) {
    case 200:
      return <T>(<unknown>response.json());
    case 302:
      logger.exit(
        `HTTP request failed with status ${response.status}. Please check if the given ticsConfiguration is correct (possibly http instead of https).`
      );
      break;
    case 400:
      logger.exit(`HTTP request failed with status ${response.status}. ${(<HttpResponse>await response.json()).alertMessages[0].header}`);
      break;
    case 401:
      logger.exit(
        `HTTP request failed with status ${response.status}. Please provide a valid TICSAUTHTOKEN in your configuration. Check ${viewerUrl}/Administration.html#page=authToken`
      );
      break;
    case 403:
      logger.exit(`HTTP request failed with status ${response.status}. Forbidden call: ${url}`);
      break;
    case 404:
      logger.exit(`HTTP request failed with status ${response.status}. Please check if the given ticsConfiguration is correct.`);
      break;
    default:
      logger.exit(`HTTP request failed with status ${response.status}. Please check if your configuration is correct.`);
      break;
  }
  return;
}

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
 * Creates the TICS install data from the TICS Viewer.
 * @param url url given in the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TICS install url.
 */
export function getInstallTicsApiUrl(url: string, os: string): string {
  const installTicsApi = new URL(ticsConfig.ticsConfiguration);
  installTicsApi.searchParams.append('platform', os);
  installTicsApi.searchParams.append('url', url);

  return installTicsApi.href;
}

/**
 * Returns the TIOBE web base url.
 * @param url url given in the ticsConfiguration.
 * @returns TIOBE web base url.
 */
export function getTicsWebBaseUrlFromUrl(url: string): string {
  const cfgMarker = 'cfg?name=';
  const apiMarker = '/api/';
  let baseUrl = '';

  if (url.includes(apiMarker + cfgMarker)) {
    baseUrl = url.split(apiMarker)[0];
  } else {
    logger.exit('Missing configuration api in the TICS Viewer URL. Please check your workflow configuration.');
  }

  return baseUrl;
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
  let itemValue = decodeURIComponent(cleanUrl).match(regExpr);

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
  return ticsConfig.projectName === 'auto' ? getItemFromUrl(url, 'Project') : ticsConfig.projectName;
}
