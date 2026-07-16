import { vi } from 'vitest';
import { summary } from './summary_mock';
import { GithubEvent } from '../../src/configuration/github-event';
import { ShowAnnotationSeverity } from '../../src/configuration/action';

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
  configuration: '',
  trustStrategy: 'strict',
  baseUrl: '',
  displayUrl: '',
  createProject: false
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
  showAnnotationSeverity: ShowAnnotationSeverity.AFTER
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

vi.mock('../../src/configuration/config', () => {
  return {
    githubConfig: githubConfigMock,
    ticsConfig: ticsConfigMock,
    actionConfig: actionConfigMock,
    ticsCli: ticsCliMock
  };
});

vi.mock('../../src/viewer/http-client', () => {
  return {
    httpClient: {
      get: vi.fn(),
      delete: vi.fn(),
      post: vi.fn(),
      put: vi.fn()
    }
  };
});

vi.mock('../../src/github/octokit', () => {
  return {
    octokit: {
      paginate: vi.fn(),
      rest: {
        pulls: {
          listFiles: () => {},
          listReviewComments: () => {},
          createReview: vi.fn(),
          deleteReviewComment: vi.fn()
        },
        issues: {
          listComments: vi.fn(),
          createComment: vi.fn(),
          deleteComment: vi.fn()
        },
        repos: {
          getCommit: vi.fn()
        },
        actions: {
          listJobsForWorkflowRunAttempt: vi.fn()
        },
        rateLimit: {
          get: vi.fn()
        },
        checks: {
          create: vi.fn(),
          update: vi.fn()
        }
      },
      graphql: {
        paginate: vi.fn()
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

vi.mock('@actions/github', () => {
  return {
    context: contextMock
  };
});

vi.mock('@actions/core', () => {
  return {
    info: vi.fn(),
    debug: vi.fn(),
    notice: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    setFailed: vi.fn(),
    getInput: vi.fn(),
    getBooleanInput: vi.fn(),
    isDebug: vi.fn(),
    setOutput: vi.fn(),
    summary: summary
  };
});
vi.mock('@actions/exec', () => {
  return {
    exec: vi.fn()
  };
});
vi.mock('@actions/artifact', () => {
  return {
    DefaultArtifactClient: class {
      uploadArtifact = vi.fn();
    }
  };
});
vi.mock('@actions/artifact-v1', () => {
  return {
    create: vi.fn().mockImplementation(() => ({
      uploadArtifact: vi.fn()
    }))
  };
});
vi.mock('fs', () => {
  return {
    writeFileSync: vi.fn(),
    existsSync: vi.fn(),
    readdirSync: vi.fn()
  };
});
vi.mock('canonical-path', () => {
  return {
    resolve: vi.fn(data => data),
    normalize: vi.fn(data => data),
    join: vi.fn((one, two) => `${one}/${two}`)
  };
});
vi.mock('os', () => {
  return {
    tmpdir: vi.fn(() => '/tmp'),
    platform: vi.fn(),
    EOL: '\n'
  };
});
