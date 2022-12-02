import { githubConfig, octokit } from '../configuration';
import Logger from '../../helper/logger';
import { Analysis } from '../../helper/models';
import { createErrorSummary } from './summary';

/**
 * Create error comment on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 */
export async function postErrorComment(analysis: Analysis) {
  try {
    const parameters = {
      accept: 'application/vnd.github.v3+json',
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber,
      body: createErrorSummary(analysis.errorList, analysis.warningList)
    };

    Logger.Instance.info('\u001b[35mPosting error summary in pull request comment.');
    await octokit.rest.issues.createComment(parameters);
  } catch (error: any) {
    Logger.Instance.error(`Create issue comment failed: ${error.message}`);
  }
}
