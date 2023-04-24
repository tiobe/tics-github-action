import { githubConfig, octokit } from '../../configuration';
import { logger } from '../../helper/logger';
import { Analysis } from '../../helper/interfaces';
import { createErrorSummary } from '../../helper/summary';
import { generateStatusMarkdown } from '../../helper/markdown';
import { Status } from '../../helper/enums';

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
  const body = `## TICS Analysis\n\n### ${generateStatusMarkdown(Status.PASSED, true)}\n\n${message}`;

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
    let message = 'reason unkown';
    if (error instanceof Error) message = error.message;
    logger.error(`Posting the comment failed: ${message}`);
  }
}
