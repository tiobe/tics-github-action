import * as artifact from '@actions/artifact';
import * as fs from 'fs';
import { githubConfig, ticsConfig } from '../../../src/configuration';
import { getTmpDir, uploadArtifact } from '../../../src/github/artifacts';
import { MockArtifactClient, MockDirent } from './objects/artifacts';
import { logger } from '../../../src/helper/logger';

describe('Tempdir test', () => {
  it('Should return empty if variable not set and mode is not debug', () => {
    const tmpdir = getTmpDir();

    expect(tmpdir).toStrictEqual('');
  });

  it('Should return empty if variable not set and mode is debug', () => {
    githubConfig.debugger = true;
    const tmpdir = getTmpDir();

    expect(tmpdir).toStrictEqual('/tmp/tics/123-1');
  });

  it('Should return empty if variable is set', () => {
    ticsConfig.tmpdir = 'something/else';
    const tmpdir = getTmpDir();

    expect(tmpdir).toStrictEqual('something/else/123-1');
  });
});

describe('Artifacts test', () => {
  it('Should upload logfile to tmpdir', async () => {
    ticsConfig.tmpdir = '/tmp';

    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce([new MockDirent(true, 'file.log', '/tmp/123-1/ticstmpdir/file.log')]);
    const mockArtifactClient = new MockArtifactClient([]);
    jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient);
    const uploadSpy = jest.spyOn(mockArtifactClient, 'uploadArtifact');

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith('ticstmpdir', ['/tmp/123-1/ticstmpdir/file.log'], '/tmp/123-1/ticstmpdir');
  });

  it('Should upload logdir to tmpdir', async () => {
    ticsConfig.tmpdir = '/tmp';

    const direntOne = [new MockDirent(false, 'tics', '/tmp/123-1/ticstmpdir/tics')];
    const direntTwo = [new MockDirent(true, 'file.log', '/tmp/123-1/ticstmpdir/tics/file.log')];

    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(direntOne);
    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce(direntTwo);
    const mockArtifactClient = new MockArtifactClient([]);
    jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient);
    const uploadSpy = jest.spyOn(mockArtifactClient, 'uploadArtifact');

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith('ticstmpdir', ['/tmp/123-1/ticstmpdir/tics/file.log'], '/tmp/123-1/ticstmpdir');
  });

  it('Should call debug logger on failing to upload logfile', async () => {
    ticsConfig.tmpdir = '/tmp';

    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce([new MockDirent(true, 'file.log', '/tmp/123-1/ticstmpdir/file.log')]);
    const mockArtifactClient = new MockArtifactClient(['/tmp/123-1/ticstmpdir/file.log']);
    jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient);
    const uploadSpy = jest.spyOn(mockArtifactClient, 'uploadArtifact');
    const loggerSpy = jest.spyOn(logger, 'debug');

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith('ticstmpdir', ['/tmp/123-1/ticstmpdir/file.log'], '/tmp/123-1/ticstmpdir');
    expect(loggerSpy).toHaveBeenCalledWith(`Failed to upload file(s): /tmp/123-1/ticstmpdir/file.log`);
  });

  it('Should call debug logger on upload throwing an error', async () => {
    ticsConfig.tmpdir = '/tmp';

    jest.spyOn(fs, 'readdirSync').mockReturnValueOnce([new MockDirent(true, 'file.log', '/tmp/123-1/ticstmpdir/file.log')]);
    const mockArtifactClient = new MockArtifactClient(['/tmp/123-1/ticstmpdir/file.log']);
    jest.spyOn(artifact, 'create').mockReturnValue(mockArtifactClient);
    const uploadSpy = jest.spyOn(mockArtifactClient, 'uploadArtifact').mockRejectedValue(Error('connection issues'));
    const loggerSpy = jest.spyOn(logger, 'debug');

    await uploadArtifact();

    expect(uploadSpy).toHaveBeenCalledWith('ticstmpdir', ['/tmp/123-1/ticstmpdir/file.log'], '/tmp/123-1/ticstmpdir');
    expect(loggerSpy).toHaveBeenCalledWith(`Failed to upload artifact: connection issues`);
  });
});
