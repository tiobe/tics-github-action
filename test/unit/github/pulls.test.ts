import { describe, expect, it, jest } from '@jest/globals';
import * as fs from 'fs';
import { resolve } from 'canonical-path';
import { changedFilesToFile, getChangedFilesOfPullRequest } from '../../../src/github/pulls';
import { logger } from '../../../src/helper/logger';
import { changedFile } from './objects/pulls';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock, githubConfigMock } from '../../.setup/mock';

describe('getChangedFilesOfPullRequest', () => {
  it('should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    let error: any;
    try {
      await getChangedFilesOfPullRequest();

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

    const response = await getChangedFilesOfPullRequest();

    expect(response).toEqual(changedFiles);
  });

  it('should include changed moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [{ filename: 'test.js', status: 'renamed', changes: 1 }, { filename: 'test.js' }]
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should exclude unchanged moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [{ filename: 'test.js', status: 'renamed', changes: 0 }, { filename: 'test.js' }]
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should include changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;

    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequest();

    (octokit.paginate as any).mock.calls[0][2]({
      data: [{ filename: 'test.js', status: 'renamed', changes: 1 }, { filename: 'test.js' }]
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should call debug on callback of paginate', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfPullRequest();

    (octokit.paginate as any).mock.calls[0][2]({ data: [{ filename: 'test.js' }, { filename: 'test.js' }] });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  it('should be called with specific parameters on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getChangedFilesOfPullRequest();

    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listFiles, { repo: 'test', owner: 'tester', pull_number: 1 }, expect.any(Function));
  });

  it('should return three files on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getChangedFilesOfPullRequest();

    expect(response as any[]).toHaveLength(3);
  });

  it('should call error on thrown error on paginate', async () => {
    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });

    let error: any;
    try {
      await getChangedFilesOfPullRequest();
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
