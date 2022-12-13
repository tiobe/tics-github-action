import { expect, test, jest } from '@jest/globals';
import { deletePreviousReviewComments } from '../../../src/github/posting/annotations';
import { octokit } from '../../../src/github/configuration';
import Logger from '../../../src/helper/logger';

test('Should call deletePreviousReviewComments once on deletePreviousReviewComments', async () => {
  const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

  await deletePreviousReviewComments([
    { id: 1, body: ':warning: **TiCS:' },
    { id: 2, body: '' }
  ]);
  expect(spy).toBeCalledTimes(1);
});

test('Should call deletePreviousReviewComments twice on deletePreviousReviewComments', async () => {
  const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

  await deletePreviousReviewComments([
    { id: 1, body: ':warning: **TiCS:' },
    { id: 2, body: ':warning: **TiCS:' }
  ]);
  expect(spy).toBeCalledTimes(2);
});

test('Should not call deletePreviousReviewComments on deletePreviousReviewComments', async () => {
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
