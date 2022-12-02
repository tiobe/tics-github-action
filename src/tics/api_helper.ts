import { ExecOptions } from '@actions/exec';
import { HttpClient } from '@actions/http-client';
import { OutgoingHttpHeaders } from 'http';
import { RequestOptions } from 'https';
import ProxyAgent from 'proxy-agent';
import Logger from '../helper/logger';
import { ticsConfig } from '../github/configuration';

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
      var baseUrl = getTiCSWebBaseUrlFromUrl(new URL(url).href);
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
 * @param ticsWebBaseUrl url given in the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TiCS install url.
 */
export function getInstallTiCSApiUrl(ticsWebBaseUrl: string, os: string): string {
  const installTICSAPI = new URL(ticsConfig.ticsConfiguration);
  installTICSAPI.searchParams.append('platform', os);
  installTICSAPI.searchParams.append('url', ticsWebBaseUrl);

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

export function getOptions(): ExecOptions {
  return {
    silent: true,
    listeners: {
      stdout(data: Buffer) {
        Logger.Instance.info(data.toString());
      },
      stderr(data: Buffer) {
        Logger.Instance.info(data.toString());
      }
    }
  };
}
