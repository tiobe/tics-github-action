import Logger from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';

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

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export async function deletePreviousReviewComments(postedReviewComments: any[]) {
  Logger.Instance.header('Deleting review comments of previous runs.');
  postedReviewComments.map(async reviewComment => {
    if (reviewComment.body.substring(0, 17) === ':warning: **TiCS:') {
      try {
        const params = {
          owner: githubConfig.owner,
          repo: githubConfig.reponame,
          comment_id: reviewComment.id
        };
        await octokit.rest.pulls.deleteReviewComment(params);
      } catch (error: any) {
        Logger.Instance.error(`Could not delete review comment: ${error.message}`);
      }
    }
  });
  Logger.Instance.info('Deleted review comments of previous runs.');
}
