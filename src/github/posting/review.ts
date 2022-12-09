import Logger from '../../helper/logger';
import { Analysis, QualityGate, ReviewComments } from '../../helper/interfaces';
import { githubConfig, octokit } from '../configuration';
import { createFilesSummary, createLinkSummary, createUnpostableReviewCommentsSummary, createQualityGateSummary } from './summary';
import { Events } from '../../helper/enums';

/**
 * Create review on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 */
export async function postReview(analysis: Analysis, filesAnalyzed: string[], qualityGate: QualityGate, reviewComments: ReviewComments | undefined) {
  let body = createQualityGateSummary(qualityGate);
  body += analysis.explorerUrl ? createLinkSummary(analysis.explorerUrl) : '';
  body += createFilesSummary(filesAnalyzed);

  if (reviewComments) body += reviewComments.unpostable.length > 0 ? createUnpostableReviewCommentsSummary(reviewComments.unpostable) : '';

  const params: any = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: qualityGate.passed ? Events.APPROVE : Events.REQUEST_CHANGES,
    body: body,
    comments: reviewComments ? reviewComments.postable : undefined
  };

  try {
    Logger.Instance.header('Posting a review for this pull request.');
    await octokit.rest.pulls.createReview(params);
    Logger.Instance.info('Posted review for this pull request.');
  } catch (error: any) {
    Logger.Instance.error(`Posting the review failed: ${error.message}`);
  }
}
