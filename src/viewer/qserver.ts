import { ticsCli } from '../configuration/config.js';
import { logger } from '../helper/logger.js';
import { getMeasureApiData } from './measure.js';

/**
 * Gets the date of the last QServer run the viewer knows of.
 * @returns the last QServer run date.
 * @throws Error if no date could be retrieved.
 */
export async function getLastQServerRunDate(): Promise<number> {
  logger.header('Retrieving the last QServer run date');
  const response = await getMeasureApiData(['lastRunInDatabase'], ticsCli.project);
  if (response.data.length === 0) {
    throw Error('Request returned empty array');
  }
  if (!response.data[0].value) {
    // return -1 for projects that haven't run yet
    return -1;
  }
  return Number(response.data[0].value) / 1000;
}
