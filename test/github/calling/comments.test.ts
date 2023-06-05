import { getPostedComments } from '../../../src/github/calling/comments';
import { octokit } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';

describe('getPostedReviewComments', () => {
  test('Should return single file on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{ id: 1 }]);

    const response = await getPostedComments();
    expect(response).toEqual([{ id: 1 }]);
  });

  test('Should be called with specific parameters on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getPostedComments();
    expect(spy).toHaveBeenCalledWith(octokit.rest.issues.listComments, { repo: 'test', owner: 'tester', issue_number: '1' });
  });

  test('Should return three files on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getPostedComments();
    expect((response as any[]).length).toEqual(3);
  });

  test('Should throw an error on getPostedReviewComments', async () => {
    const spy = jest.spyOn(logger, 'error');
    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedComments();
    expect(spy).toBeCalledTimes(1);
  });
});
