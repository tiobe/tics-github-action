import * as exec from '@actions/exec';
import * as os from 'os';
import { githubConfig, ticsConfig, httpClient } from '../../../src/configuration';
import { runTicsAnalyzer } from '../../../src/tics/analyzer';
import { Mode, TrustStrategy } from '../../../src/helper/enums';

// test for multiple different types of configurations
describe('test multiple types of configuration', () => {
  const originalTrustStrategy = process.env.TICSTRUSTSTRATEGY;

  beforeAll(() => {
    ticsConfig.ticsConfiguration = 'http://base.com/tiobeweb/TICS/api/cfg?name=default';
  });

  afterEach(() => {
    delete process.env.TICSTRUSTSTRATEGY;
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env.TICSTRUSTSTRATEGY = originalTrustStrategy;
  });

  test('Should call exec with diagnostic TICS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    ticsConfig.mode = Mode.DIAGNOSTIC;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(`/bin/bash -c "TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; TICS -ide github -help"`, [], {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    });
  });

  test('Should call exec with minimal TICS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    ticsConfig.mode = Mode.CLIENT;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      `/bin/bash -c "TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; TICS -ide github '@/path/to' -viewer -project 'project' -calc GATE "`,
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with minimal TICS command for Windows', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      `powershell "$env:TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -calc GATE }"`,
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with run TICS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "/bin/bash -c \"TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; TICS -ide github '@/path/to' -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test/123-1' -log 9 \"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with run TICS command for Windows', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"$env:TICS='http://base.com/tiobeweb/TICS/api/cfg?name=default'; if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test/123-1' -log 9 }\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TICS command for Linux, trustStrategy self-signed', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { links: { installTics: '/install-url' } } }));
    const spy = jest.spyOn(exec, 'exec');
    jest.spyOn(os, 'platform').mockReturnValue('linux');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';
    ticsConfig.installTics = true;

    process.env.TICSTRUSTSTRATEGY = 'self-signed';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "/bin/bash -c \"source <(curl --silent --insecure 'http://base.com/tiobeweb/TICS/install-url') && TICS -ide github '@/path/to' -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test/123-1' -log 9 \"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TICS command for Windows, no trustStrategy set', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { links: { installTics: '/install-url' } } }));
    const spy = jest.spyOn(exec, 'exec');
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';
    ticsConfig.installTics = true;
    ticsConfig.trustStrategy = TrustStrategy.STRICT;

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;  iex ((New-Object System.Net.WebClient).DownloadString('http://base.com/tiobeweb/TICS/install-url')); if ($?) {TICS -ide github '@/path/to' -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test/123-1' -log 9 }\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TICS command for Windows, trustStrategy set to all', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { links: { installTics: '/install-url' } } }));
    const spy = jest.spyOn(exec, 'exec');
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '';
    ticsConfig.installTics = true;
    ticsConfig.nocalc = 'CW';
    ticsConfig.recalc = 'CY';
    ticsConfig.norecalc = 'CD';
    ticsConfig.codetype = 'TESTCODE';
    ticsConfig.filelist = '/path/to/file.txt';
    githubConfig.debugger = true;

    process.env.TICSTRUSTSTRATEGY = 'all';

    const response = await runTicsAnalyzer('/path/to/file.txt');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; iex ((New-Object System.Net.WebClient).DownloadString('http://base.com/tiobeweb/TICS/install-url')); if ($?) {TICS -ide github '@/path/to/file.txt' -viewer -project 'project' -calc CS -cdtoken token -codetype TESTCODE -nocalc CW -norecalc CD -recalc CY -tmpdir '/home/ubuntu/test/123-1' -log 9}\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TICS command for Windows and filelist .', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { links: { installTics: '/install-url' } } }));
    const spy = jest.spyOn(exec, 'exec');
    jest.spyOn(os, 'platform').mockReturnValue('win32');

    ticsConfig.calc = 'CS';
    ticsConfig.cdtoken = 'token';
    ticsConfig.tmpdir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '';
    ticsConfig.installTics = true;
    ticsConfig.nocalc = 'CW';
    ticsConfig.recalc = 'CY';
    ticsConfig.norecalc = 'CD';
    ticsConfig.codetype = 'TESTCODE';
    ticsConfig.filelist = '.';
    ticsConfig.branchname = 'main';
    githubConfig.debugger = true;

    process.env.TICSTRUSTSTRATEGY = 'all';

    const response = await runTicsAnalyzer('.');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; iex ((New-Object System.Net.WebClient).DownloadString('http://base.com/tiobeweb/TICS/install-url')); if ($?) {TICS -ide github . -viewer -project 'project' -calc CS -branchname main -cdtoken token -codetype TESTCODE -nocalc CW -norecalc CD -recalc CY -tmpdir '/home/ubuntu/test/123-1' -log 9}\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });
});

// test exec callback function (like findInStdOutOrErr)
describe('test callback functions', () => {
  test('Should return single error if already exists in errorlist', async () => {
    ticsConfig.installTics = false;

    const response = await runTicsAnalyzer('/path/to');
    (exec.exec as any).mock.calls[0][2].listeners.stderr('[ERROR 666] Error');
    (exec.exec as any).mock.calls[0][2].listeners.stderr('[ERROR 666] Error');

    expect(response.errorList.length).toEqual(1);
    expect(response.errorList).toEqual(['[ERROR 666] Error']);
  });

  test('Should return two errors in errorlist', async () => {
    const response = await runTicsAnalyzer('/path/to');
    (exec.exec as any).mock.calls[0][2].listeners.stderr('[ERROR 666] Error');
    (exec.exec as any).mock.calls[0][2].listeners.stderr('[ERROR 777] Different error');

    expect(response.errorList.length).toEqual(2);
    expect(response.errorList).toEqual(['[ERROR 666] Error', '[ERROR 777] Different error']);
  });

  test('Should return warnings in warningList', async () => {
    const response = await runTicsAnalyzer('/path/to');
    (exec.exec as any).mock.calls[0][2].listeners.stdout('[WARNING 666] Warning');
    (exec.exec as any).mock.calls[0][2].listeners.stdout('[WARNING 777] Warning');

    expect(response.warningList.length).toEqual(2);
    expect(response.warningList).toEqual(['[WARNING 666] Warning', '[WARNING 777] Warning']);
  });

  test('Should add ExplorerUrl in response', async () => {
    jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    await runTicsAnalyzer('/path/to');
    (exec.exec as any).mock.calls[0][2].listeners.stdout('http://base.com/Explorer.html#axes=ClientData');
    (exec.exec as any).mockResolvedValueOnce(0);
    const response = await runTicsAnalyzer('/path/to');

    expect(response.explorerUrls[0]).toEqual('http://viewer.com/Explorer.html#axes=ClientData');
  });
});

describe('throwing errors', () => {
  test('Should throw error on exec', async () => {
    (exec.exec as any).mockImplementationOnce(() => {
      throw new Error();
    });
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { links: { installTics: '/install-url' } } }));

    const response = await runTicsAnalyzer('');

    expect(response.statusCode).toEqual(-1);
    expect(response.completed).toEqual(false);
  });
});
