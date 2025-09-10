import { describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import { resolve } from 'canonical-path';
import { changedFilesToFile, getChangedFilesOfPullRequestQL, getChangedFilesOfPullRequestRest } from '../../../src/github/pulls';
import { logger } from '../../../src/helper/logger';
import { changedFile, fourFilesChangedResponse, renamedChangedFileResponse, renamedUnchangedFileResponse, singleFileResponse } from './objects/pulls';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock, githubConfigMock } from '../../.setup/mock';
import { GithubEvent } from '../../../src/configuration/github-event';

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
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      }
    ]);
  });

  test('Should include changed moved file', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedChangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      },
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'jest.js',
        status: 'renamed'
      }
    ]);
  });

  test('Should exclude unchanged moved file', async () => {
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedUnchangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      }
    ]);
  });

  test('Should exclude changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;
    (octokit.graphql.paginate as any).mockReturnValueOnce(renamedChangedFileResponse);

    const response = await getChangedFilesOfPullRequestQL();
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      }
    ]);

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

  it('should return single file on getChangedFilesOfCommit', async () => {
    githubConfigMock.pullRequestNumber = 1;
    const changedFiles = [changedFile];

    (octokit.paginate as any).mockResolvedValueOnce(changedFiles);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response).toEqual(changedFiles);
  });

  it('should include changed moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequestRest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [
        { filename: 'test.js', status: 'renamed', changes: 1 },
        { filename: 'test.js', changes: 1 }
      ]
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should exclude unchanged moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequestRest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [
        { filename: 'test.js', status: 'renamed', changes: 0 },
        { filename: 'test.js', changes: 1 }
      ]
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should exclude changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;

    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequestRest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [
        { filename: 'test.js', status: 'renamed', changes: 1 },
        { filename: 'test.js', changes: 1 }
      ]
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test.js');

    actionConfigMock.excludeMovedFiles = false;
  });

  it('should call debug on callback of paginate', async () => {
    actionConfigMock.excludeMovedFiles = false;
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequestRest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [
        { filename: 'test.js', changes: 1 },
        { filename: 'test.js', changes: 1 }
      ]
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should be called with specific parameters on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getChangedFilesOfPullRequestRest();

    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listFiles, { repo: 'test', owner: 'tester', pull_number: 1 }, expect.any(Function));
  });

  it('should return three files on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getChangedFilesOfPullRequestRest();

    expect(response as any[]).toHaveLength(3);
  });

  it('should call error on thrown error on paginate', async () => {
    (octokit.paginate as any).mockImplementationOnce(() => {
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
    (resolve as any).mockReturnValueOnce('/path/to/changedFiles.txt');

    const response = changedFilesToFile([changedFile]);

    expect(response).toBe('/path/to/changedFiles.txt');
  });

  it('should have writeFileSync to have been called once on changedFilesToFile', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');

    changedFilesToFile([]);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call writeFileSync once with content', () => {
    (resolve as any).mockReturnValueOnce('/path/to/changedFiles.txt');
    const spy = jest.spyOn(fs, 'writeFileSync');

    changedFilesToFile([changedFile, changedFile]);

    expect(spy).toHaveBeenCalledWith('/path/to/changedFiles.txt', 'test.js\ntest.js\n');
  });
});
