import * as commits from '../../../../src/github/commits';
import * as pulls from '../../../../src/github/pulls';

import { getChangedFiles } from '../../../../src/analysis/helper/changed-files';
import { githubConfigMock, ticsConfigMock } from '../../../.setup/mock';
import { singleChangedFiles } from './objects/changed-files';
import { Mode } from '../../../../src/configuration/tics';
import { GithubEvent } from '../../../../src/configuration/github-event';

let spyPullFiles: jest.SpyInstance;
let spyCommitFiles: jest.SpyInstance;
let spyFilesToFile: jest.SpyInstance;

beforeEach(() => {
  ticsConfigMock.mode = Mode.CLIENT;

  spyCommitFiles = jest.spyOn(commits, 'getChangedFilesOfCommit');
  spyPullFiles = jest.spyOn(pulls, 'getChangedFilesOfPullRequest');
  spyFilesToFile = jest.spyOn(pulls, 'changedFilesToFile');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Pull Request', () => {
  beforeEach(() => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
  });

  test('Should return no changed files if there are no changes', async () => {
    spyPullFiles.mockResolvedValue([]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [],
      path: ''
    });
  });

  test('Should return no changed files and a filelist if there are no changes but a filelist is given', async () => {
    ticsConfigMock.filelist = './filelist';
    spyPullFiles.mockResolvedValue([]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [],
      path: './filelist'
    });
  });

  test('Should return changed files and a filelist if there are changes and a filelist is given', async () => {
    ticsConfigMock.filelist = './filelist';
    spyPullFiles.mockResolvedValue([singleChangedFiles]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [singleChangedFiles],
      path: './filelist'
    });
  });

  test('Should return changed files and a filelist if there are changes and a filelist is given', async () => {
    ticsConfigMock.filelist = '';
    spyPullFiles.mockResolvedValue([singleChangedFiles]);
    spyFilesToFile.mockReturnValue('/path/to/filelist');

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [singleChangedFiles],
      path: '/path/to/filelist'
    });
  });
});

describe('Commit', () => {
  beforeEach(() => {
    githubConfigMock.event = GithubEvent.PUSH;
  });

  test('Should return no changed files if there are no changes', async () => {
    spyCommitFiles.mockResolvedValue([]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [],
      path: ''
    });
  });

  test('Should return no changed files and a filelist if there are no changes but a filelist is given', async () => {
    ticsConfigMock.filelist = './filelist';
    spyCommitFiles.mockResolvedValue([]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [],
      path: './filelist'
    });
  });

  test('Should return changed files and a filelist if there are changes and a filelist is given', async () => {
    ticsConfigMock.filelist = './filelist';
    spyCommitFiles.mockResolvedValue([singleChangedFiles]);

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [singleChangedFiles],
      path: './filelist'
    });
  });

  test('Should return changed files and a filelist if there are changes and a filelist is given', async () => {
    ticsConfigMock.filelist = '';
    spyCommitFiles.mockResolvedValue([singleChangedFiles]);
    spyFilesToFile.mockReturnValue('/path/to/filelist');

    const files = await getChangedFiles();

    expect(files).toEqual({
      files: [singleChangedFiles],
      path: '/path/to/filelist'
    });
  });
});
