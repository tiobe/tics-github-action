import { logger } from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../../configuration';
import { Events, Status } from '../../helper/enums';
import { generateStatusMarkdown } from '../../helper/markdown';

/**
 * Create review on the pull request from the analysis given.
 * @param body Body containing the summary of the review
 * @param event Either approve or request changes in the review.
 */
export async function postReview(body: string, event: Events) {
  const params: any = {
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
  } catch (error: any) {
    logger.error(`Posting the review failed: ${error.message}`);
  }
}

/**
 * Create review on the pull request with a body and approval.
 * @param message Message to display in the body of the review.
 */
export async function postNothingAnalyzedReview(message: string) {
  const body = `## TICS Analysis\n\n### ${generateStatusMarkdown(Status.PASSED, true)}\n\n${message}`;

  const params: any = {
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
  } catch (error: any) {
    logger.error(`Posting the review failed: ${error.message}`);
  }
}
