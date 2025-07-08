import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { octokit } from './octokit';
import { RateLimit } from './interfaces';

/**
 * Sends a request to retrieve the rate limits.
 * @returns the remaining rate limits.
 */
export async function getRateLimit(): Promise<RateLimit> {
  let response;
  try {
    logger.header('Retrieving rate limit to test GitHub API capabilities.');
    response = (await octokit.rest.rateLimit.get()).data;
    logger.info('Retrieved rate limit.');
    logger.debug(JSON.stringify(response));
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    throw Error(`Could not retrieve rate limit: ${message}`);
  }
  return response;
}
