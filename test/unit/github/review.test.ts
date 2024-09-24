import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { postReview } from '../../../src/github/review';
import { Events } from '../../../src/github/enums';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { githubConfig } from '../../../src/configuration/config';
import { githubConfigMock } from '../../.setup/mock';

describe('postReview', () => {
  let createReviewSpy: jest.SpiedFunction<typeof octokit.rest.pulls.createReview>;

  beforeEach(() => {
    createReviewSpy = jest.spyOn(octokit.rest.pulls, 'createReview');
  });

  it('should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    let err: any;
    try {
      await postReview('ReviewBody...', Events.APPROVE);
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('This function can only be run on a pull request.');
  });

  it('should call createReview once', async () => {
    githubConfigMock.pullRequestNumber = 1;

    await postReview('ReviewBody...', Events.APPROVE);

    expect(createReviewSpy).toHaveBeenCalledTimes(1);
  });

  it('should call createReview with values passed and no comments', async () => {
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

  it('should call createReview with values failed', async () => {
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

  it('should post a notice on createReview', async () => {
    createReviewSpy.mockRejectedValue(new Error());
    const noticeSpy = jest.spyOn(logger, 'notice');

    await postReview('ReviewBody...', Events.REQUEST_CHANGES);

    expect(noticeSpy).toHaveBeenCalledTimes(1);
  });
});
