import Logger from '../../helper/logger';
import { Analysis, QualityGate } from '../../helper/interfaces';
import { githubConfig, octokit } from '../configuration';
import { createFilesSummary, createLinkSummary, createQualityGateSummary } from './summary';
import { Events } from '../../helper/enums';

/**
 * Create review on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 */
export async function postReview(analysis: Analysis, qualityGate: QualityGate) {
  let body = createQualityGateSummary(qualityGate);
  body += analysis.explorerUrl ? createLinkSummary(analysis.explorerUrl) : '';
  body += analysis.filesAnalyzed ? createFilesSummary(analysis.filesAnalyzed) : '';

  const parameters: any = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: Events.COMMENT, // qualityGate.passed ? Events.APPROVE : Events.REQUEST_CHANGES,
    body: body
  };

  try {
    Logger.Instance.header('Posting error summary in pull request comment.');
    await octokit.rest.pulls.createReview(parameters);
  } catch (error: any) {
    Logger.Instance.error(`Posting the review failed: ${error.message}`);
  }
}
