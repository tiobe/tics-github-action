import { afterEach, describe, expect, it, test, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'canonical-path';
import { changedFilesToFile, getChangedFilesOfPullRequestQL, getChangedFilesOfPullRequestRest } from '../../../src/github/pulls';
import { fourFilesChangedResponse, renamedChangedFileResponse, renamedUnchangedFileResponse, singleFileResponse } from './objects/pulls';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock, githubConfigMock } from '../../.setup/mock';
import { GithubEvent } from '../../../src/configuration/github-event';

afterEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
});

describe('getChangedFilesOfPullRequestQL', () => {
  test('Should not run on non-pullrequest', async () => {
    githubConfigMock.event = GithubEvent.PUSH;

    let err: any;
    try {
      await getChangedFilesOfPullRequestQL();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toEqual('This function can only be run on a pull request.');
    githubConfigMock.event = GithubEvent.PULL_REQUEST; // reset event
  });

  test('Should throw error if return value is undefined', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce({ repository: undefined });

    let err: any;
    try {
      await getChangedFilesOfPullRequestQL();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toEqual('Missing data in GraphQL (changed files) response.');
  });

  test('Should return single file on getChangedFilesOfPullRequest', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(singleFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual(['test.js']);
  });

  test('Should include changed moved file', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedChangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual(['test.js', 'jest.js']);
  });

  test('Should exclude unchanged moved file', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedUnchangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual(['test.js']);
  });

  test('Should exclude changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedChangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual(['test.js']);

    actionConfigMock.excludeMovedFiles = false;
  });

  test('Should return four files on getChangedFilesOfPullRequest', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(fourFilesChangedResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response.length).toEqual(4);
  });

  test('Should call exit on thrown error on paginate', async () => {
    (octokit.graphql.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });

    let error: any;
    try {
      await getChangedFilesOfPullRequestQL();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getChangedFilesOfPullRequestRest', () => {
  it('should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    let error: any;
    try {
      await getChangedFilesOfPullRequestRest();

      expect(false).toBeTruthy(); // should not be reached
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('This function can only be run on a pull request.');
  });

  it('should return single file', async () => {
    githubConfigMock.pullRequestNumber = 1;
    const changedFiles = [{ filename: 'test.js', changes: 1, status: 'added' }];

    vi.spyOn(octokit, 'paginate').mockResolvedValueOnce(changedFiles);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['test.js']);
  });

  it('should include changed moved file', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', status: 'renamed', changes: 1 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should exclude unchanged moved file', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', status: 'renamed', changes: 0 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['jest.js']);
  });

  it('should exclude changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;

    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'rest.js', status: 'renamed', changes: 1 },
      { filename: 'test.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['test.js']);

    actionConfigMock.excludeMovedFiles = false;
  });

  it('should call debug on callback of paginate', async () => {
    actionConfigMock.excludeMovedFiles = false;

    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', changes: 1 },
      { filename: 'jest.js', changes: 1 }
    ]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should be called with specific parameters', async () => {
    const spy = vi.spyOn(octokit, 'paginate');
    spy.mockResolvedValue([{ filename: 'test.js', changes: 1 }]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listFiles, { repo: 'test', owner: 'tester', pull_number: 1 });
    expect(response).toEqual(['test.js']);
  });

  it('should return two files if one has no changes', async () => {
    vi.spyOn(octokit, 'paginate').mockResolvedValue([
      { filename: 'test.js', changes: 1 },
      { filename: 'jest.js', changes: 1 },
      { filename: 'rest.js', changes: 0 }
    ]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(['test.js', 'jest.js']);
  });

  it('should call error on thrown error on paginate', async () => {
    vi.spyOn(octokit, 'paginate').mockImplementationOnce(() => {
      throw new Error();
    });

    let error: any;
    try {
      await getChangedFilesOfPullRequestRest();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('changedFilesToFile', () => {
  it('should return file location on changedFilesToFile', () => {
    vi.spyOn(path, 'resolve').mockReturnValueOnce('/path/to/changedFiles.txt');

    const response = changedFilesToFile(['test.js']);

    expect(response).toBe('/path/to/changedFiles.txt');
  });

  it('should have writeFileSync to have been called once on changedFilesToFile', () => {
    const spy = vi.spyOn(fs, 'writeFileSync');

    changedFilesToFile([]);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call writeFileSync once with content', () => {
    vi.spyOn(path, 'resolve').mockReturnValueOnce('/path/to/changedFiles.txt');
    const spy = vi.spyOn(fs, 'writeFileSync');

    changedFilesToFile(['test.js', 'test.js']);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/path/to/changedFiles.txt', 'test.js\ntest.js\n');
  });
});
