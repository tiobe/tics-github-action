import { Comment } from './interfaces';
import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig } from '../configuration/config';
import { octokit } from './octokit';

/**
 * Gets a list of all comments on the pull request.
 * @returns List of comments on the pull request.
 */
export async function getPostedComments(): Promise<Comment[]> {
  if (!githubConfig.pullRequestNumber) {
    throw Error('This function can only be run on a pull_request.');
  }

  let response: Comment[] = [];
  try {
    logger.header('Retrieving posted comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.issues.listComments, params);
    logger.info('Retrieved posted comments.');
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Could not retrieve the comments: ${message}`);
  }
  return response;
}

/**
 * Create review on the pull request from the analysis given.
 * @param body Body posted to the comment.
 */
export async function postComment(body: string): Promise<void> {
  if (!githubConfig.pullRequestNumber) {
    throw Error('This function can only be run on a pull_request.');
  }

  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    issue_number: githubConfig.pullRequestNumber,
    body: body
  };

  try {
    logger.header('Posting a comment for this pull request.');
    await octokit.rest.issues.createComment(params);
    logger.info('Posted comment for this pull request.');
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Posting the comment failed: ${message}`);
  }
}

export async function deletePreviousComments(comments: Comment[]): Promise<void> {
  logger.header('Deleting comments of previous runs.');
  for (const comment of comments) {
    if (commentIncludesTicsTitle(comment.body)) {
      try {
        const params = {
          owner: githubConfig.owner,
          repo: githubConfig.reponame,
          comment_id: comment.id
        };
        await octokit.rest.issues.deleteComment(params);
      } catch (error: unknown) {
        const message = handleOctokitError(error);
        logger.notice(`Removing a comment failed: ${message}`);
      }
    }
  }
  logger.info('Deleted review comments of previous runs.');
}

function commentIncludesTicsTitle(body?: string): boolean {
  const titles = ['<h1>TICS Quality Gate</h1>', '## TICS Quality Gate', '## TICS Analysis'];

  if (!body) return false;

  let includesTitle = false;

  titles.forEach(title => {
    if (body.startsWith(title)) includesTitle = true;
  });

  return includesTitle;
}
