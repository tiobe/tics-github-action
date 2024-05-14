import { deletePreviousReviewComments, getPostedReviewComments, postAnnotations } from '../../../src/github/annotations';
import { emptyComment, fourMixedAnalysisResults, twoMixedAnalysisResults, warningComment } from './objects/annotations';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock } from '../../.setup/mock';

describe('getPostedReviewComments', () => {
  test('Should return single file on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{ id: 1 }]);

    const response = await getPostedReviewComments();
    expect(response).toEqual([{ id: 1 }]);
  });

  test('Should be called with specific parameters on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getPostedReviewComments();
    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listReviewComments, { repo: 'test', owner: 'tester', pull_number: 1 });
  });

  test('Should return three files on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getPostedReviewComments();
    expect((response as any[]).length).toEqual(3);
  });

  test('Should post a notice when getPostedReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedReviewComments();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('deletePreviousReviewComments', () => {
  test('Should call deleteReviewComment once on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, emptyComment]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, warningComment]);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([emptyComment, emptyComment]);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('Should post a notice when deletePreviousReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await deletePreviousReviewComments([warningComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postAnnotations', () => {
  test('Should post two annotations when showBlockingAfter is true', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = true;

    postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith('body 0', {
      file: 'path0.js',
      title: 'title 0',
      startLine: 0
    });

    expect(noticeSpy).toHaveBeenCalledTimes(1);
    expect(noticeSpy).toHaveBeenCalledWith('body 1', {
      file: 'path1.js',
      title: 'title 1',
      startLine: 1
    });
  });

  test('Should post four annotations when showBlockingAfter is true', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = true;

    postAnnotations(fourMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(warningSpy).toHaveBeenCalledWith('body 0', {
      file: 'path0.js',
      title: 'title 0',
      startLine: 0
    });
    expect(warningSpy).toHaveBeenCalledWith('body 2', {
      file: 'path2.js',
      title: 'title 2',
      startLine: 2
    });

    expect(noticeSpy).toHaveBeenCalledTimes(2);
    expect(noticeSpy).toHaveBeenCalledWith('body 1', {
      file: 'path1.js',
      title: 'title 1',
      startLine: 1
    });
    expect(noticeSpy).toHaveBeenCalledWith('body 3', {
      file: 'path3.js',
      title: 'title 3',
      startLine: 3
    });
  });

  test('Should post only a blocking annotation when showBlockingAfter is false', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = false;

    postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith('body 0', {
      file: 'path0.js',
      title: 'title 0',
      startLine: 0
    });

    expect(noticeSpy).toHaveBeenCalledTimes(0);
  });

  test('Should post only two blocking annotations when showBlockingAfter is false', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    actionConfigMock.showBlockingAfter = false;

    postAnnotations(fourMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(warningSpy).toHaveBeenCalledWith('body 0', {
      file: 'path0.js',
      title: 'title 0',
      startLine: 0
    });
    expect(warningSpy).toHaveBeenCalledWith('body 2', {
      file: 'path2.js',
      title: 'title 2',
      startLine: 2
    });

    expect(noticeSpy).toHaveBeenCalledTimes(0);
  });
});
