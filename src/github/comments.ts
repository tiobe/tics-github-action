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
    throw Error('This function can only be run on a pull request.');
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
    throw Error('This function can only be run on a pull request.');
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
    if (shouldCommentBeDeleted(comment.body)) {
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

function shouldCommentBeDeleted(body?: string): boolean {
  if (!body) return false;

  const titles = ['<h1>TICS Quality Gate</h1>', '## TICS Quality Gate', '## TICS Analysis'];

  let includesTitle = false;

  for (const title of titles) {
    if (body.startsWith(title)) {
      includesTitle = true;
    }
  }

  if (includesTitle) {
    return isWorkflowAndJobInAnotherRun(body);
  }

  return false;
}

function isWorkflowAndJobInAnotherRun(body: string): boolean {
  const regex = /<!--([^\s]+)-->/g;

  let identifier = '';
  // Get the last match of the <i> tag.
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(body))) {
    if (match[1] !== '') {
      identifier = match[1];
    }
  }

  // If no identifier is found, the comment is
  // of the old format and should be replaced.
  if (identifier === '') return true;

  const split = identifier.split('_');

  // If the identifier does not match the correct format, do not replace.
  if (split.length !== 4) {
    logger.debug(`Identifier is not of the correct format: ${identifier}`);
    return false;
  }

  // If the workflow or job are different, do not replace.
  if (split[0] !== githubConfig.workflow || split[1] !== githubConfig.job) {
    return false;
  }

  // Only replace if the run number or run attempt are different.
  return parseInt(split[2], 10) !== githubConfig.runNumber || parseInt(split[3], 10) !== githubConfig.runAttempt;
}
