import { HttpClient } from '@actions/http-client';
import { OutgoingHttpHeaders } from 'http';
import { RequestOptions } from 'https';
import ProxyAgent from 'proxy-agent';
import Logger from '../helper/logger';
import { baseUrl, ticsConfig } from '../github/configuration';
import { Analysis } from '../helper/models';

/**
 * Executes a GET request to the given url.
 * @param url api url to perform a GET request for.
 * @returns Promise of the data retrieved from the response.
 */
export async function httpRequest(url: string): Promise<any> {
  const options: RequestOptions = {
    rejectUnauthorized: ticsConfig.hostnameVerification,
    agent: new ProxyAgent()
  };
  const headers: OutgoingHttpHeaders = {
    Authorization: ticsConfig.ticsAuthToken ? `Basic ${ticsConfig.ticsAuthToken}` : undefined,
    XRequestedWith: 'tics'
  };
  const response = await new HttpClient('http-client', [], options).get(url, headers);

  switch (response.message.statusCode) {
    case 200:
      return JSON.parse(await response.readBody());
    case 302:
      Logger.Instance.exit(
        `HTTP request failed with status ${response.message.statusCode}. Please check if the given ticsConfiguration is correct (possibly http instead of https).`
      );
      break;
    case 400:
      Logger.Instance.exit(
        `HTTP request failed with status ${response.message.statusCode}. ${JSON.parse(await response.readBody()).alertMessages[0].header}`
      );
      break;
    case 401:
      Logger.Instance.exit(
        `HTTP request failed with status ${response.message.statusCode}. Please provide a working TICSAUTHTOKEN in your configuration. Check ${baseUrl}/Administration.html#page=authToken`
      );
      break;
    case 404:
      Logger.Instance.exit(`HTTP request failed with status ${response.message.statusCode}. Please check if the given ticsConfiguration is correct.`);
      break;
    default:
      Logger.Instance.exit(`HTTP request failed with status ${response.message.statusCode}. Please check if your configuration is correct.`);
      break;
  }
}

/**
 * Creates the TiCS install data from the TiCS Viewer.
 * @param url url given in the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TiCS install url.
 */
export function getInstallTiCSApiUrl(url: string, os: string): string {
  const installTICSAPI = new URL(ticsConfig.ticsConfiguration);
  installTICSAPI.searchParams.append('platform', os);
  installTICSAPI.searchParams.append('url', url);

  return installTICSAPI.href;
}

/**
 * Returns the TIOBE web base url.
 * @param url url given in the ticsConfiguration.
 * @returns TIOBE web base url.
 */
export function getTiCSWebBaseUrlFromUrl(url: string) {
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
 * Creates a cli summary of all errors and bugs based on the logLevel.
 * @param analysis the output of the TiCS analysis run.
 */
export function cliSummary(analysis: Analysis) {
  switch (ticsConfig.logLevel) {
    case 'debug':
      analysis.errorList.forEach(error => Logger.Instance.error(error));
      analysis.warningList.forEach(warning => Logger.Instance.warning(warning));
      break;
    case 'default':
      analysis.errorList.forEach(error => Logger.Instance.error(error));
    case 'none':
      break;
  }
}

/**
 * Gets query value form a url
 * @param url The TiCS Explorer url (e.g. <ticsUrl>/Explorer.html#axes=Project%28c-demo%29%2CBranch%28main%)
 * @param query the query (e.g. Project)
 * @returns query value (e.g. c-demo)
 **/
export function getItemFromUrl(url: string, query: string) {
  let regExpr = new RegExp(`${query}\\((.*?)\\)`);
  let itemValue = decodeURIComponent(url).match(regExpr);

  if (itemValue && itemValue.length >= 2) {
    Logger.Instance.debug(`Retrieved ${query} value: ${itemValue[1]}`);
    return itemValue[1];
  }

  return '';
}
