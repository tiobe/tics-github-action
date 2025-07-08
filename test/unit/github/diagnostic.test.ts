import { beforeEach, describe, expect, it } from '@jest/globals';
import { getRateLimit } from '../../../src/github/diagnostic';
import { octokit } from '../../../src/github/octokit';

describe('getRateLimit', () => {
  let rateLimitSpy: jest.SpyInstance;

  beforeEach(() => {
    rateLimitSpy = jest.spyOn(octokit.rest.rateLimit, 'get');
  });

  it('should throw error if request fails', async () => {
    rateLimitSpy.mockRejectedValue(new Error('Not reachable.'));

    let err: any;
    try {
      await getRateLimit();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('Could not retrieve rate limit: Not reachable.');
  });

  it('should return rate info if request is succesfull', async () => {
    rateLimitSpy.mockReturnValue({
      data: {
        resources: {
          core: {
            limit: 5000,
            used: 1,
            remaining: 4999,
            reset: 1691591363
          },
          search: {
            limit: 30,
            used: 12,
            remaining: 18,
            reset: 1691591091
          },
          graphql: {
            limit: 5000,
            used: 7,
            remaining: 4993,
            reset: 1691593228
          },
          integration_manifest: {
            limit: 5000,
            used: 1,
            remaining: 4999,
            reset: 1691594631
          },
          source_import: {
            limit: 100,
            used: 1,
            remaining: 99,
            reset: 1691591091
          },
          code_scanning_upload: {
            limit: 500,
            used: 1,
            remaining: 499,
            reset: 1691594631
          },
          actions_runner_registration: {
            limit: 10000,
            used: 0,
            remaining: 10000,
            reset: 1691594631
          },
          scim: {
            limit: 15000,
            used: 0,
            remaining: 15000,
            reset: 1691594631
          },
          dependency_snapshots: {
            limit: 100,
            used: 0,
            remaining: 100,
            reset: 1691591091
          },
          code_search: {
            limit: 10,
            used: 0,
            remaining: 10,
            reset: 1691591091
          },
          code_scanning_autofix: {
            limit: 10,
            used: 0,
            remaining: 10,
            reset: 1691591091
          }
        },
        rate: {
          limit: 5000,
          used: 1,
          remaining: 4999,
          reset: 1372700873
        }
      }
    });

    const response = await getRateLimit();

    expect(response).toMatchObject({
      rate: {
        limit: 5000,
        used: 1,
        remaining: 4999,
        reset: 1372700873
      }
    });
  });
});
