import { logger } from '../../helper/logger';
import { githubConfig, octokit } from '../../configuration';
import { Comment } from '../interfaces/interfaces';

/**
 * Gets a list of all comments on the pull request.
 * @returns List of comments on the pull request.
 */
export async function getPostedComments(): Promise<Comment[]> {
  let response: Comment[] = [];
  try {
    logger.info('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.issues.listComments, params);
  } catch (error: unknown) {
    let message = 'reason unkown';
    if (error instanceof Error) message = error.message;
    logger.error(`Could not retrieve the comments: ${message}`);
  }
  return response;
}
