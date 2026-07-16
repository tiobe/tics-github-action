import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChangedFilesOfCommit } from '../../../src/github/commits';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock } from '../../.setup/mock';

afterEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
});

describe('getChangedFilesOfCommit', () => {
  it('should return single file', async () => {
    const changedFiles = [{ filename: 'test.js', changes: 1, status: 'added' }];

    vi.spyOn(octokit, 'paginate').mockResolvedValueOnce(changedFiles);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['test.js']);
  });

  it('should include changed moved file', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', status: 'renamed', changes: 1 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should exclude unchanged moved file', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', status: 'renamed', changes: 0 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['jest.js']);
  });

  it('should exclude changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;

    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'rest.js', status: 'renamed', changes: 1 },
      { filename: 'test.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['test.js']);

    actionConfigMock.excludeMovedFiles = false;
  });

  it('should call debug on callback of paginate', async () => {
    actionConfigMock.excludeMovedFiles = false;

    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', changes: 1 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should be called with specific parameters', async () => {
    const spy = vi.spyOn(octokit, 'paginate');
    spy.mockResolvedValue([{ filename: 'test.js', changes: 1 }]);

    const response = await getChangedFilesOfCommit();

    expect(spy).toHaveBeenCalledWith(octokit.rest.repos.getCommit, { repo: 'test', owner: 'tester', ref: 'sha-128' }, expect.any(Function));
    expect(response).toEqual(['test.js']);
  });

  it('should return two files if one has no changes', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', changes: 1 },
      { filename: 'jest.js', changes: 1 },
      { filename: 'rest.js', changes: 0 }
    ]);

    const response = await getChangedFilesOfCommit();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should call error on thrown error on paginate', async () => {
    vi.spyOn(octokit, 'paginate').mockImplementationOnce(() => {
      throw new Error();
    });

    let error: any;
    try {
      await getChangedFilesOfCommit();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
