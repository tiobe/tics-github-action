import * as annotations from '../../../../src/github/annotations';
import * as comments from '../../../../src/github/comments';
import * as review from '../../../../src/github/review';

import { actionConfigMock } from '../../../.setup/mock';
import { Events } from '../../../../src/github/enums';
import { decoratePullRequest, postToConversation } from '../../../../src/action/decorate/pull-request';

afterEach(() => {
  jest.resetAllMocks();
});

describe('postToConversation', () => {
  let spyPostReview: jest.SpyInstance;
  let spyPostComment: jest.SpyInstance;

  beforeEach(() => {
    spyPostReview = jest.spyOn(review, 'postReview');
    spyPostComment = jest.spyOn(comments, 'postComment');
  });

  test('Should not call anything if postToConversation is false', async () => {
    actionConfigMock.postToConversation = false;

    await postToConversation(false, 'body');

    expect(spyPostReview).not.toHaveBeenCalled();
    expect(spyPostComment).not.toHaveBeenCalled();
  });

  test('Should call postComment if there is no gate and pullRequestApproval is false', async () => {
    actionConfigMock.postToConversation = true;
    actionConfigMock.pullRequestApproval = false;

    await postToConversation(false, 'body', Events.REQUEST_CHANGES);

    expect(spyPostReview).not.toHaveBeenCalled();
    expect(spyPostComment).toHaveBeenCalledWith('body');
  });

  test('Should call postReview if there is no gate and pullRequestApproval is true', async () => {
    actionConfigMock.postToConversation = true;
    actionConfigMock.pullRequestApproval = true;

    await postToConversation(false, 'body', Events.REQUEST_CHANGES);

    expect(spyPostReview).toHaveBeenCalledWith('body', Events.APPROVE);
    expect(spyPostComment).not.toHaveBeenCalled();
  });

  test('Should call postComment if there is a gate and pullRequestApproval is false', async () => {
    actionConfigMock.postToConversation = true;
    actionConfigMock.pullRequestApproval = false;

    await postToConversation(true, 'body', Events.REQUEST_CHANGES);

    expect(spyPostReview).not.toHaveBeenCalled();
    expect(spyPostComment).toHaveBeenCalledWith('body');
  });

  test('Should call postReview there is a gate and pullRequestApproval is true', async () => {
    actionConfigMock.postToConversation = true;
    actionConfigMock.pullRequestApproval = true;

    await postToConversation(true, 'body', Events.REQUEST_CHANGES);

    expect(spyPostReview).toHaveBeenCalledWith('body', Events.REQUEST_CHANGES);
    expect(spyPostComment).not.toHaveBeenCalled();
  });

  test('Should call postReview there is a gate and pullRequestApproval is true', async () => {
    actionConfigMock.postToConversation = true;
    actionConfigMock.pullRequestApproval = true;

    await postToConversation(true, 'body');

    expect(spyPostReview).toHaveBeenCalledWith('body', Events.COMMENT);
    expect(spyPostComment).not.toHaveBeenCalled();
  });
});

// imported here, because importing it at the top breaks the
// actionConfigMock needed for the tests of postToConversation.
import * as pull_request from '../../../../src/action/decorate/pull-request';

describe('decoratePullRequest', () => {
  let spyDeletePreviousReviewComments: jest.SpyInstance;
  let spyGetPreviousReviewComments: jest.SpyInstance;
  let spyDeletePreviousComments: jest.SpyInstance;
  let spyGetPreviousComments: jest.SpyInstance;
  let spyPostToConversation: jest.SpyInstance;

  beforeEach(() => {
    spyDeletePreviousReviewComments = jest.spyOn(annotations, 'deletePreviousReviewComments');
    spyGetPreviousReviewComments = jest.spyOn(annotations, 'getPostedReviewComments');
    spyDeletePreviousComments = jest.spyOn(comments, 'deletePreviousComments');
    spyGetPreviousComments = jest.spyOn(comments, 'getPostedComments');
    spyPostToConversation = jest.spyOn(pull_request, 'postToConversation');
  });

  test('Should not remove (review) comments if there are none', async () => {
    spyGetPreviousReviewComments.mockResolvedValue([]);
    spyGetPreviousComments.mockResolvedValue([]);

    await decoratePullRequest(false, 'body');

    expect(spyDeletePreviousReviewComments).not.toHaveBeenCalled();
    expect(spyDeletePreviousComments).not.toHaveBeenCalled();
    expect(spyPostToConversation).toHaveBeenCalledWith(true, 'body', Events.REQUEST_CHANGES);
  });

  test('Should remove (review) comments if there are some', async () => {
    spyGetPreviousReviewComments.mockResolvedValue([{ id: 1 }]);
    spyGetPreviousComments.mockResolvedValue([{ id: 2 }]);

    await decoratePullRequest(true, 'body');

    expect(spyDeletePreviousReviewComments).toHaveBeenCalledWith([{ id: 1 }]);
    expect(spyDeletePreviousComments).toHaveBeenCalledWith([{ id: 2 }]);
    expect(spyPostToConversation).toHaveBeenCalledWith(true, 'body', Events.APPROVE);
  });
});
