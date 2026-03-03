import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as exec from '@actions/exec';
import * as os from 'os';
import { getTicsCommand, runTicsAnalyzer } from '../../../src/tics/analyzer';
import { Mode, TrustStrategy } from '../../../src/configuration/tics';
import { httpClient } from '../../../src/viewer/http-client';
import { githubConfigMock, ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { InstallTics } from '@tiobe/install-tics';

// test for multiple different types of configurations
describe('test multiple types of configuration', () => {
  const originalTrustStrategy = process.env.TICSTRUSTSTRATEGY;
  let execSpy: Mock<typeof exec.exec>;
  let platformSpy: Mock<typeof os.platform>;

  beforeAll(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation((): boolean => true);

    ticsConfigMock.viewerUrl = 'http://base.com/tiobeweb/TICS/api/cfg?name=default';
  });

  beforeEach(() => {
    // set defaults
    ticsCliMock.calc = 'GATE';
    ticsCliMock.project = 'project';

    execSpy = vi.spyOn(exec, 'exec');
    execSpy.mockResolvedValue(0);

    platformSpy = vi.spyOn(os, 'platform');
    vi.spyOn(InstallTics.prototype, 'getInstallCommand').mockResolvedValue('<install command here>');
  });

  afterEach(() => {
    delete process.env.TICSTRUSTSTRATEGY;
    vi.restoreAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
  });

  afterAll(() => {
    process.env.TICSTRUSTSTRATEGY = originalTrustStrategy;
  });

  it('should call exec with diagnostic TICS command for Linux', async () => {
    platformSpy.mockReturnValue('linux');

    ticsConfigMock.mode = Mode.DIAGNOSTIC;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(`/bin/bash -c "TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default' TICS -ide github -help"`, [], {
      listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
      silent: true
    });
  });

  it('should call exec with minimal TICS command for Linux', async () => {
    platformSpy.mockReturnValue('linux');

    ticsConfigMock.mode = Mode.CLIENT;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      `/bin/bash -c "TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default' TICS -ide github '@/path/to' -viewer -project 'project' -calc GATE"`,
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with minimal TICS command for Windows', async () => {
    platformSpy.mockReturnValue('win32');

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      `powershell "$env:TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -calc GATE}"`,
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with run TICS command for Linux', async () => {
    platformSpy.mockReturnValue('linux');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "/bin/bash -c \"TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default' TICS -ide github '@/path/to' -viewer -project 'project' -cdtoken token -calc CS -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action' -log 9\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with run TICS command for Windows', async () => {
    platformSpy.mockReturnValue('win32');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "powershell \"$env:TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -cdtoken token -calc CS -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action' -log 9}\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with full TICS command for Linux, trustStrategy self-signed', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { links: { installTics: '/install-url' } }, retryCount: 0, status: 200 });
    platformSpy.mockReturnValue('linux');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';
    ticsConfigMock.installTics = true;

    process.env.TICSTRUSTSTRATEGY = 'self-signed';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "/bin/bash -c \"<install command here> && TICS -ide github '@/path/to' -viewer -project 'project' -cdtoken token -calc CS -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action' -log 9\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with full TICS command for Windows, no trustStrategy set', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { links: { installTics: '/install-url' } }, retryCount: 0, status: 200 });
    platformSpy.mockReturnValue('win32');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';
    ticsConfigMock.installTics = true;
    ticsConfigMock.trustStrategy = TrustStrategy.STRICT;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "powershell \"<install command here>; if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -cdtoken token -calc CS -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action' -log 9}\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with full TICS command for Windows, trustStrategy set to all', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { links: { installTics: '/install-url' } }, retryCount: 0, status: 200 });
    platformSpy.mockReturnValue('win32');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '';
    ticsConfigMock.installTics = true;
    ticsCliMock.nocalc = 'CW';
    ticsCliMock.recalc = 'CY';
    ticsCliMock.norecalc = 'CD';
    ticsCliMock.codetype = 'TESTCODE';
    ticsConfigMock.filelist = '/path/to/file.txt';
    githubConfigMock.debugger = true;

    process.env.TICSTRUSTSTRATEGY = 'all';

    const response = await runTicsAnalyzer('/path/to/file.txt');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "powershell \"<install command here>; if ($?) {TICS -ide github '@/path/to/file.txt' -viewer -project 'project' -cdtoken token -codetype TESTCODE -calc CS -nocalc CW -norecalc CD -recalc CY -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action'}\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });

  it('should call exec with full TICS command for Windows and filelist .', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { links: { installTics: '/install-url' } }, retryCount: 0, status: 200 });
    platformSpy.mockReturnValue('win32');

    ticsCliMock.calc = 'CS';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '';
    ticsConfigMock.installTics = true;
    ticsCliMock.nocalc = 'CW';
    ticsCliMock.recalc = 'CY';
    ticsCliMock.norecalc = 'CD';
    ticsCliMock.codetype = 'TESTCODE';
    ticsConfigMock.filelist = '.';
    ticsCliMock.branchname = 'main';
    githubConfigMock.debugger = true;

    process.env.TICSTRUSTSTRATEGY = 'all';

    const response = await runTicsAnalyzer('.');

    expect(response.statusCode).toBe(0);
    expect(response.completed).toBe(true);
    expect(execSpy).toHaveBeenCalledWith(
      "powershell \"<install command here>; if ($?) {TICS -ide github . -viewer -project 'project' -branchname main -cdtoken token -codetype TESTCODE -calc CS -nocalc CW -norecalc CD -recalc CY -tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action'}\"",
      [],
      {
        listeners: { errline: expect.any(Function), stdline: expect.any(Function) },
        silent: true
      }
    );
  });
});

