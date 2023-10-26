import { deletePreviousReviewComments, getPostedReviewComments } from '../../../src/github/annotations';
import { octokit } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';
import { emptyComment, warningComment } from './objects/annotations';

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
    expect(spy).toBeCalledTimes(1);
  });
});

describe('deletePreviousReviewComments', () => {
  test('Should call deleteReviewComment once on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    deletePreviousReviewComments([warningComment, emptyComment]);
    expect(spy).toBeCalledTimes(1);
  });

  test('Should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    deletePreviousReviewComments([warningComment, warningComment]);
    expect(spy).toBeCalledTimes(2);
  });

  test('Should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    deletePreviousReviewComments([emptyComment, emptyComment]);
    expect(spy).toBeCalledTimes(0);
  });

  test('Should throw an error on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(logger, 'error');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    deletePreviousReviewComments([warningComment]);

    expect(spy).toBeCalledTimes(1);
  });
});
