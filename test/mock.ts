import { jest } from '@jest/globals';

jest.mock('../src/github/configuration', () => {
  return {
    ticsConfig: {
      projectName: 'project',
      ticsConfiguration: 'http://localhost/tiobeweb/TiCS/api/cfg?name=default'
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
      githubToken: '',
      pullRequestNumber: '1'
    },
    octokit: {
      paginate: jest.fn(),
      rest: {
        pulls: {
          listFiles: () => {},
          listReviewComments: () => {},
          deleteReviewComment: jest.fn()
        },
        issues: {
          createComment: jest.fn()
        }
      }
    }
  };
});
jest.mock('@actions/core', () => {
  return {
    info: jest.fn(data => console.log(data)),
    debug: jest.fn(data => console.log(data)),
    error: jest.fn(data => console.error(data)),
    setFailed: jest.fn(data => console.error(data))
  };
});
jest.mock('fs', () => {
  return {
    writeFileSync: jest.fn()
  };
});
jest.mock('canonical-path', () => {
  return {
    resolve: jest.fn()
  };
});
