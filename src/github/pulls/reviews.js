import core from '@actions/core';
import github from '@actions/github';
import ProxyAgent from 'proxy-agent';
import { githubConfig } from '../configuration.js';
import { getUnpostedSummary } from '../summary/index.js';

//Octokit client is authenticated
const octokit = github.getOctokit(process.env.GITHUB_TOKEN, { request: { agent: new ProxyAgent() } });

export async function createPRReview(review) {
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: review.event,
      body: review.body
    };
    const response = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', params);
    core.info('\u001b[35mPosted a review for this Pull Request.');
    return response.data;
  } catch (e) {
    core.error(`Could not post review on this Pull Request: ${e}`);
  }
}

export async function postReviewComments(reviewResponse, comments, body) {
  let notPosted = [];
  await comments.map(async (comment) => {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      commit_id: reviewResponse.commit_id,
      body: comment.body,
      line: comment.line,
      path: comment.path
    };
    try {
      await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/comments', params).catch(notPosted.push(comment));
    } catch {
      core.error('Something went wrong posting a comment.');
    }
  });
  core.info('\u001b[35mPosted the annotations for this review.');
  if (notPosted.length > 0) updateReviewWithUnpostedComments(reviewResponse.id, notPosted, body);
}

async function updateReviewWithUnpostedComments(reviewId, comments, body) {
  let newBody = body + getUnpostedSummary(comments);
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    review_id: reviewId,
    body: newBody
  };
  try {
    await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}', params);
  } catch (error) {
    core.error(`Could not update review on this Pull Request: ${error}`);
  }
}

export async function getAllPRReviewComments() {
  try {
    let allReviews = [];
    var noMoreFiles;
    for (var i = 1; i <= 30; i++) {
      const params = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        per_page: 100,
        page: i
      };
      await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/comments', params).then((response) => {
        if (response.data.length > 0) {
          response.data.map((item) => {
            allReviews.push(item);
          });
        } else {
          noMoreFiles = true;
        }
      });
      if (noMoreFiles) {
        break;
      }
    }
    return allReviews;
  } catch (e) {
    core.error(`We cannot get the annotations of this PR: ${e}`);
  }
}

export async function deletePRReviewComments(reviewCommentIds) {
  try {
    core.info('\u001b[35mDeleting review comments of previous runs');
    await reviewCommentIds.map(async (id) => {
      const params = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        comment_id: id
      };
      await octokit.request('DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}', params);
    });
  } catch (e) {
    core.error(`We cannot delete the annotations of this PR: ${e}`);
  }
}