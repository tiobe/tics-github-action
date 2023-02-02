import { deletePreviousReviewComments } from '../../../src/github/posting/annotations';
import { octokit } from '../../../src/configuration';
import Logger from '../../../src/helper/logger';

describe('deletePreviousReviewComments', () => {
  test('Should call deleteReviewComment once on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([
      { id: 1, body: ':warning: **TiCS:' },
      { id: 2, body: '' }
    ]);
    expect(spy).toBeCalledTimes(1);
  });

  test('Should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([
      { id: 1, body: ':warning: **TiCS:' },
      { id: 2, body: ':warning: **TiCS:' }
    ]);
    expect(spy).toBeCalledTimes(2);
  });

  test('Should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([
      { id: 1, body: '' },
      { id: 2, body: '' }
    ]);
    expect(spy).toBeCalledTimes(0);
  });

  test('Should throw an error on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(Logger.Instance, 'error');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await deletePreviousReviewComments([{ id: 1, body: ':warning: **TiCS:' }]);

    expect(spy).toBeCalledTimes(1);
  });
});
