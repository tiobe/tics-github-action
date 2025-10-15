import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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
import { GithubEvent } from '../../src/configuration/github-event';

afterEach(() => {
  jest.clearAllMocks();
});

describe('meetsPrerequisites', () => {
  let existsSpy: jest.SpiedFunction<typeof fs.existsSync>;
  let viewerVersionSpy: jest.SpiedFunction<typeof version.viewerVersion.viewerSupports>;

  beforeEach(() => {
    viewerVersionSpy = jest.spyOn(version.viewerVersion, 'viewerSupports');
    existsSpy = jest.spyOn(fs, 'existsSync');
  });

  it('should throw error if viewer version is too low', async () => {
    viewerVersionSpy.mockResolvedValue(false);

    let error: any;
    try {
      await main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4.0.'));
  });

  it('should throw error on mode Client when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue(true);
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

  it('should throw no error on mode QServer when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue(true);
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

    expect(true).toBeTruthy();
  });

  it('should throw error if ".git" does not exist', async () => {
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
  let spyClient: jest.SpiedFunction<typeof client.clientAnalysis>;
  let spyDiagnostic: jest.SpiedFunction<typeof diagnostic.diagnosticAnalysis>;
  let spyQServer: jest.SpiedFunction<typeof qserver.qServerAnalysis>;

  let spyUpload: jest.SpiedFunction<typeof artifacts.uploadArtifact>;
  let spySetFailed: jest.SpiedFunction<typeof logger.setFailed>;
  let spyPostCli: jest.SpiedFunction<typeof summary.postCliSummary>;
  let spySummaryWrite: jest.SpiedFunction<typeof coreSummary.write>;

  beforeEach(() => {
    spyClient = jest.spyOn(client, 'clientAnalysis');
    spyDiagnostic = jest.spyOn(diagnostic, 'diagnosticAnalysis');
    spyQServer = jest.spyOn(qserver, 'qServerAnalysis');

    spyUpload = jest.spyOn(artifacts, 'uploadArtifact');
    spySetFailed = jest.spyOn(logger, 'setFailed');
    spyPostCli = jest.spyOn(summary, 'postCliSummary').mockImplementation(() => {});
    spySummaryWrite = jest.spyOn(coreSummary, 'write');

    // meets prerequisites
    jest.spyOn(version.viewerVersion, 'viewerSupports').mockResolvedValue(true);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
  });

  it('should not call setfailed if the verdict is passing', async () => {
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: true, message: '', errorList: [], warningList: [] });
    await main();

    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: true, message: '', errorList: [], warningList: [] });
    await main();

    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: true, message: '', errorList: [], warningList: [] });
    await main();

    expect(spyUpload).not.toHaveBeenCalled();
    expect(spySetFailed).not.toHaveBeenCalled();
    expect(spyPostCli).toHaveBeenCalledTimes(3);
    expect(spyPostCli).toHaveBeenCalledWith({ passed: true, message: '', errorList: [], warningList: [] });
    expect(spySummaryWrite).toHaveBeenCalledTimes(3);
  });

  it('should call setfailed if the verdict is failing', async () => {
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    await main();

    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    await main();

    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    await main();

    expect(spyUpload).not.toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledTimes(3);
    expect(spySetFailed).toHaveBeenCalledWith('message');
    expect(spyPostCli).toHaveBeenCalledTimes(3);
    expect(spyPostCli).toHaveBeenCalledWith({ passed: false, message: 'message', errorList: [], warningList: [] });
    expect(spySummaryWrite).toHaveBeenCalledTimes(3);
  });

  it('should call uploadArtifact there is a tmpdir set or in the debug state', async () => {
    githubConfigMock.debugger = true;
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    spyDiagnostic.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    main();

    ticsCliMock.tmpdir = '/path/to/tmp';
    ticsConfigMock.mode = Mode.CLIENT;
    spyClient.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    await main();

    githubConfigMock.debugger = false;
    ticsConfigMock.mode = Mode.QSERVER;
    spyQServer.mockResolvedValue({ passed: false, message: 'message', errorList: [], warningList: [] });
    await main();

    expect(spyUpload).toHaveBeenCalledTimes(3);
  });
});
