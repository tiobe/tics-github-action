import { ticsCli, ticsConfig } from '../configuration/config.js';
import { RunDateResponse } from './interfaces.js';
import { logger } from '../helper/logger.js';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response.js';
import { joinUrl } from '../helper/url.js';
import { httpClient } from './http-client.js';

/**
 * Gets the date of the last QServer run the viewer knows of.
 * @returns the last QServer run date.
 * @throws Error if no date could be retrieved.
 */
export async function getLastQServerRunDate(): Promise<number> {
  const getRunDateUrl = joinUrl(ticsConfig.baseUrl, `api/public/v1/Measure?filters=Project(${ticsCli.project})&metrics=lastRunInDatabase`);
  try {
    logger.header('Retrieving the last QServer run date');
    logger.debug(`From ${getRunDateUrl}`);
    const response = await httpClient.get<RunDateResponse>(getRunDateUrl);
    logger.info(getRetryMessage(response, 'Retrieved the last QServer run date.'));
    logger.debug(JSON.stringify(response));
    if (response.data.data.length === 0) {
      throw Error('Request returned empty array');
    }
    if (!response.data.data[0].value) {
      // return -1 for projects that haven't run yet
      return -1;
    }
    return response.data.data[0].value / 1000;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving last QServer run date: ${message}`);
  }
}