describe('getTicsCommand', () => {
  it('should return full TICS Client command on mode client with all variables set (also non-client ones)', () => {
    ticsConfigMock.mode = Mode.CLIENT;
    ticsCliMock.project = 'project';
    ticsCliMock.calc = 'CS';
    ticsCliMock.nocalc = 'CW';
    ticsCliMock.recalc = 'CY';
    ticsCliMock.norecalc = 'CD';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.codetype = 'TESTCODE';
    ticsCliMock.branchname = 'main';
    ticsCliMock.branchdir = '.';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';

    const command = getTicsCommand('./filelist');

    expect(command).toContain('TICS ');
    expect(command).toContain(`'@./filelist'`);
    expect(command).toContain(`-viewer`);
    expect(command).toContain(`-project 'project'`);
    expect(command).toContain('-calc CS');
    expect(command).toContain('-nocalc CW');
    expect(command).toContain('-recalc CY');
    expect(command).toContain('-norecalc CD');
    expect(command).toContain('-cdtoken token');
    expect(command).toContain('-codetype TESTCODE');
    expect(command).toContain('-branchname main');
    expect(command).not.toContain('-branchdir .');
    expect(command).toContain(`-tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action'`);
    expect(command).toContain('-log 9');
  });

  it('should return full TICSQServer command on mode qserver with all variables set (also non-qserver ones)', () => {
    ticsConfigMock.mode = Mode.QSERVER;
    ticsCliMock.project = 'project';
    ticsCliMock.calc = 'CS';
    ticsCliMock.nocalc = 'CW';
    ticsCliMock.recalc = 'CY';
    ticsCliMock.norecalc = 'CD';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.codetype = 'TESTCODE';
    ticsCliMock.branchname = 'main';
    ticsCliMock.branchdir = '.';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';

    const command = getTicsCommand('./filelist');

    expect(command).toContain('TICSQServer ');
    expect(command).not.toContain(`'@./filelist'`);
    expect(command).not.toContain(`-viewer`);
    expect(command).toContain(`-project 'project'`);
    expect(command).toContain('-calc CS');
    expect(command).toContain('-nocalc CW');
    expect(command).toContain('-recalc CY');
    expect(command).toContain('-norecalc CD');
    expect(command).not.toContain('-cdtoken token');
    expect(command).not.toContain('-codetype TESTCODE');
    expect(command).toContain('-branchname main');
    expect(command).toContain('-branchdir .');
    expect(command).toContain(`-tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action'`);
    expect(command).toContain('-log 9');
  });

  it('should return a diagnostic command on mode diagnostic with all variables set (also non-diagnostic ones)', () => {
    ticsConfigMock.mode = Mode.DIAGNOSTIC;
    ticsCliMock.project = 'project';
    ticsCliMock.calc = 'CS';
    ticsCliMock.nocalc = 'CW';
    ticsCliMock.recalc = 'CY';
    ticsCliMock.norecalc = 'CD';
    ticsCliMock.cdtoken = 'token';
    ticsCliMock.codetype = 'TESTCODE';
    ticsCliMock.branchname = 'main';
    ticsCliMock.branchdir = '.';
    ticsCliMock.tmpdir = '/home/ubuntu/test';
    ticsCliMock.additionalFlags = '-log 9';

    const command = getTicsCommand('./filelist');

    expect(command).toContain('TICS ');
    expect(command).not.toContain(`'@./filelist'`);
    expect(command).not.toContain(`-viewer`);
    expect(command).not.toContain(`-project 'project'`);
    expect(command).not.toContain('-calc CS');
    expect(command).not.toContain('-nocalc CW');
    expect(command).not.toContain('-recalc CY');
    expect(command).not.toContain('-norecalc CD');
    expect(command).not.toContain('-cdtoken token');
    expect(command).not.toContain('-codetype TESTCODE');
    expect(command).not.toContain('-branchname main');
    expect(command).not.toContain('-branchdir .');
    expect(command).toContain(`-tmpdir '/home/ubuntu/test/123_TICS_1_tics-github-action'`);
    expect(command).toContain('-log 9');
  });
});

