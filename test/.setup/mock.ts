import { jest } from '@jest/globals';
import { summary } from './summary_mock';
import { GithubEvent } from '../../src/configuration/github-event';

export const githubConfigMock: {
  apiUrl: string;
  owner: string;
  reponame: string;
  sha: string;
  headSha: string;
  event: GithubEvent;
  job: string;
  action: string;
  id: string;
  pullRequestNumber: number | undefined;
  debugger: boolean;
  workflow: string;
  runNumber: number;
  runAttempt: number;
  runnerName: string;
  getCommentIdentifier(): string;
} = {
  apiUrl: 'github.com/api/v1/',
  owner: 'tester',
  reponame: 'test',
  sha: 'sha-128',
  headSha: 'head-sha-256',
  event: GithubEvent.PUSH,
  job: 'TICS',
  action: 'tics-github-action',
  id: '123_TICS_1_tics-github-action',
  pullRequestNumber: 1,
  debugger: false,
  workflow: 'tics-client',
  runNumber: 1,
  runAttempt: 2,
  runnerName: 'Github Actions 1',
  getCommentIdentifier(): string {
    return [this.workflow, this.job, this.runNumber, this.runAttempt].join('_');
  }
};

export const ticsConfigMock = {
  ticsAuthToken: 'token',
  filelist: '',
  githubToken: '',
  hostnameVerification: false,
  installTics: false,
  mode: 'client',
  viewerUrl: '',
  trustStrategy: 'strict',
  baseUrl: '',
  displayUrl: ''
};

export const actionConfigMock = {
  retryConfig: {
    delay: 5,
    maxRetries: 100,
    codes: [502, 503, 504]
  },
  secretsFilter: ['random'],
  excludeMovedFiles: false,
  postAnnotations: false,
  includeNonBlockingAnnotations: false,
  postToConversation: false,
  pullRequestApproval: false,
  showBlockingAfter: false
};

export const ticsCliMock = {
  project: '',
  branchname: '',
  branchdir: '',
  cdtoken: '',
  codetype: '',
  calc: '',
  nocalc: '',
  norecalc: '',
  recalc: '',
  tmpdir: '',
  additionalFlags: ''
};

jest.mock('../../src/configuration/config', () => {
  return {
    githubConfig: githubConfigMock,
    ticsConfig: ticsConfigMock,
    actionConfig: actionConfigMock,
    ticsCli: ticsCliMock
  };
});

jest.mock('../../src/viewer/http-client', () => {
  return {
    httpClient: {
      get: jest.fn()
    }
  };
});

jest.mock('../../src/github/octokit', () => {
  return {
    octokit: {
      paginate: jest.fn(),
      rest: {
        pulls: {
          listFiles: () => {},
          listReviewComments: () => {},
          createReview: jest.fn(),
          deleteReviewComment: jest.fn()
        },
        issues: {
          listComments: jest.fn(),
          createComment: jest.fn(),
          deleteComment: jest.fn()
        },
        repos: {
          getCommit: jest.fn()
        },
        actions: {
          listJobsForWorkflowRunAttempt: jest.fn()
        },
        rateLimit: {
          get: jest.fn()
        },
        checks: {
          create: jest.fn(),
          update: jest.fn()
        }
      },
      graphql: {
        paginate: jest.fn()
      }
    }
  };
});

export const contextMock: {
  action: string;
  apiUrl: string;
  repo: {
    repo: string;
    owner: string;
  };
  sha: string;
  eventName: string;
  job: string;
  runId: number;
  runNumber: number;
  workflow: string;
  payload: {
    pull_request:
      | {
          number: number;
        }
      | undefined;
  };
} = {
  action: 'tics-github-action',
  apiUrl: 'api.github.com',
  repo: {
    repo: 'tics-github-action',
    owner: 'tiobe'
  },
  sha: 'sha-128',
  eventName: 'pull_request',
  job: 'TICS',
  runId: 123,
  runNumber: 1,
  workflow: 'tics_client',
  payload: {
    pull_request: {
      number: 1
    }
  }
};

jest.mock('@actions/github', () => {
  return {
    context: contextMock
  };
});

jest.mock('@actions/core', () => {
  return {
    info: jest.fn(),
    debug: jest.fn(),
    notice: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    setFailed: jest.fn(),
    getInput: jest.fn(),
    getBooleanInput: jest.fn(),
    isDebug: jest.fn(),
    setOutput: jest.fn(),
    summary: summary
  };
});
jest.mock('@actions/exec', () => {
  return {
    exec: jest.fn()
  };
});
jest.mock('@actions/artifact', () => {
  return {
    DefaultArtifactClient: jest.fn().mockImplementation(() => ({
      uploadArtifact: jest.fn()
    }))
  };
});
jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn(),
    existsSync: jest.fn(),
    readdirSync: jest.fn()
  };
});
jest.mock('canonical-path', () => {
  return {
    resolve: jest.fn(data => data),
    normalize: jest.fn(data => data),
    join: jest.fn((one, two) => `${one}/${two}`)
  };
});
jest.mock('os', () => {
  return {
    tmpdir: jest.fn(() => '/tmp'),
    platform: jest.fn(),
    EOL: '\n'
  };
});
