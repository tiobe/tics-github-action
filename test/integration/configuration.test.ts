process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECTNAME = 'tics-github-action';
process.env.INPUT_TICSCONFIGURATION = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.INPUT_SHOWBLOCKINGAFTER = 'true';
process.env.INPUT_TRUSTSTRATEGY = 'strict';

beforeEach(() => {
  jest.resetModules();
});

describe('pullRequestNumber', () => {
  test('Should return pullRequestNumber from GitHub context', async () => {
    jest.mock('@actions/github', () => {
      return {
        context: {
          payload: {
            pull_request: { number: 1 }
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    const pullRequestNumber = require('../../src/configuration').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toEqual(1);
  });

  test('Should return pullRequestNumber from environment variable if no GitHub context', async () => {
    jest.mock('@actions/github', () => {
      return {
        context: {
          payload: {
            pull_request: undefined
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '2';

    const pullRequestNumber = require('../../src/configuration').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toEqual(2);
  });

  test('Should set 0 as pullRequestNumber when no value was found', async () => {
    jest.mock('@actions/github', () => {
      return {
        context: {
          payload: {
            pull_request: undefined
          },
          eventName: 'pull_request',
          runId: 1,
          runNumber: 1,
          repo: {
            owner: 'owner',
            repo: 'repo'
          }
        },
        getOctokit: jest.fn()
      };
    });

    process.env.PULL_REQUEST_NUMBER = '';

    const pullRequestNumber = require('../../src/configuration').githubConfig.pullRequestNumber;

    expect(pullRequestNumber).toEqual(0);
  });
});
