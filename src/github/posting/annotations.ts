import Logger from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';
import { createReviewComments } from './summary';

/**
 * Posts review comments based on the annotations from TiCS.
 * @param review Response from posting the review.
 * @param annotations Annotations retrieved from TiCS viewer.
 * @param changedFiles Changed files for this pull request.
 * @returns The issues that could not be posted.
 */
export async function postReviewComments(review: any, annotations: any[], changedFiles: string[]) {
  const postedReviewComments = await getPostedReviewComments();
  if (postedReviewComments) deletePreviousReviewComments(postedReviewComments);

  const comments = await createReviewComments(annotations, changedFiles);
  let unpostedReviewComments: any[] = [];
  Logger.Instance.header('Posting review comments.');
  await Promise.all(
    comments.map(async (comment: any) => {
      const params = {
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        commit_id: review.data.commit_id,
        body: comment.body,
        line: comment.line,
        path: comment.path
      };
      try {
        await octokit.rest.pulls.createReviewComment(params);
      } catch (error: any) {
        unpostedReviewComments.push(comment);
        Logger.Instance.error(`Could not post review comment: ${error.message}`);
      }
    })
  );
  Logger.Instance.info('Posted review comments.');
  return unpostedReviewComments;
}

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
async function getPostedReviewComments() {
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
async function deletePreviousReviewComments(postedReviewComments: any[]) {
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
