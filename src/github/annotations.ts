import { logger } from '../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';
import { ReviewComment } from './interfaces';
import { AnalysisResults, TicsReviewComment } from '../helper/interfaces';
import { handleOctokitError } from '../helper/error';

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
export async function getPostedReviewComments(): Promise<ReviewComment[]> {
  let response: ReviewComment[] = [];
  try {
    logger.header('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.pulls.listReviewComments, params);
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Could not retrieve the review comments: ${message}`);
  }
  logger.info('Retrieve posted review comments.');
  return response;
}

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export function postAnnotations(analysisResult: AnalysisResults): void {
  logger.header('Posting annotations.');

  let postableReviewComments: TicsReviewComment[] = [];

  analysisResult.projectResults.forEach(projectResult => {
    if (projectResult.reviewComments) {
      postableReviewComments.push(...projectResult.reviewComments.postable);
    }
  });

  postableReviewComments.forEach(reviewComment => {
    if (reviewComment.blocking === undefined || reviewComment.blocking === 'yes') {
      logger.warning(reviewComment.body, {
        file: reviewComment.path,
        startLine: reviewComment.line,
        title: reviewComment.title
      });
    } else if (reviewComment.blocking === 'after' && ticsConfig.showBlockingAfter) {
      logger.notice(reviewComment.body, {
        file: reviewComment.path,
        startLine: reviewComment.line,
        title: reviewComment.title
      });
    }
  });
  logger.info('Posted all postable annotations (none if there are no violations).');
}

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export function deletePreviousReviewComments(postedReviewComments: ReviewComment[]): void {
  logger.header('Deleting review comments of previous runs.');
  postedReviewComments.map(async reviewComment => {
    if (reviewComment.body.substring(0, 17) === ':warning: **TICS:') {
      try {
        const params = {
          owner: githubConfig.owner,
          repo: githubConfig.reponame,
          comment_id: reviewComment.id
        };
        await octokit.rest.pulls.deleteReviewComment(params);
      } catch (error: unknown) {
        const message = handleOctokitError(error);
        logger.notice(`Could not delete review comment: ${message}`);
      }
    }
  });
  logger.info('Deleted review comments of previous runs.');
}
