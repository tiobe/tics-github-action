import { logger } from '../../helper/logger';
import { githubConfig, octokit } from '../../configuration';
import { ReviewComment } from '../interfaces/interfaces';

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
export async function getPostedReviewComments(): Promise<ReviewComment[]> {
  let response: ReviewComment[] = [];
  try {
    logger.info('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.pulls.listReviewComments, params);
  } catch (error: unknown) {
    let message = 'reason unkown';
    if (error instanceof Error) message = error.message;
    logger.error(`Could not retrieve the review comments: ${message}`);
  }
  return response;
}
