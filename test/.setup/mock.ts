import { jest } from '@jest/globals';
import { summary } from './summary_mock';
import { ticsCli } from '../../src/configuration/_config';

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
  trustStrategy: 'strict'
};

export const actionConfigMock = {
  retryConfig: {
    delay: 5,
    maxRetries: 100,
    codes: [502, 503, 504]
  },
  secretsFilter: []
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
  additionalFlags: '',
  cliOptions: []
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
// jest.mock('../../src/configuration', () => {
//   return {
//     ticsConfig: {
//       project: 'project',
//       ticsConfiguration: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
//       calc: 'GATE',
//       pullRequestApproval: false,
//       secretsFilter: [],
//       postToConversation: true
//     },
//     githubConfig: {
//       repo: 'test',
//       owner: 'tester',
//       reponame: 'test',
//       branchname: '',
//       basebranchname: '',
//       branchdir: '',
//       eventName: '',
//       runnerOS: '',
//       pullRequestNumber: '1',
//       id: '123-1',
//       commitSha: 'asdfghjk'
//     },
//     retryConfig: {
//       maxRetries: 10,
//       retryCodes: [502, 503, 504]
//     },
//     octokit: {
//       paginate: jest.fn(),
//       rest: {
//         pulls: {
//           listFiles: () => {},
//           listReviewComments: () => {},
//           createReview: jest.fn(),
//           deleteReviewComment: jest.fn()
//         },
//         issues: {
//           listComments: jest.fn(),
//           createComment: jest.fn(),
//           deleteComment: jest.fn()
//         },
//         repos: {
//           getCommit: jest.fn()
//         }
//       },
//       graphql: jest.fn()
//     },
//     httpClient: {
//       get: jest.fn()
//     },
//     viewerUrl: 'http://viewer.com',
//     baseUrl: 'http://base.com'
//   };
// });
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