// test exec callback function (like findInStdOutOrErr)
describe('test callback functions', () => {
  beforeEach(() => {
    vi.spyOn(process.stdout, 'write').mockImplementation(vi.fn());
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('should return single error if already exists in errorlist', async () => {
    const analyzer = await import('../../../src/tics/analyzer');
    ticsConfigMock.installTics = false;

    vi.spyOn(exec, 'exec').mockImplementation(async (_compareDesc, _args, opts) => {
      opts?.listeners?.errline?.('[ERROR 666] Error');
      opts?.listeners?.errline?.('[ERROR 666] Error');
      return 0;
    });

    const response = await analyzer.runTicsAnalyzer('/path/to');

    expect(response.errorList).toHaveLength(1);
    expect(response.errorList).toEqual(['[ERROR 666] Error']);
  });

  it('should return two errors in errorlist', async () => {
    const analyzer = await import('../../../src/tics/analyzer');

    vi.spyOn(exec, 'exec').mockImplementation(async (_compareDesc, _args, opts) => {
      opts?.listeners?.errline?.('[ERROR 666] Error');
      opts?.listeners?.errline?.('[ERROR 777] Different error');
      return 0;
    });

    const response = await analyzer.runTicsAnalyzer('/path/to');

    expect(response.errorList).toHaveLength(2);
    expect(response.errorList).toEqual(['[ERROR 666] Error', '[ERROR 777] Different error']);
  });

  it('should return warnings in warningList', async () => {
    const analyzer = await import('../../../src/tics/analyzer');

    vi.spyOn(exec, 'exec').mockImplementation(async (_compareDesc, _args, opts) => {
      opts?.listeners?.stdline?.('[WARNING 5057] Warning');
      opts?.listeners?.stdline?.(`No files to analyze with option '-changed': all checkable files seem to be unchanged.`);
      opts?.listeners?.stdline?.('[WARNING 666] Warning');
      opts?.listeners?.stdline?.('[WARNING 777] Warning');
      return 0;
    });

    const response = await analyzer.runTicsAnalyzer('/path/to');

    expect(response.warningList).toHaveLength(4);
    expect(response.warningList).toEqual([
      '[WARNING 5057] Warning',
      `[WARNING 5057] No files to analyze with option '-changed': all checkable files seem to be unchanged.`,
      '[WARNING 666] Warning',
      '[WARNING 777] Warning'
    ]);
  });

  it('should add ExplorerUrl in response', async () => {
    const analyzer = await import('../../../src/tics/analyzer');
    ticsConfigMock.displayUrl = 'http://viewer.com';

    vi.spyOn(exec, 'exec').mockImplementationOnce(async (_compareDesc, _args, opts) => {
      opts?.listeners?.stdline?.('http://base.com/Explorer.html#axes=ClientData');
      opts?.listeners?.stdline?.('');
      return 0;
    });

    const response = await analyzer.runTicsAnalyzer('/path/to');

    expect(response.explorerUrls).toStrictEqual(['http://viewer.com/Explorer.html#axes=ClientData']);
  });

  it('should add all ExplorerUrls in response', async () => {
    const analyzer = await import('../../../src/tics/analyzer');
    ticsConfigMock.displayUrl = 'http://viewer.com';

    vi.spyOn(exec, 'exec').mockImplementationOnce(async (_compareDesc, _args, opts) => {
      opts?.listeners?.stdline?.('http://base.com/Explorer.html#axes=ClientData0');
      opts?.listeners?.stdline?.('http://base.com/Explorer.html#axes=ClientData1');
      opts?.listeners?.stdline?.('http://base.com/Explorer.html#axes=ClientData2');
      opts?.listeners?.stdline?.('');
      return 0;
    });

    const response = await analyzer.runTicsAnalyzer('/another/path');
    expect(response.explorerUrls).toStrictEqual([
      'http://viewer.com/Explorer.html#axes=ClientData0',
      'http://viewer.com/Explorer.html#axes=ClientData1',
      'http://viewer.com/Explorer.html#axes=ClientData2'
    ]);
  });
});

describe('throwing errors', () => {
  it('should throw error on exec', async () => {
    vi.spyOn(exec, 'exec').mockRejectedValue(new Error());
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { links: { installTics: '/install-url' } }, retryCount: 0, status: 200 });

    const response = await runTicsAnalyzer('');

    expect(response.statusCode).toBe(-1);
    expect(response.completed).toBe(false);
  });
});
