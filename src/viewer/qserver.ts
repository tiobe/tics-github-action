import { ticsCli, ticsConfig } from '../configuration/_config';
import { RunDateResponse } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './_http-client';

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
    return response.data.data[0].value / 1000;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving last QServer run date: ${message}`);
  }
}
