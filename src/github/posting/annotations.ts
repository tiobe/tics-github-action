import Logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

export async function postReviewComments(review: any, comments: any[]) {
  const postedReviewComments = await getPostedReviewComments();
  if (postedReviewComments) deletePreviousAnnotations(postedReviewComments);

  let nonPostedReviewComments: any[] = [];
  await Promise.all(
    comments.map(async comment => {
      const params = {
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        commit_id: review.commit_id,
        body: comment.body,
        line: comment.line,
        path: comment.path
      };
      try {
        await octokit.rest.pulls.createReviewComment(params);
      } catch {
        nonPostedReviewComments.push(comment);
      }
    })
  );
  return nonPostedReviewComments;
}

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

async function deletePreviousAnnotations(postedReviewComments: any[]) {
  Logger.Instance.info('Deleting review comments of previous runs.');
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
}
