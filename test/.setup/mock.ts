import { jest } from '@jest/globals';

jest.mock('../../src/configuration', () => {
  return {
    ticsConfig: {
      projectName: 'project',
      ticsConfiguration: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
      calc: 'GATE',
      pullRequestApproval: false,
      secretsFilter: [],
      postToConversation: true
    },
    githubConfig: {
      repo: 'test',
      owner: 'tester',
      reponame: 'test',
      branchname: '',
      basebranchname: '',
      branchdir: '',
      eventName: '',
      runnerOS: '',
      pullRequestNumber: '1'
    },
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
        }
      }
    },
    requestInit: { headers: {} },
    viewerUrl: '<url>',
    baseUrl: 'http://base.com'
  };
});
jest.mock('@actions/core', () => {
  let summaryOutput = '';
  return {
    exportVariable: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    setFailed: jest.fn(),
    summary: {
      addBreak: jest.fn(() => (summaryOutput += '\n')),
      addEOL: jest.fn(() => (summaryOutput += '\n')),
      addHeading: jest.fn((heading, level) => (summaryOutput += `${level ? level : 1} ${heading}\n`)),
      addLink: jest.fn((text, link) => (summaryOutput += `[${text}](${link})`)),
      addRaw: jest.fn(raw => (summaryOutput += raw)),
      addTable: jest.fn(),
      clear: jest.fn(() => (summaryOutput = '')),
      stringify: jest.fn(() => {
        return summaryOutput;
      })
    }
  };
});
jest.mock('@actions/exec', () => {
  return {
    exec: jest.fn()
  };
});
jest.mock('node-fetch', () => jest.fn());
jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn(),
    existsSync: jest.fn()
  };
});
jest.mock('canonical-path', () => {
  return {
    resolve: jest.fn(data => data),
    normalize: jest.fn(data => data)
  };
});
jest.mock('proxy-agent', () => {
  return jest.fn();
});
jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
