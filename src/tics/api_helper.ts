import { OutgoingHttpHeaders } from 'http';
import Logger from '../helper/logger';
import { httpClient, httpClientOptions, ticsConfig, viewerUrl } from '../configuration';
import { Analysis } from '../helper/interfaces';

/**
 * Executes a GET request to the given url.
 * @param url api url to perform a GET request for.
 * @returns Promise of the data retrieved from the response.
 */
export async function httpRequest(url: string): Promise<any> {
  var headers: OutgoingHttpHeaders = {
    XRequestedWith: 'tics'
  };

  if (ticsConfig.ticsAuthToken) {
    headers.Authorization = `Basic ${ticsConfig.ticsAuthToken}`;
  }

  httpClientOptions.headers = headers;

  return new Promise((resolve, reject) => {
    const req = httpClient.get(url, httpClientOptions, response => {
      let body = '';

      response.on('data', chunk => {
        body += chunk;
      });

      response.on('end', () => {
        switch (response.statusCode) {
          case 200:
            resolve(JSON.parse(body));
          case 302:
            Logger.Instance.exit(
              `HTTP request failed with status ${response.statusCode}. Please check if the given ticsConfiguration is correct (possibly http instead of https).`
            );
            break;
          case 400:
            Logger.Instance.exit(`HTTP request failed with status ${response.statusCode}. ${JSON.parse(body).alertMessages[0].header}`);
            break;
          case 401:
            Logger.Instance.exit(
              `HTTP request failed with status ${response.statusCode}. Please provide a valid TICSAUTHTOKEN in your configuration. Check ${viewerUrl}/Administration.html#page=authToken`
            );
            break;
          case 404:
            Logger.Instance.exit(`HTTP request failed with status ${response.statusCode}. Please check if the given ticsConfiguration is correct.`);
            break;
          default:
            Logger.Instance.exit(`HTTP request failed with status ${response.statusCode}. Please check if your configuration is correct.`);
            break;
        }
      });
    });

    req.on('error', error => {
      reject(error.message);
    });
  });
}

/**
 * Creates a cli summary of all errors and bugs based on the logLevel.
 * @param analysis the output of the TiCS analysis run.
 */
export function cliSummary(analysis: Analysis): void {
  switch (ticsConfig.logLevel) {
    case 'none':
      break;
    case 'debug':
      analysis.errorList.forEach(error => Logger.Instance.error(error));
      analysis.warningList.forEach(warning => Logger.Instance.warning(warning));
      break;
    case 'default':
    default:
      analysis.errorList.forEach(error => Logger.Instance.error(error));
      break;
  }
}

/**
 * Creates the TiCS install data from the TiCS Viewer.
 * @param url url given in the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TiCS install url.
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
    Logger.Instance.exit('Missing configuration api in the TiCS Viewer URL. Please check your workflow configuration.');
  }

  return baseUrl;
}

/**
 * Gets query value form a url
 * @param url The TiCS Explorer url (e.g. <ticsUrl>/Explorer.html#axes=Project%28c-demo%29%2CBranch%28main%)
 * @param query the query (e.g. Project)
 * @returns query value (e.g. c-demo)
 **/
export function getItemFromUrl(url: string, query: string): string {
  let regExpr = new RegExp(`${query}\\((.*?)\\)`);
  let cleanUrl = url.replace(/\+/g, '%20');
  let itemValue = decodeURIComponent(cleanUrl).match(regExpr);

  if (itemValue && itemValue.length >= 2) {
    Logger.Instance.debug(`Retrieved ${query} value: ${itemValue[1]}`);
    return itemValue[1];
  }

  return '';
}

/**
 * In case of project auto this returns the project name from the explorer url.
 * @param url the TiCS explorer url.
 * @returns project name.
 */
export function getProjectName(url: string): string {
  return ticsConfig.projectName === 'auto' ? getItemFromUrl(url, 'Project') : ticsConfig.projectName;
}
