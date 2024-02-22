import { deletePreviousReviewComments, getPostedReviewComments, postAnnotations } from '../../../src/github/annotations';
import { octokit, ticsConfig } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';
import { emptyComment, fourMixedAnalysisResults, twoMixedAnalysisResults, warningComment } from './objects/annotations';

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
    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listReviewComments, { repo: 'test', owner: 'tester', pull_number: '1' });
  });

  test('Should return three files on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getPostedReviewComments();
    expect((response as any[]).length).toEqual(3);
  });

  test('Should throw an error on getPostedReviewComments', async () => {
    const spy = jest.spyOn(logger, 'error');
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

    deletePreviousReviewComments([warningComment, emptyComment]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    deletePreviousReviewComments([warningComment, warningComment]);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    deletePreviousReviewComments([emptyComment, emptyComment]);
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('Should throw an error on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(logger, 'error');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    deletePreviousReviewComments([warningComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postAnnotations', () => {
  test('Should post two annotations when showBlockingAfter is true', () => {
    const warningSpy = jest.spyOn(logger, 'warning');
    const noticeSpy = jest.spyOn(logger, 'notice');

    ticsConfig.showBlockingAfter = true;

    postAnnotations(twoMixedAnalysisResults);

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

    ticsConfig.showBlockingAfter = true;

    postAnnotations(fourMixedAnalysisResults);

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

    ticsConfig.showBlockingAfter = false;

    postAnnotations(twoMixedAnalysisResults);

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

    ticsConfig.showBlockingAfter = false;

    postAnnotations(fourMixedAnalysisResults);

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
