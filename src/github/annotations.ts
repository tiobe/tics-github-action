import { AnnotationLevel, CreateCheckRunParams, GithubAnnotation, ReviewComment, UpdateCheckRunParams } from './interfaces';
import { logger } from '../helper/logger';
import { ProjectResult } from '../helper/interfaces';
import { handleOctokitError } from '../helper/response';
import { githubConfig, actionConfig } from '../configuration/config';
import { ExtendedAnnotation } from '../viewer/interfaces';
import { octokit } from './octokit';
import { EOL } from 'os';
import { format } from 'date-fns';

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
export async function postAnnotations(projectResults: ProjectResult[]): Promise<void> {
  logger.header('Posting annotations.');
  if (!githubConfig.headSha) {
    logger.warning('Commit of underlying commit not found, cannot post annotations');
    return;
  }

  const annotations = projectResults
    .flatMap(projectResult => projectResult.annotations)
    .filter(shouldPostAnnotation)
    .map(createGithubAnnotation);

  if (annotations.length === 0) {
    logger.info('No annotations to post.');
    return;
  }

  let checkRunId = 0;
  for (let i = 0; i < annotations.length; i += 50) {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      output: {
        title: 'TICS annotations',
        summary: '',
        annotations: annotations.slice(i, i + 50)
      }
    };

    try {
      if (i === 0) {
        const pars: CreateCheckRunParams = {
          ...params,
          head_sha: githubConfig.headSha,
          name: 'TICS annotations',
          conclusion: i + 50 >= annotations.length ? 'success' : undefined,
          status: i + 50 >= annotations.length ? undefined : 'in_progress'
        };
        logger.debug('Creating check run with: ' + JSON.stringify(pars));
        const response = await octokit.rest.checks.create(pars);
        checkRunId = response.data.id;
      } else {
        const pars: UpdateCheckRunParams = { ...params, check_run_id: checkRunId };
        if (i + 50 >= annotations.length) {
          pars.conclusion = 'success';
        }
        logger.debug('Updating check run with: ' + JSON.stringify(pars));
        await octokit.rest.checks.update(pars);
      }
    } catch (error) {
      const message = handleOctokitError(error);
      logger.notice(`Could not post (some) annotations: ${message}`);
    }
  }

  logger.info('Posted all postable annotations');
}

function shouldPostAnnotation(annotation: ExtendedAnnotation): boolean {
  return (
    annotation.postable &&
    (annotation.blocking?.state === undefined ||
      annotation.blocking.state === 'yes' ||
      (annotation.blocking.state === 'after' && actionConfig.showBlockingAfter) ||
      (annotation.blocking.state === 'no' && actionConfig.showNonBlocking))
  );
}

function createGithubAnnotation(annotation: ExtendedAnnotation): GithubAnnotation {
  const title = annotation.msg;
  const body = createReviewCommentBody(annotation);

  let level: AnnotationLevel;
  switch (annotation.blocking?.state) {
    case 'no':
    case 'after':
      level = 'notice';
      break;
    case 'yes':
    default:
      level = 'warning';
      break;
  }

  return {
    title: title,
    message: body,
    annotation_level: level,
    path: annotation.path,
    start_line: annotation.line,
    end_line: annotation.line
  };
}

function createReviewCommentBody(annotation: ExtendedAnnotation): string {
  let body: string;
  switch (annotation.blocking?.state) {
    case 'no':
      body = 'Non-Blocking';
      break;
    case 'after':
      body = `Blocking after${annotation.blocking.after ? `: ${format(annotation.blocking.after, 'yyyy-MM-dd')}` : ''}`;
      break;
    case 'yes':
    default:
      body = 'Blocking';
      break;
  }

  const secondLine: string[] = [];
  if (annotation.level) {
    secondLine.push(`Level: ${annotation.level.toString()}`);
  }
  if (annotation.category) {
    secondLine.push(`Category: ${annotation.category}`);
  }

  const ruleset = annotation.ruleset ? `${annotation.ruleset}:` : 'Rule:';
  body += secondLine.length > 0 ? `${EOL}${secondLine.join(', ')}` : '';
  body += `${EOL}Line: ${annotation.line.toString()}${annotation.rule ? `, ${ruleset} ${annotation.rule}` : ''}`;
  body += annotation.synopsis ? `${EOL}${annotation.synopsis}` : '';
  body += annotation.ruleHelp ? `${EOL}Rule-help: ${annotation.ruleHelp}` : '';

  return body;
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
