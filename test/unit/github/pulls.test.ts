import * as fs from 'fs';
import { resolve } from 'canonical-path';
import { changedFilesToFile, getChangedFilesOfPullRequest } from '../../../src/github/pulls';
import { octokit, ticsConfig } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';
import { changedFile, fourFilesChangedResponse, renamedChangedFileResponse, renamedUnchangedFileResponse, singleFileResponse } from './objects/pulls';

describe('getChangedFilesOfPullRequest', () => {
  test('Should return single file on getChangedFilesOfPullRequest', async () => {
    (octokit.graphql as any).mockReturnValueOnce(singleFileResponse);
    const spy = jest.spyOn(logger, 'debug');

    const response = await getChangedFilesOfPullRequest();
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      }
    ]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should include changed moved file', async () => {
    (octokit.graphql as any).mockReturnValueOnce(renamedChangedFileResponse);
    const spy = jest.spyOn(logger, 'debug');

    const response = await getChangedFilesOfPullRequest();
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
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should exclude unchanged moved file', async () => {
    (octokit.graphql as any).mockReturnValueOnce(renamedUnchangedFileResponse);
    const spy = jest.spyOn(logger, 'debug');

    const response = await getChangedFilesOfPullRequest();
    expect(response).toEqual([
      {
        additions: 3,
        changes: 4,
        deletions: 1,
        filename: 'test.js',
        status: 'modified'
      }
    ]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should include changed moved file on excludeMovedFiles', async () => {
    ticsConfig.excludeMovedFiles = true;

    const spy = jest.spyOn(logger, 'debug');
    (octokit.graphql as any).mockReturnValueOnce(renamedChangedFileResponse);

    const response = await getChangedFilesOfPullRequest();
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
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should return four files on getChangedFilesOfPullRequest', async () => {
    ticsConfig.excludeMovedFiles = true;

    const spy = jest.spyOn(logger, 'debug');
    (octokit.graphql as any).mockReturnValueOnce(fourFilesChangedResponse);

    const response = await getChangedFilesOfPullRequest();
    expect(response.length).toEqual(4);
    expect(spy).toHaveBeenCalledTimes(4);
  });

  test('Should call error on thrown error on paginate', async () => {
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
  test('Should return file location on changedFilesToFile', () => {
    (resolve as any).mockReturnValueOnce('/path/to/changedFiles.txt');

    const response = changedFilesToFile([changedFile]);
    expect(response).toEqual('/path/to/changedFiles.txt');
  });

  test('Should have writeFileSync to have been called once on changedFilesToFile', () => {
    const spy = jest.spyOn(fs, 'writeFileSync');

    changedFilesToFile([]);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should return file location on changedFilesToFile', () => {
    (resolve as any).mockReturnValueOnce('/path/to/changedFiles.txt');
    const spy = jest.spyOn(fs, 'writeFileSync');

    changedFilesToFile([changedFile, changedFile]);
    expect(spy).toHaveBeenCalledWith('/path/to/changedFiles.txt', 'test.js\ntest.js\n');
  });
});
