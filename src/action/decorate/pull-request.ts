import { actionConfig } from '../../configuration/_config';
import { getPostedReviewComments, deletePreviousReviewComments } from '../../github/annotations';
import { getPostedComments, deletePreviousComments, postComment } from '../../github/comments';
import { postReview } from '../../github/review';
import { Events } from '../../helper/enums';

export async function decoratePullRequest(passed: boolean, summaryBody: string) {
  const previousReviewComments = await getPostedReviewComments();
  if (previousReviewComments.length > 0) {
    await deletePreviousReviewComments(previousReviewComments);
  }

  const previousComments = await getPostedComments();
  if (previousComments.length > 0) {
    await deletePreviousComments(previousComments);
  }

  await postToConversation(true, summaryBody, passed ? Events.APPROVE : Events.REQUEST_CHANGES);
}

/**
 * Function to combine the posting to conversation in a single location.
 * @param isGate if posting is done on a quality gate result.
 * @param body body of the summary to post.
 * @param event in case of posting a review an event should be given.
 */
export async function postToConversation(isGate: boolean, body: string, event: Events = Events.COMMENT): Promise<void> {
  if (actionConfig.postToConversation) {
    if (isGate) {
      if (actionConfig.pullRequestApproval) {
        await postReview(body, event);
      } else {
        await postComment(body);
      }
    } else if (actionConfig.pullRequestApproval) {
      await postReview(body, Events.APPROVE);
    } else {
      await postComment(body);
    }
  }
}
