import { githubConfig, octokit } from '../../../src/configuration';
import { deletePreviousComments, postErrorComment } from '../../../src/github/posting/comments';
import { createErrorSummary } from '../../../src/helper/summary';
import { logger } from '../../../src/helper/logger';
import { Comment } from '../../../src/github/interfaces/interfaces';

jest.mock('../../../src/helper/summary', () => {
  return {
    createErrorSummary: jest.fn()
  };
});

describe('postErrorComment', () => {
  test('Should call createComment once', async () => {
    (createErrorSummary as any).mockReturnValueOnce('body');
    const spy = jest.spyOn(octokit.rest.issues, 'createComment');
    const analysis = {
      completed: true,
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
      completed: true,
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

  test('Should throw an error on postErrorComment', async () => {
    (createErrorSummary as any).mockReturnValueOnce('body');
    jest.spyOn(octokit.rest.issues, 'createComment').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(logger, 'error');

    const analysis = {
      completed: false,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0
    };
    await postErrorComment(analysis);

    expect(spy).toBeCalledTimes(1);
  });
});

describe('deletePreviousComments', () => {
  test('Should call deleteComment once', async () => {
    const spy = jest.spyOn(octokit.rest.issues, 'deleteComment');

    deletePreviousComments([comment]);
    expect(spy).toBeCalledTimes(1);
  });

  test('Should call createComment with values', async () => {
    (createErrorSummary as any).mockReturnValueOnce('body');
    const spy = jest.spyOn(octokit.rest.issues, 'deleteComment');

    deletePreviousComments([comment]);
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      comment_id: 0
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should throw an error on postErrorComment', async () => {
    (createErrorSummary as any).mockReturnValueOnce('body');
    jest.spyOn(octokit.rest.issues, 'deleteComment').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(logger, 'error');

    deletePreviousComments([comment]);

    expect(spy).toBeCalledTimes(1);
  });
});

const comment: Comment = {
  url: '',
  html_url: '',
  issue_url: '',
  id: 0,
  node_id: '',
  user: null,
  created_at: '',
  updated_at: '',
  body: '<h1>TICS Quality Gate</h1>'
};
