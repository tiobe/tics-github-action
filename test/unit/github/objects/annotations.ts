import { Links, ReviewComment, User } from '../../../../src/github/interfaces';
import { AnalysisResult, TicsReviewComment } from '../../../../src/helper/interfaces';

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

export const analysisResults: AnalysisResult = {
  passed: false,
  failureMessage: '',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
      explorerUrl: '',
      analyzedFiles: [],
      reviewComments: {
        postable: [
          {
            blocking: undefined,
            title: '',
            body: '',
            line: 0
          }
        ],
        unpostable: []
      }
    }
  ],
  passedWithWarning: false
};

const twoAnnotations: TicsReviewComment[] = [
  {
    path: 'path0.js',
    blocking: 'yes',
    title: 'title 0',
    body: 'body 0',
    line: 0
  },
  {
    path: 'path1.js',
    blocking: 'after',
    title: 'title 1',
    body: 'body 1',
    line: 1
  }
];

const fourAnnotations: TicsReviewComment[] = [
  {
    path: 'path0.js',
    blocking: 'yes',
    title: 'title 0',
    body: 'body 0',
    line: 0
  },
  {
    path: 'path1.js',
    blocking: 'after',
    title: 'title 1',
    body: 'body 1',
    line: 1
  },
  {
    path: 'path2.js',
    blocking: 'yes',
    title: 'title 2',
    body: 'body 2',
    line: 2
  },
  {
    path: 'path3.js',
    blocking: 'after',
    title: 'title 3',
    body: 'body 3',
    line: 3
  }
];

export const twoMixedAnalysisResults: AnalysisResult = {
  passed: false,
  failureMessage: '',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
      explorerUrl: '',
      analyzedFiles: [],
      reviewComments: {
        postable: twoAnnotations,
        unpostable: [
          {
            fullPath: 'path2.js',
            line: 2,
            level: 2,
            category: 'category 2',
            rule: 'rule 2',
            msg: 'message 2',
            supp: false,
            type: 'type 2',
            count: 1,
            gateId: 1,
            displayCount: '1x',
            blocking: {
              state: 'yes'
            },
            instanceName: 'CS'
          }
        ]
      }
    }
  ],
  passedWithWarning: false
};

export const fourMixedAnalysisResults: AnalysisResult = {
  passed: false,
  failureMessage: '',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
      explorerUrl: '',
      analyzedFiles: [],
      reviewComments: {
        postable: fourAnnotations,
        unpostable: [
          {
            fullPath: 'path2.js',
            line: 2,
            level: 2,
            category: 'category 2',
            rule: 'rule 2',
            msg: 'message 2',
            supp: false,
            type: 'type 2',
            count: 1,
            gateId: 1,
            displayCount: '1x',
            blocking: {
              state: 'yes'
            },
            instanceName: 'CS'
          }
        ]
      }
    }
  ],
  passedWithWarning: false
};
