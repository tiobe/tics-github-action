import * as core from '@actions/core';
import { ActionConfiguration } from '../../../src/configuration/action';

describe('Action Configuration', () => {
  let values: Record<string, string>;

  let expectDefault = {
    excludeMovedFiles: false,
    postAnnotations: false,
    postToConversation: false,
    pullRequestApproval: false,
    retryConfig: { delay: 5, maxRetries: 10, codes: [419, 500, 501, 502, 503, 504] },
    secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'],
    showBlockingAfter: false
  };

  beforeEach(() => {
    jest.spyOn(process.stdout, 'write').mockImplementation();

    jest.spyOn(core, 'getInput').mockImplementation((name, _options): string => {
      for (const value in values) {
        if (value === name) {
          return values[value];
        }
      }

      return '';
    });
    jest.spyOn(core, 'getBooleanInput').mockImplementation((name, _options): boolean => {
      for (const value in values) {
        if (value === name) {
          return values[value] === 'true';
        }
      }

      return false;
    });
  });

  afterEach(() => {
    values = {};
    jest.resetAllMocks();
  });

  test('Should return if nothing other then defaults are given', () => {
    const config = new ActionConfiguration();

    expect(config).toMatchObject(expectDefault);
  });

  test('Should return if every variable is set', () => {
    values = {
      excludeMovedFiles: 'true',
      postAnnotations: 'true',
      postToConversation: 'true',
      pullRequestApproval: 'true',
      retryCodes: '401',
      secretsFilter: 'additional, secrets',
      showBlockingAfter: 'true'
    };

    const config = new ActionConfiguration();

    expect(config).toMatchObject({
      excludeMovedFiles: true,
      postAnnotations: true,
      postToConversation: true,
      pullRequestApproval: true,
      retryConfig: { delay: 5, maxRetries: 10, codes: [401] },
      secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'additional', 'secrets'],
      showBlockingAfter: true
    });
  });

  describe('SecretsFilter', () => {
    test('Should add filters containing spaces', async () => {
      values = {
        secretsFilter: 'additional secrets, feature'
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'additional secrets', 'feature']
      });
    });

    test('Should not add filters that contain only spaces or nothing at all', async () => {
      values = {
        secretsFilter: ',TOKEN, ,AUTH, '
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'TOKEN', 'AUTH']
      });
    });

    test('Should add filters that are not delimited by a comma', async () => {
      values = {
        secretsFilter: 'TOKEN;AUTH:FILTER'
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'TOKEN;AUTH:FILTER']
      });
    });
  });

  describe('Retry Config', () => {
    test('Should set default retryConfig if none are given', async () => {
      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        retryConfig: {
          delay: 5,
          maxRetries: 10,
          codes: [419, 500, 501, 502, 503, 504]
        }
      });
    });

    test('Should set custom retryCodes when given correctly', async () => {
      values = {
        retryCodes: '500, 502'
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        retryConfig: {
          delay: 5,
          maxRetries: 10,
          codes: [500, 502]
        }
      });
    });

    test('Should throw Error for retryCode when input is Should throw error on incorrect', async () => {
      values = {
        retryCodes: '404,500;502'
      };

      let error: any;
      try {
        new ActionConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("'500;502'");
    });
  });
});
