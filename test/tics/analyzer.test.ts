import * as exec from '@actions/exec';
import * as api_helper from '../../src/tics/api_helper';
import { githubConfig, ticsConfig } from '../../src/configuration';
import Logger from '../../src/helper/logger';
import { runTicsAnalyzer } from '../../src/tics/analyzer';

// test for multiple different types of configurations
describe('test multiple types of configuration', () => {
  test('Should call exec with diagnostic TiCS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);

    githubConfig.runnerOS = 'Linux';
    ticsConfig.mode = 'diagnostic';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith('/bin/bash -c " TICS -ide github -version "', [], {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    });
  });

  test('Should call exec with minimal TiCS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);

    githubConfig.runnerOS = 'Linux';
    ticsConfig.mode = 'default';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith('/bin/bash -c " TICS -ide github @/path/to -viewer -project \'project\' -calc GATE "', [], {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    });
  });

  test('Should call exec with minimal TiCS command for Windows', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);

    githubConfig.runnerOS = 'Windows';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(`powershell "; if ($?) {TICS -ide github @/path/to -viewer -project \'project\' -calc GATE }"`, [], {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    });
  });

  test('Should call exec with run TiCS command for Linux', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);

    ticsConfig.calc = 'CS';
    ticsConfig.clientData = 'token';
    ticsConfig.tmpDir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';

    githubConfig.runnerOS = 'Linux';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "/bin/bash -c \" TICS -ide github @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with run TiCS command for Windows', async () => {
    const spy = jest.spyOn(exec, 'exec');
    (exec.exec as any).mockResolvedValueOnce(0);

    ticsConfig.calc = 'CS';
    ticsConfig.clientData = 'token';
    ticsConfig.tmpDir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';

    githubConfig.runnerOS = 'Windows';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"; if ($?) {TICS -ide github @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9}\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TiCS command for Linux, trustStrategy self-signed', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));
    const spy = jest.spyOn(exec, 'exec');

    ticsConfig.calc = 'CS';
    ticsConfig.clientData = 'token';
    ticsConfig.tmpDir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';
    ticsConfig.installTics = true;
    ticsConfig.trustStrategy = 'self-signed';

    githubConfig.runnerOS = 'Linux';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "/bin/bash -c \"source <(curl --silent --insecure 'http://base.com/url') && TICS -ide github @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });

  test('Should call exec with full TiCS command for Windows, no trustStrategy set', async () => {
    (exec.exec as any).mockResolvedValueOnce(0);
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));
    const spy = jest.spyOn(exec, 'exec');

    ticsConfig.calc = 'CS';
    ticsConfig.clientData = 'token';
    ticsConfig.tmpDir = '/home/ubuntu/test';
    ticsConfig.additionalFlags = '-log 9';
    ticsConfig.installTics = true;
    ticsConfig.trustStrategy = '';

    githubConfig.runnerOS = 'Windows';

    const response = await runTicsAnalyzer('/path/to');

    expect(response.statusCode).toEqual(0);
    expect(response.completed).toEqual(true);
    expect(spy).toHaveBeenCalledWith(
      "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072;  iex ((New-Object System.Net.WebClient).DownloadString('http://base.com/url')); if ($?) {TICS -ide github @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9}\"",
      [],
      {
        listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
        silent: true
      }
    );
  });
});

test('Should call exec with full TiCS command for Windows, trustStrategy set to all', async () => {
  (exec.exec as any).mockResolvedValueOnce(0);
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));
  const spy = jest.spyOn(exec, 'exec');

  ticsConfig.calc = 'CS';
  ticsConfig.clientData = 'token';
  ticsConfig.tmpDir = '/home/ubuntu/test';
  ticsConfig.additionalFlags = '';
  ticsConfig.installTics = true;
  ticsConfig.trustStrategy = 'all';
  ticsConfig.nocalc = 'CW';
  ticsConfig.recalc = 'CY';
  ticsConfig.norecalc = 'CD';
  ticsConfig.codetype = 'TESTCODE';
  githubConfig.debugger = true;

  githubConfig.runnerOS = 'Windows';

  const response = await runTicsAnalyzer('/path/to');

  expect(response.statusCode).toEqual(0);
  expect(response.completed).toEqual(true);
  expect(spy).toHaveBeenCalledWith(
    "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}; iex ((New-Object System.Net.WebClient).DownloadString('http://base.com/url')); if ($?) {TICS -ide github @/path/to -viewer -project 'project' -calc CS -nocalc CW -recalc CY -norecalc CD -codetype TESTCODE -cdtoken token -tmpdir '/home/ubuntu/test'  -log 9}\"",
    [],
    {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    }
  );
});

// test exec callback function (like findInStdOutOrErr)
describe('test callback functions', () => {
  test('Should return single error if already exists in errorlist', async () => {
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
    (exec.exec as any).mock.calls[0][2].listeners.stdout('http://localhost/Explorer.html#axes=ClientData');
    (exec.exec as any).mockResolvedValueOnce(0);
    const response = await runTicsAnalyzer('/path/to');

    expect(response.explorerUrl).toEqual('<url>/Explorer.html#axes=ClientData');
  });
});

describe('throwing errors', () => {
  test('Should throw error on exec', async () => {
    (exec.exec as any).mockImplementationOnce(() => {
      throw new Error();
    });
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));

    const response = await runTicsAnalyzer('');

    expect(response.statusCode).toEqual(-1);
    expect(response.completed).toEqual(false);
  });

  test('Should throw error on httpRequest in retrieveInstallTics', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));
    const spy = jest.spyOn(Logger.Instance, 'exit');

    await runTicsAnalyzer('');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
