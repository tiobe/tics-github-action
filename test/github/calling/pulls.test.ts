import * as fs from 'fs';
import { expect, test, jest } from '@jest/globals';
import { resolve } from 'canonical-path';
import { changedFilesToFile, getChangedFiles } from '../../../src/github/calling/pulls';
import { octokit } from '../../../src/github/configuration';

test('Should return single file on getChangedFiles', async () => {
  (octokit.paginate as any).mockReturnValueOnce([{ filename: 'test.js' }]);

  const response = await getChangedFiles();
  expect(response).toEqual([{ filename: 'test.js' }]);
});

test('Should be called with specific parameters on getChangedFiles', async () => {
  (octokit.paginate as any).mockReturnValueOnce();
  const spy = jest.spyOn(octokit, 'paginate');

  await getChangedFiles();
  expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listFiles, { repo: 'test', owner: 'tester', pull_number: '1' }, expect.any(Function));
});

test('Should return three files on getChangedFiles', async () => {
  (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

  const response = await getChangedFiles();
  expect((response as any[]).length).toEqual(3);
});

test('Should throw an error on getChangedFiles', async () => {
  (octokit.paginate as any).mockReturnValueOnce(() => {
    throw new Error();
  });
  const response = await getChangedFiles();
  expect(response).toThrowError();
});

test('Should return file location on changedFilesToFile', () => {
  (resolve as any).mockReturnValueOnce('/path/to/changedFiles.txt');

  const response = changedFilesToFile([{ filename: 'test.js' }]);
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

  changedFilesToFile([{ filename: 'test.js' }, { filename: 'test.js' }]);
  expect(spy).toHaveBeenCalledWith('/path/to/changedFiles.txt', 'test.js\ntest.js\n');
});
