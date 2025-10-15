import { beforeEach, describe, expect, it, jest } from '@jest/globals';

process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECT = 'tics-github-action';
process.env.INPUT_VIEWERURL = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.INPUT_SHOWBLOCKINGAFTER = 'true';
process.env.INPUT_TRUSTSTRATEGY = 'strict';

beforeEach(() => {
  jest.resetModules();

  jest.spyOn(process.stdout, 'write').mockImplementation((): any => {});
});

describe('pullRequestNumber', () => {
  it('should return pullRequestNumber from GitHub context', async () => {
    jest.mock<typeof import('@actions/github')>('@actions/github', (): any => {
      return {
        context: {
          action: '_tics-github-action',
          payload: {
            pull_request: { number: 1 }
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          job: 'TICS',
          workflow: 'tics_client',
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    const pullRequestNumber = require('../../src/configuration/config').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toBe(1);
  });

  it('should return pullRequestNumber from environment variable if no GitHub context', async () => {
    jest.mock<typeof import('@actions/github')>('@actions/github', (): any => {
      return {
        context: {
          action: '_tics-github-action',
          payload: {
            pull_request: undefined
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          job: 'TICS',
          workflow: 'tics_client',
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '2';

    const pullRequestNumber = require('../../src/configuration/config').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toBe(2);
  });

  it('should set undefined as pullRequestNumber when no value was found', async () => {
    jest.mock<typeof import('@actions/github')>('@actions/github', (): any => {
      return {
        context: {
          action: '_tics-github-action',
          payload: {
            pull_request: undefined
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          job: 'TICS',
          workflow: 'tics_client',
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '';

    const pullRequestNumber = require('../../src/configuration/config').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toBeUndefined();
  });
});

describe('urls', () => {
  it('should return base url from viewerUrl', () => {
    const baseUrl = require('../../src/configuration/config').ticsConfig.baseUrl;

    expect(baseUrl).toBe('http://localhost/tiobeweb/TICS');
  });

  it('should return viewer url as base url from viewerUrl if displayUrl is not set.', () => {
    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/tiobeweb/TICS');
  });

  it('should return viewer url if displayUrl is set without trailing slash', () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost';

    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/');
  });

  it('should return viewer url if displayUrl is set with trailing slash', () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost/';

    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/');
  });
});
