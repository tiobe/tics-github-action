import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { ActionConfiguration, ShowAnnotationSeverity } from '../../../src/configuration/action';

describe('action Configuration', () => {
  let values: Record<string, string>;

  const expectDefault = {
    excludeMovedFiles: false,
    postAnnotations: false,
    postToConversation: false,
    pullRequestApproval: false,
    retryConfig: { delay: 5, maxRetries: 10, codes: [419, 500, 501, 502, 503, 504] },
    secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'],
    showAnnotationSeverity: ShowAnnotationSeverity.BLOCKING // because getBooleanInput returns false by default
  };

  beforeEach(() => {
    jest.spyOn(process.stdout, 'write').mockImplementation((): any => {});

    jest.spyOn(core, 'getInput').mockImplementation((name): string => {
      for (const value in values) {
        if (value === name) {
          return values[value];
        }
      }

      return '';
    });
    jest.spyOn(core, 'getBooleanInput').mockImplementation((name): boolean => {
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

  it('should return if nothing other then defaults are given', () => {
    const config = new ActionConfiguration();

    expect(config).toMatchObject(expectDefault);
  });

  it('should return if every variable is set', () => {
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
      showAnnotationSeverity: ShowAnnotationSeverity.AFTER
    });
  });

  describe('secretsFilter', () => {
    it('should add filters containing spaces', async () => {
      values = {
        secretsFilter: 'additional secrets, feature'
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'additional secrets', 'feature']
      });
    });

    it('should not add filters that contain only spaces or nothing at all', async () => {
      values = {
        secretsFilter: ',TOKEN, ,AUTH, '
      };

      const config = new ActionConfiguration();

      expect(config).toMatchObject({
        ...expectDefault,
        secretsFilter: ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'TOKEN', 'AUTH']
      });
    });

    it('should add filters that are not delimited by a comma', async () => {
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

  describe('retry Config', () => {
    it('should set default retryConfig if none are given', async () => {
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

    it('should set custom retryCodes when given correctly', async () => {
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

    it('should throw Error for retryCode when input is Should throw error on incorrect', async () => {
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

  describe('showAnnotationSeverity', () => {
    it('should prefer showAnnotationSeverity over showBlockingAfter', () => {
      values = { showBlockingAfter: 'false', showAnnotationSeverity: 'issue' };
      const config1 = new ActionConfiguration();
      expect(config1).toMatchObject({ ...expectDefault, showAnnotationSeverity: ShowAnnotationSeverity.ISSUE });

      values = { showBlockingAfter: 'false', showAnnotationSeverity: 'blocking-after' };
      const config2 = new ActionConfiguration();
      expect(config2).toMatchObject({ ...expectDefault, showAnnotationSeverity: ShowAnnotationSeverity.AFTER });

      values = { showBlockingAfter: 'false', showAnnotationSeverity: 'blocking' };
      const config3 = new ActionConfiguration();
      expect(config3).toMatchObject({ ...expectDefault, showAnnotationSeverity: ShowAnnotationSeverity.BLOCKING });
    });

    it('should use showBlockingAfter if showAnnotationSeverity is not set', () => {
      values = { showBlockingAfter: 'false' };
      const config1 = new ActionConfiguration();
      expect(config1).toMatchObject({ ...expectDefault });

      values = { showBlockingAfter: 'true' };
      const config2 = new ActionConfiguration();
      expect(config2).toMatchObject({ ...expectDefault, showAnnotationSeverity: ShowAnnotationSeverity.AFTER });
    });

    it('should throw Error when showAnnotationSeverity is incorrect', () => {
      values = {
        showAnnotationSeverity: 'bladiebla'
      };

      let error: any;
      try {
        new ActionConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toEqual(
        "Parameter 'showAnnotationSeverity' should be one of 'blocking', 'blocking-after' or 'issue'. Input given is 'bladiebla'"
      );
    });
  });
});
