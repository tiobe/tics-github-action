import { deletePreviousReviewComments } from '../../../src/github/posting/annotations';
import { octokit } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';
import { Links, ReviewComment, User } from '../../../src/github/interfaces/interfaces';

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

const user: User = {
  login: '',
  id: 0,
  node_id: '',
  avatar_url: '',
  gravatar_id: null,
  url: '',
  html_url: '',
  followers_url: '',
  following_url: '',
  gists_url: '',
  starred_url: '',
  subscriptions_url: '',
  organizations_url: '',
  repos_url: '',
  events_url: '',
  received_events_url: '',
  type: '',
  site_admin: false
};

const links: Links = {
  self: {
    href: 'link'
  },
  html: {
    href: 'link'
  },
  pull_request: {
    href: 'link'
  }
};

const warningComment: ReviewComment = {
  id: 1,
  body: ':warning: **TICS:',
  url: '',
  pull_request_review_id: null,
  node_id: '',
  diff_hunk: '',
  path: '',
  position: 0,
  original_position: 0,
  commit_id: '',
  original_commit_id: '',
  user: user,
  created_at: '',
  updated_at: '',
  html_url: '',
  pull_request_url: '',
  author_association: 'COLLABORATOR',
  _links: links
};

const emptyComment: ReviewComment = {
  id: 2,
  body: '',
  url: '',
  pull_request_review_id: null,
  node_id: '',
  diff_hunk: '',
  path: '',
  position: 0,
  original_position: 0,
  commit_id: '',
  original_commit_id: '',
  user: user,
  created_at: '',
  updated_at: '',
  html_url: '',
  pull_request_url: '',
  author_association: 'COLLABORATOR',
  _links: links
};
