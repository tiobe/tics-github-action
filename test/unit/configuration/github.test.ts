import * as core from '@actions/core';
import { GithubConfig } from '../../../src/configuration/github';
import { contextMock } from '../../.setup/mock';

describe('GitHub Configuration', () => {
  let githubConfig: GithubConfig;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(core, 'isDebug');

    jest.mock('@actions/github', () => ({
      get context() {
        return contextMock;
      }
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should set variables taken from context', () => {
    contextMock.apiUrl = 'api.github.com';
    contextMock.repo = { repo: 'tics-github-action', owner: 'tiobe' };
    contextMock.sha = 'sha-128';
    contextMock.eventName = 'pull_request';
    contextMock.runId = 123;
    contextMock.runNumber = 1;
    contextMock.payload = { pull_request: { number: 1 } };

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      apiUrl: 'api.github.com',
      owner: 'tiobe',
      reponame: 'tics-github-action',
      commitSha: 'sha-128',
      event: { name: 'pull_request', isPullRequest: true },
      id: '123-1',
      pullRequestNumber: 1
    });
  });
  test('Should get pull request number from environment if context is not available', () => {
    contextMock.payload.pull_request = undefined;

    process.env.PULL_REQUEST_NUMBER = '2';

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      pullRequestNumber: 2
    });
  });

  test('Should get pull request number undefined if none are available', () => {
    contextMock.payload.pull_request = undefined;
    delete process.env.PULL_REQUEST_NUMBER;

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      pullRequestNumber: undefined
    });
  });

  test('Should get debug false if the debug mode is off', () => {
    debugSpy.mockReturnValue(false);

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      debugger: false
    });
  });

  test('Should get debug true if the debug mode is on', () => {
    debugSpy.mockReturnValue(true);

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      debugger: true
    });
  });

  test('Should call removeWarningListener without errors', () => {
    githubConfig = new GithubConfig();
    githubConfig.removeWarningListener();
  });
});
