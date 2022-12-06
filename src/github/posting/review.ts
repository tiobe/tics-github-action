import Logger from '../../helper/logger';
import { Analysis, QualityGate } from '../../helper/interfaces';
import { githubConfig, octokit } from '../configuration';
import { createFilesSummary, createLinkSummary, createUnpostedReviewCommentsSummary, createQualityGateSummary } from './summary';

/**
 * Create review on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 */
export async function postReview(analysis: Analysis, qualityGate: QualityGate) {
  let body = createQualityGateSummary(qualityGate);
  body += analysis.explorerUrl ? createLinkSummary(analysis.explorerUrl) : '';
  body += analysis.filesAnalyzed ? createFilesSummary(analysis.filesAnalyzed) : '';

  const params: any = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: 'COMMENT', // qualityGate.passed ? Events.APPROVE : Events.REQUEST_CHANGES,
    body: body
  };

  try {
    Logger.Instance.header('Posting a review for this pull request.');
    const response = await octokit.rest.pulls.createReview(params);
    Logger.Instance.info('Posted review for this pull request.');
    return { data: response.data, body: body };
  } catch (error: any) {
    Logger.Instance.error(`Posting the review failed: ${error.message}`);
  }
}

/**
 * Updates the review to include review comments that could not be posted.
 * @param review Response from posting the review.
 * @param unpostedReviewComments Review comments that could not be posted.
 */
export async function updateReviewWithUnpostedComments(review: any, unpostedReviewComments: any[]) {
  let body = review.body + createUnpostedReviewCommentsSummary(unpostedReviewComments);
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    review_id: review.data.id,
    body: body
  };
  try {
    await octokit.rest.pulls.updateReview(params);
  } catch (error: any) {
    Logger.Instance.error(`Could not update review on this Pull Request: ${error.message}`);
  }
}
