import { logger } from '../../helper/logger';
import { githubConfig, octokit } from '../../configuration';
import { ReviewComments } from '../../helper/interfaces';
import { ReviewComment } from '../interfaces/interfaces';

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
        let message = 'reason unkown';
        if (error instanceof Error) message = error.message;
        logger.error(`Could not delete review comment: ${message}`);
      }
    }
  });
  logger.info('Deleted review comments of previous runs.');
}

export function postAnnotations(reviewComments: ReviewComments): void {
  logger.header('Posting annotations.');
  reviewComments.postable.forEach(reviewComment => {
    logger.warning(reviewComment.body, {
      file: reviewComment.path,
      startLine: reviewComment.line,
      title: reviewComment.title
    });
  });
}
