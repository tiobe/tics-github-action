import { expect, test, jest } from '@jest/globals';
import { getChangedFiles } from '../src/github/calling/pulls';

jest.mock('../src/github/configuration', () => {
  return {
    ticsConfig: {
      projectName: 'project',
      ticsConfiguration: 'http://localhost/tiobeweb/TiCS/api/cfg?name=default'
    },
    githubConfig: {
      repo: '',
      owner: '',
      reponame: '',
      branchname: '',
      basebranchname: '',
      branchdir: '',
      eventName: '',
      runnerOS: '',
      githubToken: '',
      pullRequestNumber: ''
    },
    octokit: jest.fn(() => {
      return {
        paginate: jest.fn(() => {
          return [];
        }),
        rest: jest.fn(() => {
          return {};
        })
      };
    })
  };
});
jest.mock('@actions/core', () => {
  return {
    info: jest.fn(data => console.log(data)),
    debug: jest.fn(data => console.log(data)),
    error: jest.fn(data => console.log(data)),
    setFailed: jest.fn(data => console.log(data)),
    getInput: jest.fn(() => '')
  };
});

test('Should return retrieved files', async () => {
  const hello = getChangedFiles();
  console.log(hello);
});
