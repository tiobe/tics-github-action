import { getChangedFilesOfCommit } from '../../../src/github/commits';
import { changedFile } from './objects/pulls';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock } from '../../.setup/mock';

describe('getChangedFilesOfCommit', () => {
  test('Should return single file on getChangedFilesOfCommit', async () => {
    const changedFiles = [changedFile];

    (octokit.paginate as any).mockResolvedValueOnce(changedFiles);

    const response = await getChangedFilesOfCommit();
    expect(response).toEqual(changedFiles);
  });

  test('Should return empty array on undefined files', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfCommit();

    (octokit.paginate as any).mock.calls[0][2]({
      data: { files: undefined }
    });

    await getChangedFilesOfCommit();
    expect(spy).toHaveBeenCalledTimes(0);
  });

  test('Should include changed moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfCommit();

    (octokit.paginate as any).mock.calls[0][2]({
      data: { files: [{ filename: 'test.js', status: 'renamed', changes: 1 }, { filename: 'test.js' }] }
    });

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  test('Should exclude unchanged moved file', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfCommit();

    (octokit.paginate as any).mock.calls[0][2]({
      data: { files: [{ filename: 'test.js', status: 'renamed', changes: 0 }, { filename: 'test.js' }] }
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  test('Should include changed moved file on excludeMovedFiles', async () => {
    actionConfigMock.excludeMovedFiles = true;

    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfCommit();

    (octokit.paginate as any).mock.calls[0][2]({
      data: { files: [{ filename: 'test.js', status: 'renamed', changes: 1 }, { filename: 'test.js' }] }
    });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  test('Should call debug on callback of paginate', async () => {
    const spy = jest.spyOn(logger, 'debug');
    await getChangedFilesOfCommit();

    (octokit.paginate as any).mock.calls[0][2]({ data: { files: [{ filename: 'test.js' }, { filename: 'test.js' }] } });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('test.js');
  });

  test('Should be called with specific parameters on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockResolvedValue([]);
    const spy = jest.spyOn(octokit, 'paginate');

    await getChangedFilesOfCommit();
    expect(spy).toHaveBeenCalledWith(octokit.rest.repos.getCommit, { repo: 'test', owner: 'tester', ref: 'sha-128' }, expect.any(Function));
  });

  test('Should return three files on getChangedFilesOfCommit', async () => {
    (octokit.paginate as any).mockResolvedValue([{}, {}, {}]);

    const response = await getChangedFilesOfCommit();
    expect((response as any[]).length).toEqual(3);
  });

  test('Should call error on thrown error on paginate', async () => {
    (octokit.paginate as any).mockImplementationOnce(() => {
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
