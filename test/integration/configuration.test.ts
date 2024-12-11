process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECTNAME = 'tics-github-action';
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

  jest.spyOn(process.stdout, 'write').mockImplementation();
});

describe('pullRequestNumber', () => {
  test('Should return pullRequestNumber from GitHub context', async () => {
    jest.mock('@actions/github', () => {
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

    expect(pullRequestNumber).toEqual(1);
  });

  test('Should return pullRequestNumber from environment variable if no GitHub context', async () => {
    jest.mock('@actions/github', () => {
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

    expect(pullRequestNumber).toEqual(2);
  });

  test('Should set undefined as pullRequestNumber when no value was found', async () => {
    jest.mock('@actions/github', () => {
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

    expect(pullRequestNumber).toEqual(undefined);
  });
});

describe('urls', () => {
  test('Should return base url from viewerUrl', () => {
    const baseUrl = require('../../src/configuration/config').ticsConfig.baseUrl;

    expect(baseUrl).toEqual('http://localhost/tiobeweb/TICS');
  });

  test('Should return viewer url as base url from viewerUrl if displayUrl is not set.', () => {
    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toEqual('http://localhost/tiobeweb/TICS');
  });

  test('Should return viewer url if displayUrl is set without trailing slash', () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost';

    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toEqual('http://localhost/');
  });

  test('Should return viewer url if displayUrl is set with trailing slash', () => {
    process.env.INPUT_DISPLAYURL = 'http://localhost/';

    const displayUrl = require('../../src/configuration/config').ticsConfig.displayUrl;

    expect(displayUrl).toEqual('http://localhost/');
  });
});
