import { githubConfig, octokit } from '../../configuration';
import { logger } from '../../helper/logger';
import { Analysis } from '../../helper/interfaces';
import { createErrorSummary } from '../../helper/summary';

/**
 * Create error comment on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 */
export async function postErrorComment(analysis: Analysis) {
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber,
      body: createErrorSummary(analysis.errorList, analysis.warningList)
    };

    logger.header('Posting error summary in pull request.');
    await octokit.rest.issues.createComment(params);
    logger.info('Posted the error summary in pull request.');
  } catch (error: any) {
    logger.error(`Posting the comment failed: ${error.message}`);
  }
}
