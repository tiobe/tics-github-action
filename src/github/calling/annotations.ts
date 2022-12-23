import Logger from '../../helper/logger';
import { githubConfig, octokit } from '../../configuration';

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
export async function getPostedReviewComments() {
  try {
    Logger.Instance.info('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    return await octokit.paginate(octokit.rest.pulls.listReviewComments, params);
  } catch (error: any) {
    Logger.Instance.error(`Could not retrieve the review comments: ${error.message}`);
  }
}
