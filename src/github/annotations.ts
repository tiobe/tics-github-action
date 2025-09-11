import { ReviewComment } from './interfaces';
import { logger } from '../helper/logger';
import { ProjectResult } from '../helper/interfaces';
import { handleOctokitError } from '../helper/response';
import { githubConfig, actionConfig } from '../configuration/config';
import { octokit } from './octokit';
import { createReviewCommentBody } from '../action/decorate/summary';

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
export async function getPostedReviewComments(): Promise<ReviewComment[]> {
  if (!githubConfig.pullRequestNumber) {
    throw Error('This function can only be run on a pull request.');
  }

  let response: ReviewComment[] = [];
  try {
    logger.header('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.pulls.listReviewComments, params);
    logger.info('Retrieve posted review comments.');
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Could not retrieve the review comments: ${message}`);
  }
  return response;
}

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export function postAnnotations(projectResults: ProjectResult[]): void {
  logger.header('Posting annotations.');

  projectResults.forEach(projectResult => {
    if (projectResult.reviewComments) {
      projectResult.reviewComments.postable.forEach(annotation => {
        const title = annotation.instanceName + (annotation.rule ? `: ${annotation.rule}` : '');
        const body = createReviewCommentBody(annotation);

        if (annotation.blocking?.state === undefined || annotation.blocking.state === 'yes') {
          logger.warning(body, {
            file: annotation.path,
            startLine: annotation.line,
            title: title
          });
        } else if (annotation.blocking.state === 'after' && actionConfig.showBlockingAfter) {
          logger.notice(body, {
            file: annotation.path,
            startLine: annotation.line,
            title: title
          });
        }
      });
    }
  });

  logger.info('Posted all postable annotations (none if there are no violations).');
}

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
export async function deletePreviousReviewComments(postedReviewComments: ReviewComment[]): Promise<void> {
  logger.header('Deleting review comments of previous runs.');
  for (const reviewComment of postedReviewComments) {
    if (reviewComment.body.startsWith(':warning: **TICS:')) {
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
  }
  logger.info('Deleted review comments of previous runs.');
}
