import { logger } from '../../helper/logger';
import { githubConfig, octokit } from '../../configuration';
import { ReviewComments } from '../../helper/interfaces';
import path from 'path';

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export async function deletePreviousReviewComments(postedReviewComments: any[]) {
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
      } catch (error: any) {
        logger.error(`Could not delete review comment: ${error.message}`);
      }
    }
  });
  logger.info('Deleted review comments of previous runs.');
}

export async function postAnnotations(reviewComments: ReviewComments) {
  logger.header('Posting annotations.');
  reviewComments.postable.forEach(reviewComment => {
    logger.warning(reviewComment.body, {
      file: reviewComment.path,
      startLine: reviewComment.line,
      title: 'TICS annotation'
    });
  });
}
