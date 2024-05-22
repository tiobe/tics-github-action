import { postReview } from '../../../src/github/review';
import { Events } from '../../../src/github/enums';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { githubConfig } from '../../../src/configuration/config';
import { githubConfigMock } from '../../.setup/mock';

describe('postReview', () => {
  let createReviewSpy: jest.SpyInstance;

  beforeEach(() => {
    createReviewSpy = jest.spyOn(octokit.rest.pulls, 'createReview');
  });

  test('Should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    try {
      await postReview('ReviewBody...', Events.APPROVE);
      expect(false).toBeTruthy(); // should not be reached
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toEqual('This function can only be run on a pull_request.');
    }
  });

  test('Should call createReview once', async () => {
    githubConfigMock.pullRequestNumber = 1;

    await postReview('ReviewBody...', Events.APPROVE);
    expect(createReviewSpy).toHaveBeenCalledTimes(1);
  });

  test('Should call createReview with values passed and no comments', async () => {
    await postReview('ReviewBody...', Events.APPROVE);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.APPROVE,
      body: 'ReviewBody...',
      comments: undefined
    };
    expect(createReviewSpy).toHaveBeenCalledWith(calledWith);
  });

  test('Should call createReview with values failed', async () => {
    await postReview('ReviewBody...', Events.REQUEST_CHANGES);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.REQUEST_CHANGES,
      body: 'ReviewBody...'
    };
    expect(createReviewSpy).toHaveBeenCalledWith(calledWith);
  });

  test('Should post a notice on createReview', async () => {
    createReviewSpy.mockRejectedValue(new Error());
    const noticeSpy = jest.spyOn(logger, 'notice');

    await postReview('ReviewBody...', Events.REQUEST_CHANGES);

    expect(noticeSpy).toHaveBeenCalledTimes(1);
  });
});
