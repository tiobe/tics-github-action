import { getPostedReviewComments } from '../../../src/github/calling/annotations';
import { octokit } from '../../../src/configuration';
import Logger from '../../../src/helper/logger';

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
    const spy = jest.spyOn(Logger.Instance, 'error');
    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedReviewComments();
    expect(spy).toBeCalledTimes(1);
  });
});
