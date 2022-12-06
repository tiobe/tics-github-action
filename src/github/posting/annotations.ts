import Logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

export async function postReviewComments(review: any, annotations: any[]) {
  const postedReviewComments = await getPostedReviewComments();
  if (postedReviewComments) deletePreviousAnnotations(postedReviewComments);

  const comments = await createReviewComments(annotations);
  let nonPostedReviewComments: any[] = [];
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

async function createReviewComments(annotations: any[]) {
  console.log(annotations);
  return [];
}

function findAnnotationInArray(array: any[], annotation: any) {
  return array.findIndex(a => {
    return (
      a.fullPath === annotation.fullPath &&
      a.type === annotation.type &&
      a.line === annotation.line &&
      a.rule === annotation.rule &&
      a.level === annotation.level &&
      a.category === annotation.category &&
      a.message === annotation.message
    );
  });
}
