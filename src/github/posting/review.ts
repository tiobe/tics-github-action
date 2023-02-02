import Logger from '../../helper/logger';
import { Analysis, QualityGate, ReviewComments } from '../../helper/interfaces';
import { githubConfig, octokit } from '../../configuration';
import { createFilesSummary, createLinkSummary, createUnpostableReviewCommentsSummary, createQualityGateSummary } from '../../helper/summary';
import { Events, Status } from '../../helper/enums';
import { generateStatusMarkdown } from '../../helper/markdown';

/**
 * Create review on the pull request from the analysis given.
 * @param analysis Analysis object returned from TiCS analysis.
 * @param filesAnalyzed List of all files analyzed by TiCS.
 * @param qualityGate Quality gate returned by TiCS.
 * @param reviewComments TiCS annotations in the form of review comments.
 */
export async function postReview(analysis: Analysis, filesAnalyzed: string[], qualityGate: QualityGate, reviewComments: ReviewComments | undefined) {
  let body = createQualityGateSummary(qualityGate);
  body += analysis.explorerUrl ? createLinkSummary(analysis.explorerUrl) : '';
  body += reviewComments && reviewComments.unpostable.length > 0 ? createUnpostableReviewCommentsSummary(reviewComments.unpostable) : '';
  body += createFilesSummary(filesAnalyzed);

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

/**
 * Create review on the pull request with a body and approval0.
 * @param message Message to display in the body of the review.
 * @param event Approve or request changes in the review.
 */
export async function postNothingAnalyzedReview(message: string, event: Events) {
  const body = `## TiCS Analysis\n\n### ${generateStatusMarkdown(Status[event === Events.APPROVE ? 1 : 0], true)}\n\n${message}`;

  const params: any = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    event: event,
    body: body
  };

  try {
    Logger.Instance.header('Posting a review for this pull request.');
    await octokit.rest.pulls.createReview(params);
    Logger.Instance.info('Posted review for this pull request.');
  } catch (error: any) {
    Logger.Instance.error(`Posting the review failed: ${error.message}`);
  }
}
