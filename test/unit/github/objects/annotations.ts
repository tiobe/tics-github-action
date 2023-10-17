import { Links, ReviewComment, User } from '../../../../src/github/interfaces';

export const user: User = {
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

export const links: Links = {
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

export const warningComment: ReviewComment = {
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

export const emptyComment: ReviewComment = {
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
