import { logger } from '../helper/logger';
import { githubConfig, octokit } from '../configuration';
import { Events, Status } from '../helper/enums';
import { generateStatusMarkdown } from '../helper/markdown';

/**
 * Create review on the pull request from the analysis given.
 * @param body Body containing the summary of the review
 * @param event Either approve or request changes in the review.
 */
export async function postReview(body: string, event: Events): Promise<void> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: event,
    body: body
  };

  try {
    logger.header('Posting a review for this pull request.');
    await octokit.rest.pulls.createReview(params);
    logger.info('Posted review for this pull request.');
  } catch (error: unknown) {
    let message = 'reason unkown';
    if (error instanceof Error) message = error.message;
    logger.error(`Posting the review failed: ${message}`);
  }
}

/**
 * Create review on the pull request with a body and approval.
 * @param message Message to display in the body of the review.
 */
export async function postNothingAnalyzedReview(message: string): Promise<void> {
  const body = `<h1>TICS Quality Gate</h1>\n\n### ${generateStatusMarkdown(Status.PASSED, true)}\n\n${message}`;

  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: Events.APPROVE,
    body: body
  };

  try {
    logger.header('Posting a review for this pull request.');
    await octokit.rest.pulls.createReview(params);
    logger.info('Posted review for this pull request.');
  } catch (error: unknown) {
    let message = 'reason unkown';
    if (error instanceof Error) message = error.message;
    logger.error(`Posting the review failed: ${message}`);
  }
}
