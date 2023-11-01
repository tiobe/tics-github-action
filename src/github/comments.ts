import { logger } from '../helper/logger';
import { githubConfig, octokit } from '../configuration';
import { Analysis } from '../helper/interfaces';
import { createErrorSummary } from '../helper/summary';
import { generateStatusMarkdown } from '../helper/markdown';
import { Status } from '../helper/enums';
import { Comment } from './interfaces';
import { handleOctokitError } from '../helper/error';

/**
 * Gets a list of all comments on the pull request.
 * @returns List of comments on the pull request.
 */
export async function getPostedComments(): Promise<Comment[]> {
  let response: Comment[] = [];
  try {
    logger.header('Retrieving posted comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.issues.listComments, params);
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.error(`Could not retrieve the comments: ${message}`);
  }
  logger.info('Retrieved posted comments.');
  return response;
}

/**
 * Create error comment on the pull request from the analysis given.
 * @param analysis Analysis object returned from TICS analysis.
 */
export async function postErrorComment(analysis: Analysis): Promise<void> {
  let body = createErrorSummary(analysis.errorList, analysis.warningList);

  await postComment(body);
}

/**
 * Create a comment on the pull request with a body and approval.
 * @param message Message to display in the body of the comment.
 */
export async function postNothingAnalyzedComment(message: string): Promise<void> {
  const body = `<h1>TICS Quality Gate</h1>\n\n### ${generateStatusMarkdown(Status.PASSED, true)}\n\n${message}`;

  await postComment(body);
}

/**
 * Create review on the pull request from the analysis given.
 * @param body Body posted to the comment.
 */
export async function postComment(body: string): Promise<void> {
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
    logger.error(`Posting the comment failed: ${message}`);
  }
}

export function deletePreviousComments(comments: Comment[]): void {
  logger.header('Deleting comments of previous runs.');
  comments.map(async comment => {
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
        logger.error(`Removing a comment failed: ${message}`);
      }
    }
  });
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
