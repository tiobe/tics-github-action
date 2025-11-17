import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { GithubConfig } from '../../../src/configuration/github';
import { contextMock } from '../../.setup/mock';
import { GithubEvent } from '../../../src/configuration/github-event';

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

  it('Should set variables taken from context', () => {
    contextMock.action = 'tics-github-action';
    contextMock.apiUrl = 'api.github.com';
    contextMock.repo = { repo: 'tics-github-action', owner: 'tiobe' };
    contextMock.sha = 'sha-128';
    contextMock.eventName = 'pull_request';
    contextMock.runId = 123;
    contextMock.job = 'TICS';
    contextMock.runNumber = 1;
    contextMock.payload = { pull_request: { number: 1 } };

    process.env.GITHUB_RUN_ATTEMPT = '1';

    githubConfig = new GithubConfig();

    expect(githubConfig).toMatchObject({
      apiUrl: 'api.github.com',
      owner: 'tiobe',
      reponame: 'tics-github-action',
      sha: 'sha-128',
      event: { name: 'pull_request', isPullRequest: true },
      id: `123_1_TICS_tics-github-action`,
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

  it('getCommentIdentifier', () => {
    githubConfig = new GithubConfig();
    expect(githubConfig.getCommentIdentifier()).toEqual('tics-client_TICS_1_1');
  });

  it('getGithubEvent', () => {
    contextMock.eventName = 'undefined';
    expect(new GithubConfig().event).toEqual(GithubEvent.PUSH);
    contextMock.eventName = GithubEvent.PUSH.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.PUSH);
    contextMock.eventName = GithubEvent.PULL_REQUEST.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.PULL_REQUEST);
    contextMock.eventName = GithubEvent.PULL_REQUEST_TARGET.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.PULL_REQUEST_TARGET);
    contextMock.eventName = GithubEvent.WORKFLOW_CALL.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.WORKFLOW_CALL);
    contextMock.eventName = GithubEvent.WORKFLOW_DISPATCH.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.WORKFLOW_DISPATCH);
    contextMock.eventName = GithubEvent.WORKFLOW_RUN.name;
    expect(new GithubConfig().event).toEqual(GithubEvent.WORKFLOW_RUN);
  });
});
