import { describe, expect, it, jest } from '@jest/globals';
import { deletePreviousReviewComments, getPostedReviewComments, postAnnotations } from '../../../src/github/annotations';
import { emptyComment, fourMixedAnalysisResults, twoMixedAnalysisResults, warningComment } from './objects/annotations';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock, githubConfigMock } from '../../.setup/mock';

describe('getPostedReviewComments', () => {
  it('should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    let error: any;
    try {
      await getPostedReviewComments();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('This function can only be run on a pull request.');
  });

  it('should return single file on getPostedReviewComments', async () => {
    githubConfigMock.pullRequestNumber = 1;
    (octokit.paginate as any).mockReturnValueOnce([{ id: 1 }]);

    const response = await getPostedReviewComments();

    expect(response).toEqual([{ id: 1 }]);
  });

  it('should be called with specific parameters on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getPostedReviewComments();

    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listReviewComments, { repo: 'test', owner: 'tester', pull_number: 1 });
  });

  it('should return three files on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getPostedReviewComments();

    expect(response as any[]).toHaveLength(3);
  });

  it('should post a notice when getPostedReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedReviewComments();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('deletePreviousReviewComments', () => {
  it('should call deleteReviewComment once on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, emptyComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, warningComment]);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([emptyComment, emptyComment]);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should post a notice when deletePreviousReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await deletePreviousReviewComments([warningComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postAnnotations', () => {
  it('should post two annotations when showBlockingAfter is true', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = true;

    postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path0.js',
      title: 'CS: rule 0',
      startLine: 0
    });

    expect(noticeSpy).toHaveBeenCalledTimes(1);
    expect(noticeSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking after'), {
      file: 'path1.js',
      title: 'CS: rule 1',
      startLine: 1
    });
  });

  it('should post four annotations when showBlockingAfter is true', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = true;

    postAnnotations(fourMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path0.js',
      title: 'CS: rule 0',
      startLine: 0
    });
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path2.js',
      title: 'CS: rule 2',
      startLine: 2
    });

    expect(noticeSpy).toHaveBeenCalledTimes(2);
    expect(noticeSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking after'), {
      file: 'path1.js',
      title: 'CS: rule 1',
      startLine: 1
    });
    expect(noticeSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking after'), {
      file: 'path3.js',
      title: 'CS: rule 3',
      startLine: 3
    });
  });

  it('should post only a blocking annotation when showBlockingAfter is false', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = false;

    postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path0.js',
      title: 'CS: rule 0',
      startLine: 0
    });

    expect(noticeSpy).toHaveBeenCalledTimes(0);
  });

  it('should post only two blocking annotations when showBlockingAfter is false', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = false;

    postAnnotations(fourMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path0.js',
      title: 'CS: rule 0',
      startLine: 0
    });
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('Blocking'), {
      file: 'path2.js',
      title: 'CS: rule 2',
      startLine: 2
    });

    expect(noticeSpy).toHaveBeenCalledTimes(0);
  });
});
