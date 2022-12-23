import * as exec from '@actions/exec';
import * as api_helper from '../../src/tics/api_helper';
import { expect, test, jest } from '@jest/globals';
import { githubConfig, ticsConfig } from '../../src/configuration';
import Logger from '../../src/helper/logger';
import { runTicsAnalyzer } from '../../src/tics/analyzer';

// test for multiple different types of configurations
test('Should call exec with minimal TiCS command for Linux', async () => {
  const spy = jest.spyOn(exec, 'exec');
  (exec.exec as any).mockResolvedValueOnce(0);

  githubConfig.runnerOS = 'Linux';

  const response = await runTicsAnalyzer('/path/to');

  expect(response.statusCode).toEqual(0);
  expect(response.completed).toEqual(true);
  expect(spy).toHaveBeenCalledWith('/bin/bash -c " TICS @/path/to -viewer -project \'project\' -calc GATE "', [], {
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
  expect(spy).toHaveBeenCalledWith(`powershell "; if ($?) {TICS @/path/to -viewer -project \'project\' -calc GATE }"`, [], {
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
    "/bin/bash -c \" TICS @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9\"",
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
    "powershell \"; if ($?) {TICS @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9}\"",
    [],
    {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    }
  );
});

test('Should call exec with full TiCS command for Linux', async () => {
  (exec.exec as any).mockResolvedValueOnce(0);
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));
  const spy = jest.spyOn(exec, 'exec');

  ticsConfig.calc = 'CS';
  ticsConfig.clientData = 'token';
  ticsConfig.tmpDir = '/home/ubuntu/test';
  ticsConfig.additionalFlags = '-log 9';
  ticsConfig.installTics = true;

  githubConfig.runnerOS = 'Linux';

  const response = await runTicsAnalyzer('/path/to');

  expect(response.statusCode).toEqual(0);
  expect(response.completed).toEqual(true);
  expect(spy).toHaveBeenCalledWith(
    "/bin/bash -c \"source <(curl -s 'base.com/url') && TICS @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9\"",
    [],
    {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    }
  );
});

test('Should call exec with full TiCS command for Windows', async () => {
  (exec.exec as any).mockResolvedValueOnce(0);
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ links: { installTics: 'url' } }));
  const spy = jest.spyOn(exec, 'exec');

  ticsConfig.calc = 'CS';
  ticsConfig.clientData = 'token';
  ticsConfig.tmpDir = '/home/ubuntu/test';
  ticsConfig.additionalFlags = '-log 9';
  ticsConfig.installTics = true;

  githubConfig.runnerOS = 'Windows';

  const response = await runTicsAnalyzer('/path/to');

  expect(response.statusCode).toEqual(0);
  expect(response.completed).toEqual(true);
  expect(spy).toHaveBeenCalledWith(
    "powershell \"Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('base.com/url')); if ($?) {TICS @/path/to -viewer -project 'project' -calc CS -cdtoken token -tmpdir '/home/ubuntu/test' -log 9}\"",
    [],
    {
      listeners: { stderr: expect.any(Function), stdout: expect.any(Function) },
      silent: true
    }
  );
});

// test exec callback function (like findInStdOutOrErr)
test('Should add error in errorlist', async () => {
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);

  const response = await runTicsAnalyzer('/path/to');
  (exec.exec as any).mock.calls[0][2].listeners.stderr('[ERROR 666] Error');

  expect(response.errorList.length).toEqual(1);
  expect(response.errorList).toEqual(['[ERROR 666] Error']);
});

test('Should add error in errorlist', async () => {
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);

  const response = await runTicsAnalyzer('/path/to');
  (exec.exec as any).mock.calls[0][2].listeners.stdout('[WARNING 666] Warning');

  expect(response.warningList.length).toEqual(1);
  expect(response.warningList).toEqual(['[WARNING 666] Warning']);
});

test('Should add ExplorerUrl in response', async () => {
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  await runTicsAnalyzer('/path/to');
  (exec.exec as any).mock.calls[0][2].listeners.stdout('http://localhost/Explorer.html#axes=ClientData');
  (exec.exec as any).mockResolvedValueOnce(0);
  const response = await runTicsAnalyzer('/path/to');

  expect(response.explorerUrl).toEqual('<url>/Explorer.html#axes=ClientData');
});

// throw errors
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
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));
  const spy = jest.spyOn(Logger.Instance, 'exit');

  await runTicsAnalyzer('');

  expect(spy).toHaveBeenCalledTimes(1);
});
