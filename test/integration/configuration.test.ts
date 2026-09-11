import { beforeEach, describe, expect, it, vi } from 'vitest';

process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECT = 'tics-github-action';
process.env.INPUT_VIEWERURL = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_SHOWNONBLOCKING = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.INPUT_SHOWBLOCKINGAFTER = 'true';
process.env.INPUT_TRUSTSTRATEGY = 'strict';
process.env.INPUT_CREATEPROJECT = 'false';

beforeEach(() => {
  vi.resetModules();

  vi.spyOn(process.stdout, 'write').mockImplementation((): any => {});
});

describe('pullRequestNumber', () => {
  it('should return pullRequestNumber from GitHub context', async () => {
    vi.doMock('@actions/github', (): any => {
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
        getOctokit: vi.fn()
      };
    });

    const { githubConfig } = await import('../../src/configuration/config');
    expect(githubConfig.pullRequestNumber).toBe(1);
  });

  it('should return pullRequestNumber from environment variable if no GitHub context', async () => {
    vi.doMock('@actions/github', (): any => {
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
        getOctokit: vi.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '2';

    const { githubConfig } = await import('../../src/configuration/config');
    expect(githubConfig.pullRequestNumber).toBe(2);
  });

  it('should set undefined as pullRequestNumber when no value was found', async () => {
    vi.doMock('@actions/github', (): any => {
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
        getOctokit: vi.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '';

    const { githubConfig } = await import('../../src/configuration/config');
    expect(githubConfig.pullRequestNumber).toBeUndefined();
  });
});

describe('urls', () => {
  it('should return base url from viewerUrl', async () => {
    const baseUrl = (await import('../../src/configuration/config')).ticsConfig.baseUrl;

    expect(baseUrl).toBe('http://localhost/tiobeweb/TICS');
  });

  it('should return viewer url as base url from viewerUrl if displayUrl is not set.', async () => {
    const displayUrl = (await import('../../src/configuration/config')).ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/tiobeweb/TICS');
  });

  it('should return viewer url if displayUrl is set without trailing slash', async () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost';

    const displayUrl = (await import('../../src/configuration/config')).ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/');
  });

  it('should return viewer url if displayUrl is set with trailing slash', async () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost/';

    const displayUrl = (await import('../../src/configuration/config')).ticsConfig.displayUrl;

    expect(displayUrl).toBe('http://localhost/');
  });
});
