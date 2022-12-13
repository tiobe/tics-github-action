import Logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

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
