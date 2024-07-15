import * as fs from 'fs';

import { summary as coreSummary } from '@actions/core';

import * as artifacts from '../../src/github/artifacts';
import * as client from '../../src/analysis/client';
import * as diagnostic from '../../src/analysis/diagnostic';
import * as qserver from '../../src/analysis/qserver';
import * as summary from '../../src/action/cli/summary';
import * as version from '../../src/viewer/version';

import { main } from '../../src/main';
import { githubConfigMock, ticsCliMock, ticsConfigMock } from '../.setup/mock';
import { logger } from '../../src/helper/logger';
import { Mode } from '../../src/configuration/tics';
import { GithubEvent } from '../../src/configuration/event';

afterEach(() => {
  jest.clearAllMocks();
});

describe('meetsPrerequisites', () => {
  let existsSpy: jest.SpyInstance;
  let viewerVersionSpy: jest.SpyInstance;

  beforeEach(() => {
    viewerVersionSpy = jest.spyOn(version, 'getViewerVersion');
    existsSpy = jest.spyOn(fs, 'existsSync');
  });

  test('Should throw error if viewer version is not parsable', async () => {
    viewerVersionSpy.mockResolvedValue({ version: 'test' });

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version unknown.'));
  });

  test('Should throw error if viewer version is too low', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.0.0' });

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version 2022.0.0.'));
  });

  test('Should throw error if viewer version is too low with prefix character', async () => {
    viewerVersionSpy.mockResolvedValue({ version: 'r2022.0.0' });

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version 2022.0.0.'));
  });

  test('Should not throw version error if viewer version sufficient with prefix character', async () => {
    viewerVersionSpy.mockResolvedValue({ version: 'r2022.4.0' });

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(
      expect.stringContaining('If the the action is run outside a pull request it should be run with a filelist.')
    );
  });

  test('Should throw error on mode Client when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.4.0' });
    githubConfigMock.event = GithubEvent.WORKFLOW_RUN;
    ticsConfigMock.filelist = '';

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(
      expect.stringContaining('If the the action is run outside a pull request it should be run with a filelist.')
    );
  });

  test('Should throw no error on mode QServer when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.4.0' });
    existsSpy.mockReturnValue(true);
    jest.spyOn(qserver, 'qServerAnalysis').mockResolvedValue({
      passed: true,
      message: '',
      errorList: [],
      warningList: []
    });

    githubConfigMock.event = GithubEvent.PUSH;
    ticsConfigMock.mode = 'qserver';
    ticsConfigMock.filelist = '';

    await main();
  });

  test('Should throw error if ".git" does not exist', async () => {
    existsSpy.mockReturnValue(false);

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(
      expect.stringContaining('No checkout found to analyze. Please perform a checkout before running the TICS Action.')
    );
  });
});

describe('verdict', () => {
  let spyClient: jest.SpyInstance;
  let spyDiagnostic: jest.SpyInstance;
  let spyQServer: jest.SpyInstance;

  let spyUpload: jest.SpyInstance;
  let spySetFailed: jest.SpyInstance;
  let spyPostCli: jest.SpyInstance;
  let spySummaryWrite: jest.SpyInstance;

  beforeEach(() => {
    spyClient = jest.spyOn(client, 'clientAnalysis');
    spyDiagnostic = jest.spyOn(diagnostic, 'diagnosticAnalysis');
    spyQServer = jest.spyOn(qserver, 'qServerAnalysis');

    spyUpload = jest.spyOn(artifacts, 'uploadArtifact');
    spySetFailed = jest.spyOn(logger, 'setFailed');
    spyPostCli = jest.spyOn(summary, 'postCliSummary').mockImplementation();
    spySummaryWrite = jest.spyOn(coreSummary, 'write');

    // meets prerequisites
    jest.spyOn(version, 'getViewerVersion').mockResolvedValue({ version: '2022.4.0' });
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
  });

  test('Should not call setfailed if the verdict is passing', async () => {
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: true });
    await main();

    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: true });
    await main();

    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: true });
    await main();

    expect(spyUpload).not.toHaveBeenCalled();
    expect(spySetFailed).not.toHaveBeenCalled();
    expect(spyPostCli).toHaveBeenCalledTimes(3);
    expect(spyPostCli).toHaveBeenCalledWith({ passed: true });
    expect(spySummaryWrite).toHaveBeenCalledTimes(3);
  });

  test('Should call setfailed if the verdict is failing', async () => {
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    expect(spyUpload).not.toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledTimes(3);
    expect(spySetFailed).toHaveBeenCalledWith('message');
    expect(spyPostCli).toHaveBeenCalledTimes(3);
    expect(spyPostCli).toHaveBeenCalledWith({ passed: false, message: 'message' });
    expect(spySummaryWrite).toHaveBeenCalledTimes(3);
  });

  test('Should call uploadArtifact there is a tmpdir set or in the debug state', async () => {
    githubConfigMock.debugger = true;
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    ticsCliMock.tmpdir = '/path/to/tmp';
    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    githubConfigMock.debugger = false;
    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: false, message: 'message' });
    await main();

    expect(spyUpload).toHaveBeenCalledTimes(3);
  });
});
