import Logger from '../../helper/logger';
import { Analysis, QualityGate } from '../../helper/interfaces';
import { githubConfig, octokit } from '../configuration';
import { createFilesSummary, createLinkSummary, createQualityGateSummary } from './summary';

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
    event: 'COMMENT', // qualityGate.passed ? Events.APPROVE : Events.REQUEST_CHANGES,
    body: body
  };

  try {
    Logger.Instance.header('Posting a review for this pull request.');
    const response = await octokit.rest.pulls.createReview(parameters);
    Logger.Instance.info('Posted review for this pull request.');
    return response.data;
  } catch (error: any) {
    Logger.Instance.error(`Posting the review failed: ${error.message}`);
  }
}
