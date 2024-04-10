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

// describe('retryCodes', () => {
//   test('Should set default retryCodes if none are given', async () => {
//     process.env.INPUT_RETRYCODES = '';

//     const retryCodes = require('../../src/configuration').ticsConfig.retryCodes;

//     expect(retryCodes).toEqual([419, 500, 501, 502, 503, 504]);
//   });

//   test('Should set custom retryCodes when given correctly', async () => {
//     process.env.INPUT_RETRYCODES = '500,502';

//     const retryCodes = require('../../src/configuration').ticsConfig.retryCodes;

//     expect(retryCodes).toEqual([500, 502]);
//   });

//   test('Should return NaN for retryCode when input is incorrect', async () => {
//     process.env.INPUT_RETRYCODES = '404,500;502';

//     let catchError;
//     try {
//       require('../../src/configuration').ticsConfig.retryCodes;
//     } catch (error) {
//       catchError = error;
//     }

//     expect(catchError).toBeInstanceOf(Error);
//     expect(catchError.message).toContain("'500;502'");
//   });
// });

describe('secretsFilter', () => {
  test('Should set default secretsFilter if none are given', async () => {
    process.env.INPUT_SECRETSFILTER = '';

    const secretsFilter = require('../../src/configuration').ticsConfig.secretsFilter;

    expect(secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization']);
  });

  test('Should add custom secretsFilter when given correctly', async () => {
    process.env.INPUT_SECRETSFILTER = ',TOKEN,AUTH;STEM';

    const secretsFilter = require('../../src/configuration').ticsConfig.secretsFilter;

    expect(secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'TOKEN', 'AUTH;STEM']);
  });
});
