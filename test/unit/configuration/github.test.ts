import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { GithubConfig } from '../../../src/configuration/github';
import { contextMock } from '../../.setup/mock';

describe('gitHub Configuration', () => {
  let githubConfig: GithubConfig;
  let debugSpy: jest.SpiedFunction<typeof core.isDebug>;

  beforeEach(() => {
    debugSpy = jest.spyOn(core, 'isDebug');

    jest.mock<typeof import('@actions/github')>('@actions/github', (): any => ({
      get context() {
        return contextMock;
      }
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should set variables taken from context', () => {
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

  it('should get pull request number from environment if context is not available', () => {
    contextMock.payload.pull_request = undefined;

    process.env.PULL_REQUEST_NUMBER = '2';

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      pullRequestNumber: 2
    });
  });

  it('should get pull request number undefined if none are available', () => {
    contextMock.payload.pull_request = undefined;
    delete process.env.PULL_REQUEST_NUMBER;

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      pullRequestNumber: undefined
    });
  });

  it('should get debug false if the debug mode is off', () => {
    debugSpy.mockReturnValue(false);

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      debugger: false
    });
  });

  it('should get debug true if the debug mode is on', () => {
    debugSpy.mockReturnValue(true);

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      debugger: true
    });
  });

  it('should call removeWarningListener without errors', () => {
    githubConfig = new GithubConfig();
    githubConfig.removeWarningListener();

    expect(true).toBeTruthy();
  });
});
