import { Links, ReviewComment, User } from '../../../../src/github/interfaces';
import { AnalysisResult, ExtendedAnnotation, TicsReviewComment } from '../../../../src/helper/interfaces';

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
  message: 'failed',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
      explorerUrl: '',
      analyzedFiles: [],
      reviewComments: {
        postable: [
          {
            fullPath: 'HIE://path0.js',
            path: 'path0.js',
            line: 0,
            level: 1,
            category: 'category 0',
            rule: 'rule 0',
            msg: 'message 0',
            supp: false,
            type: 'type 0',
            count: 1,
            gateId: 1,
            displayCount: '1x',
            blocking: {
              state: 'yes'
            },
            instanceName: 'CS'
          }
        ],
        unpostable: []
      }
    }
  ],
  passedWithWarning: false
};

const twoAnnotations: ExtendedAnnotation[] = [
  {
    fullPath: 'HIE://path0.js',
    path: 'path0.js',
    line: 0,
    level: 1,
    category: 'category 0',
    rule: 'rule 0',
    msg: 'message 0',
    supp: false,
    type: 'type 0',
    count: 1,
    gateId: 1,
    displayCount: '1x',
    blocking: {
      state: 'yes'
    },
    instanceName: 'CS'
  },
  {
    fullPath: 'HIE://path1.js',
    path: 'path1.js',
    line: 1,
    level: 2,
    category: 'category 1',
    rule: 'rule 1',
    msg: 'message 1',
    supp: false,
    type: 'type 1',
    count: 1,
    gateId: 1,
    displayCount: '1x',
    blocking: {
      state: 'after',
      after: 1757429236
    },
    instanceName: 'CS'
  }
];

const fourAnnotations: ExtendedAnnotation[] = [
  ...twoAnnotations,
  {
    fullPath: 'HIE://path2.js',
    path: 'path2.js',
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
  },
  {
    fullPath: 'HIE://path3.js',
    path: 'path3.js',
    line: 3,
    level: 2,
    category: 'category 3',
    rule: 'rule 3',
    msg: 'message 3',
    supp: false,
    type: 'type 3',
    count: 1,
    gateId: 1,
    displayCount: '1x',
    blocking: {
      state: 'after',
      after: 1757429236
    },
    instanceName: 'CS'
  }
];

export const twoMixedAnalysisResults: AnalysisResult = {
  passed: false,
  message: 'failed',
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
  message: 'failed',
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
