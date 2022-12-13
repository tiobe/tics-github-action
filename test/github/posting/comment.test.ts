import { expect, test, jest } from '@jest/globals';
import { githubConfig, octokit } from '../../../src/github/configuration';
import { postErrorComment } from '../../../src/github/posting/comment';
import { createErrorSummary } from '../../../src/github/posting/summary';

jest.mock('../../../src/github/posting/summary', () => {
  return {
    createErrorSummary: jest.fn()
  };
});

test('Should call createComment once', async () => {
  (createErrorSummary as any).mockReturnValueOnce('body');
  const spy = jest.spyOn(octokit.rest.issues, 'createComment');
  const analysis = {
    errorList: ['error1'],
    warningList: [],
    statusCode: 0
  };
  await postErrorComment(analysis);
  expect(spy).toBeCalledTimes(1);
});

test('Should call createComment with values', async () => {
  (createErrorSummary as any).mockReturnValueOnce('body');
  const spy = jest.spyOn(octokit.rest.issues, 'createComment');
  const analysis = {
    errorList: ['error1'],
    warningList: [],
    statusCode: 0
  };
  await postErrorComment(analysis);
  const calledWith = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    issue_number: githubConfig.pullRequestNumber,
    body: 'body'
  };
  expect(spy).toBeCalledWith(calledWith);
});
