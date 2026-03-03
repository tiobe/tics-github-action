import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as artifact from '@actions/artifact';
import * as fs from 'fs';
import { getTmpDir, uploadArtifact } from '../../../src/github/artifacts';
import { MockArtifactClient, MockDirent } from './objects/artifacts';
import { logger } from '../../../src/helper/logger';
import { githubConfigMock, ticsCliMock } from '../../.setup/mock';

describe('tempdir test', () => {
  it('should return empty if variable not set and mode is not debug', () => {
    const tmpdir = getTmpDir();

    expect(tmpdir).toBe('');
  });

  it('should return empty if variable not set and mode is debug', () => {
    githubConfigMock.debugger = true;
    const tmpdir = getTmpDir();

    expect(tmpdir).toBe('/tmp/tics/123_TICS_1_tics-github-action');
  });

  it('should return empty if variable is set', () => {
    ticsCliMock.tmpdir = 'something/else';
    const tmpdir = getTmpDir();

    expect(tmpdir).toBe('something/else/123_TICS_1_tics-github-action');
  });
});

describe('artifacts test', () => {
  const mockArtifactClient = new MockArtifactClient();
  let uploadSpy: Mock;

  beforeEach(() => {
    vi.spyOn(artifact, 'DefaultArtifactClient').mockImplementation(function () {
      return mockArtifactClient;
    });
    uploadSpy = vi.spyOn(mockArtifactClient, 'uploadArtifact');
  });

  it('should upload logfile to tmpdir', async () => {
    ticsCliMock.tmpdir = '/tmp';

    vi.spyOn(fs, 'readdirSync').mockReturnValueOnce([new MockDirent(true, 'file.log', '/tmp/123_TICS_1_tics-github-action/ticstmpdir/file.log')]);

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith(
      'TICS_tics-github-action_client_ticstmpdir',
      ['/tmp/123_TICS_1_tics-github-action/ticstmpdir/file.log'],
      '/tmp/123_TICS_1_tics-github-action/ticstmpdir'
    );
  });

  it('should upload logdir to tmpdir', async () => {
    ticsCliMock.tmpdir = '/tmp';

    const direntOne = [new MockDirent(false, 'tics', '/tmp/123_TICS_1_tics-github-action/ticstmpdir/tics')];
    const direntTwo = [new MockDirent(true, 'file.log', '/tmp/123_TICS_1_tics-github-action/ticstmpdir/tics/file.log')];

    vi.spyOn(fs, 'readdirSync').mockReturnValueOnce(direntOne);
    vi.spyOn(fs, 'readdirSync').mockReturnValueOnce(direntTwo);

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith(
      'TICS_tics-github-action_client_ticstmpdir',
      ['/tmp/123_TICS_1_tics-github-action/ticstmpdir/tics/file.log'],
      '/tmp/123_TICS_1_tics-github-action/ticstmpdir'
    );
  });

  it('should call debug logger on upload throwing an error', async () => {
    ticsCliMock.tmpdir = '/tmp';

    vi.spyOn(fs, 'readdirSync').mockReturnValueOnce([new MockDirent(true, 'file.log', '/tmp/123_TICS_tics-github-action/ticstmpdir/file.log')]);
    uploadSpy.mockRejectedValue(Error('connection issues'));
    const loggerSpy = vi.spyOn(logger, 'debug');

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith(
      'TICS_tics-github-action_client_ticstmpdir',
      ['/tmp/123_TICS_1_tics-github-action/ticstmpdir/file.log'],
      '/tmp/123_TICS_1_tics-github-action/ticstmpdir'
    );
    expect(loggerSpy).toHaveBeenCalledWith(`Failed to upload artifact: connection issues`);
  });
});
