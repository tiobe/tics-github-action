import { actionConfig } from '../../configuration/config.js';
import { getPostedReviewComments, deletePreviousReviewComments } from '../../github/annotations.js';
import { getPostedComments, deletePreviousComments, postComment } from '../../github/comments.js';
import { postReview } from '../../github/review.js';
import { Events } from '../../github/enums.js';

// imported for testing
import * as self from './pull-request.js';

/**
 * Function to combine the posting to conversation in a single location.
 * @param isGate if posting is done on a quality gate result.
 * @param body body of the summary to post.
 * @param event in case of posting a review an event should be given.
 */
export async function postToConversation(isGate: boolean, body: string, event: Events = Events.COMMENT): Promise<void> {
  if (actionConfig.postToConversation) {
    if (actionConfig.pullRequestApproval) {
      if (isGate) {
        await postReview(body, event);
      } else {
        await postReview(body, Events.APPROVE);
      }
    } else {
      await postComment(body);
    }
  }
}

export async function decoratePullRequest(passed: boolean, summaryBody: string): Promise<void> {
  const previousReviewComments = await getPostedReviewComments();
  if (previousReviewComments.length > 0) {
    await deletePreviousReviewComments(previousReviewComments);
  }

  const previousComments = await getPostedComments();
  if (previousComments.length > 0) {
    await deletePreviousComments(previousComments);
  }

  // calling self for mocking in testing
  await self.postToConversation(true, summaryBody, passed ? Events.APPROVE : Events.REQUEST_CHANGES);
}
