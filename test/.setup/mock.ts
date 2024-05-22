import { jest } from '@jest/globals';
import { summary } from './summary_mock';

export const githubConfigMock = {
  apiUrl: 'github.com/api/v1/',
  owner: 'tester',
  reponame: 'test',
  commitSha: 'sha-128',
  eventName: '',
  id: '123-1',
  pullRequestNumber: 1,
  debugger: false
};

export const ticsConfigMock = {
  ticsAuthToken: 'token',
  filelist: '',
  githubToken: '',
  hostnameVerification: false,
  installTics: false,
  mode: 'client',
  ticsConfiguration: '',
  trustStrategy: 'strict',
  baseUrl: '',
  viewerUrl: ''
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

jest.mock('../../src/configuration/_config', () => {
  return {
    githubConfig: githubConfigMock,
    ticsConfig: ticsConfigMock,
    actionConfig: actionConfigMock,
    ticsCli: ticsCliMock
  };
});

jest.mock('../../src/viewer/_http-client', () => {
  return {
    httpClient: {
      get: jest.fn()
    }
  };
});

jest.mock('../../src/github/_octokit', () => {
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
        }
      },
      graphql: jest.fn()
    }
  };
});

export const contextMock: {
  apiUrl: string;
  repo: {
    repo: string;
    owner: string;
  };
  sha: string;
  eventName: string;
  runId: number;
  runNumber: number;
  payload: {
    pull_request:
      | {
          number: number;
        }
      | undefined;
  };
} = {
  apiUrl: 'api.github.com',
  repo: {
    repo: 'tics-github-action',
    owner: 'tiobe'
  },
  sha: 'sha-128',
  eventName: 'pull_request',
  runId: 123,
  runNumber: 1,
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
    exportVariable: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    notice: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    setFailed: jest.fn(),
    getInput: jest.fn(),
    getBooleanInput: jest.fn(),
    isDebug: jest.fn(),
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
    create: jest.fn(() => {
      return { uploadArtifact: jest.fn() };
    })
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
    EOL: jest.requireActual<typeof import('os')>('os').EOL
  };
});
