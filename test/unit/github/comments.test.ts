import { logger } from '../../../src/helper/logger';
import { deletePreviousComments, getPostedComments, postComment } from '../../../src/github/comments';
import { Comment } from '../../../src/github/interfaces';
import { octokit } from '../../../src/github/octokit';
import { githubConfig } from '../../../src/configuration/config';

describe('getPostedReviewComments', () => {
  const octokitSpy = jest.spyOn(octokit, 'paginate');

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should return single file on getPostedReviewComments', async () => {
    octokitSpy.mockResolvedValue([{ id: 1 }]);

    const response = await getPostedComments();
    expect(response).toEqual([{ id: 1 }]);
  });

  test('Should be called with specific parameters on getPostedReviewComments', async () => {
    octokitSpy.mockResolvedValue([]);
    const spy = jest.spyOn(octokit, 'paginate');

    await getPostedComments();
    expect(spy).toHaveBeenCalledWith(octokit.rest.issues.listComments, { repo: 'test', owner: 'tester', issue_number: 1 });
  });

  test('Should return three files on getPostedReviewComments', async () => {
    octokitSpy.mockResolvedValue([{}, {}, {}]);

    const response = await getPostedComments();
    expect((response as any[]).length).toEqual(3);
  });

  test('Should post a notice on when octokit throws', async () => {
    const spy = jest.spyOn(logger, 'notice');
    octokitSpy.mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedComments();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postComment', () => {
  let postCommentSpy: jest.SpyInstance;

  beforeEach(() => {
    postCommentSpy = jest.spyOn(octokit.rest.issues, 'createComment');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should call createComment once', async () => {
    await postComment('Comment body...');
    expect(postCommentSpy).toHaveBeenCalledTimes(1);
  });

  test('Should call createComment with values', async () => {
    await postComment('Comment body...');
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: 1,
      body: 'Comment body...'
    };
    expect(postCommentSpy).toHaveBeenCalledWith(calledWith);
  });

  test('Should post a notice when createComment throws', async () => {
    postCommentSpy.mockRejectedValue(Error());
    const noticeSpy = jest.spyOn(logger, 'notice');

    await postComment('Comment body...');

    expect(noticeSpy).toHaveBeenCalledTimes(1);
  });
});

describe('deletePreviousComments', () => {
  let deleteCommentSpy: jest.SpyInstance;

  beforeEach(() => {
    deleteCommentSpy = jest.spyOn(octokit.rest.issues, 'deleteComment');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should call deleteComment once', async () => {
    await deletePreviousComments([commentWithBody]);
    expect(deleteCommentSpy).toHaveBeenCalledTimes(1);
  });

  test('Should call deleteComment twice', async () => {
    await deletePreviousComments([commentWithBody, commentWithBody]);
    expect(deleteCommentSpy).toHaveBeenCalledTimes(2);
  });

  test('Should call deleteComment with values', async () => {
    deletePreviousComments([commentWithBody]);
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      comment_id: 0
    };
    expect(deleteCommentSpy).toHaveBeenCalledWith(calledWith);
  });

  test('Should call deleteComment with values', async () => {
    await deletePreviousComments([commentWithoutBody]);
    expect(deleteCommentSpy).toHaveBeenCalledTimes(0);
  });

  test('Should post a notice when deleteComment throws', async () => {
    deleteCommentSpy.mockRejectedValue(Error());
    const noticeSpy = jest.spyOn(logger, 'notice');

    await deletePreviousComments([commentWithBody]);

    expect(noticeSpy).toHaveBeenCalledTimes(1);
  });
});

const commentWithBody: Comment = {
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

const commentWithoutBody: Comment = {
  url: '',
  html_url: '',
  issue_url: '',
  id: 0,
  node_id: '',
  user: null,
  created_at: '',
  updated_at: '',
  body: undefined
};
