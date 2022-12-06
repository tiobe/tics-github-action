import Logger from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';

export async function postReviewComments(review: any, annotations: any[], changeSet: string[]) {
  const postedReviewComments = await getPostedReviewComments();
  if (postedReviewComments) deletePreviousReviewComments(postedReviewComments);

  const comments = await createReviewComments(annotations, changeSet);
  let nonPostedReviewComments: any[] = [];
  await Promise.all(
    comments.map(async (comment: any) => {
      const params = {
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        commit_id: review.data.commit_id,
        body: comment.body,
        line: comment.line,
        path: comment.path
      };
      try {
        await octokit.rest.pulls.createReviewComment(params);
      } catch {
        nonPostedReviewComments.push(comment);
      }
    })
  );
  return nonPostedReviewComments;
}

/**
 * Gets a list of all reviews posted on the pull request.
 * @returns List of reviews posted on the pull request.
 */
async function getPostedReviewComments() {
  try {
    Logger.Instance.info('Retrieving posted review comments.');
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    return await octokit.paginate(octokit.rest.pulls.listReviewComments, params);
  } catch (error: any) {
    Logger.Instance.error(`Could not retrieve the review comments: ${error.message}`);
  }
}

/**
 * Deletes the review comments of previous runs.
 * @param postedReviewComments Previously posted review comments.
 */
async function deletePreviousReviewComments(postedReviewComments: any[]) {
  Logger.Instance.info('Deleting review comments of previous runs.');
  postedReviewComments.map(async reviewComment => {
    if (reviewComment.body.substring(0, 17) === ':warning: **TiCS:') {
      try {
        const params = {
          owner: githubConfig.owner,
          repo: githubConfig.reponame,
          comment_id: reviewComment.id
        };
        await octokit.rest.pulls.deleteReviewComment(params);
      } catch (error: any) {
        Logger.Instance.error(`Could not delete review comment: ${error.message}`);
      }
    }
  });
}

/**
 * Groups the annotations and creates review comments for them.
 * @param annotations Annotations retrieved from the viewer.
 * @param changeSet List of files changed in the pull request.
 * @returns List of the review comments.
 */
async function createReviewComments(annotations: any[], changeSet: string[]) {
  let groupedAnnotations: any[] = [];
  annotations.forEach(annotation => {
    if (!changeSet.find(c => annotation.fullPath.includes(c))) return;
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
      groupedAnnotations.push(annotation);
    } else {
      annotation[index].count += annotation.count;
    }
  });

  return groupedAnnotations.map(annotation => {
    const displayCount = annotation.count === 1 ? '' : `(${annotation.count}x) `;
    return {
      body: `:warning: **TiCS: ${annotation.type} violation: ${annotation.msg}** \r\n${displayCount}Line: ${annotation.line}, Rule: ${annotation.rule}, Level: ${annotation.level}, Category: ${annotation.category} \r\n`,
      path: annotation.fullPath.replace(`HIE://${ticsConfig.projectName}/${ticsConfig.branchName}/`, ''),
      line: annotation.line
    };
  });
}

/**
 * Finds an annotation in a list and returns the index.
 * @param list List to find the annotation in.
 * @param annotation Annotation to find.
 * @returns The index of the annotation found or -1
 */
function findAnnotationInList(list: any[], annotation: any) {
  return list.findIndex(a => {
    return (
      a.fullPath === annotation.fullPath &&
      a.type === annotation.type &&
      a.line === annotation.line &&
      a.rule === annotation.rule &&
      a.level === annotation.level &&
      a.category === annotation.category &&
      a.message === annotation.message
    );
  });
}
