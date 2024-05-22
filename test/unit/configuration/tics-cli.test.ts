import * as core from '@actions/core';

import { Mode } from '../../../src/configuration/tics';
import { TicsCli } from '../../../src/configuration/tics-cli';
import { logger } from '../../../src/helper/logger';

describe('Cli Configuration', () => {
  let warningSpy: jest.SpyInstance;

  let values: Record<string, string>;
  let expectCli = {
    project: '',
    branchname: '',
    branchdir: '',
    cdtoken: '',
    codetype: '',
    calc: '',
    nocalc: '',
    norecalc: '',
    recalc: '',
    tmpdir: '',
    additionalFlags: ''
  };

  beforeEach(() => {
    warningSpy = jest.spyOn(logger, 'warning');

    jest.spyOn(core, 'getInput').mockImplementation((name, _options): string => {
      for (const value in values) {
        if (value === name) {
          return values[value];
        }
      }

      return '';
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should pass when mode is client diagnostic and project is auto', () => {
    values = {
      project: 'auto'
    };

    const cliClient = new TicsCli(Mode.CLIENT);
    const cliDiagnostic = new TicsCli(Mode.DIAGNOSTIC);

    expect(cliClient).toMatchObject({ ...expectCli, project: 'auto', calc: 'GATE' });
    expect(cliDiagnostic).toMatchObject({ ...expectCli, project: 'auto' });
  });

  test('Should pass when mode is client or diagnostic and project is given', () => {
    values = {
      project: 'project'
    };

    const cliClient = new TicsCli(Mode.CLIENT);
    const cliDiagnostic = new TicsCli(Mode.DIAGNOSTIC);

    expect(cliClient).toMatchObject({ ...expectCli, project: 'project', calc: 'GATE' });
    expect(cliDiagnostic).toMatchObject({ ...expectCli, project: 'project' });
  });

  test('Should pass when mode is qserver and project is given', () => {
    values = {
      project: 'project'
    };

    const cliServer = new TicsCli(Mode.QSERVER);

    expect(cliServer).toMatchObject({ ...expectCli, project: 'project' });
  });

  test('Should throw error if mode is qserver and project is auto', () => {
    values = {
      project: 'auto'
    };

    let error: any;
    try {
      new TicsCli(Mode.QSERVER);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toContain("Running TICS with project 'auto' is not possible with QServer");
  });

  test('Should return add BEGIN and END to calc when mode is qserver and a custom calc is given', () => {
    values = {
      project: 'project',
      calc: 'CS'
    };

    const cliServer = new TicsCli(Mode.QSERVER);

    expect(cliServer).toMatchObject({ ...expectCli, project: 'project', calc: 'BEGIN,CS,END' });
  });

  test('Should return add BEGIN and END to recalc when mode is qserver and a custom recalc is given', () => {
    values = {
      project: 'project',
      recalc: 'CS'
    };

    const cliServer = new TicsCli(Mode.QSERVER);

    expect(cliServer).toMatchObject({ ...expectCli, project: 'project', recalc: 'BEGIN,CS,END' });
  });

  test('Should return add BEGIN and END to recalc when mode is qserver and custom calc and recalc are given', () => {
    values = {
      project: 'project',
      calc: 'CW',
      recalc: 'CS'
    };

    const cliServer = new TicsCli(Mode.QSERVER);

    expect(cliServer).toMatchObject({ ...expectCli, project: 'project', calc: 'CW', recalc: 'BEGIN,CS,END' });
  });

  test('Should throw warnings on Client-only cli options if used in mode QServer', () => {
    values = {
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'AI',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    };

    const cliServer = new TicsCli(Mode.QSERVER);

    expect(cliServer).toMatchObject({
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'BEGIN,AI,END',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    });

    expect(warningSpy).toHaveBeenCalledTimes(2);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('cdtoken'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('codetype'));
  });

  test('Should throw warnings on QServer-only cli options if used in mode Client', () => {
    values = {
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'AI',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    };

    const cliClient = new TicsCli(Mode.CLIENT);

    expect(cliClient).toMatchObject({
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'AI',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    });

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchdir'));
  });

  test('Should throw warnings on Client- and QServer-only cli options if used in mode Diagnostic', () => {
    values = {
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'AI',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    };

    const cliDiagnostic = new TicsCli(Mode.DIAGNOSTIC);

    expect(cliDiagnostic).toMatchObject({
      project: 'project',
      branchname: 'branch',
      branchdir: 'dir',
      cdtoken: 'cdtoken',
      codetype: 'TEST',
      calc: 'CS',
      nocalc: 'CW',
      norecalc: 'CY',
      recalc: 'AI',
      tmpdir: '/tmp',
      additionalFlags: '-log 9'
    });

    expect(warningSpy).toHaveBeenCalledTimes(9);
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('project'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchdir'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchname'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('cdtoken'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('codetype'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('calc'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('nocalc'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('norecalc'));
    expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('recalc'));
  });
});
