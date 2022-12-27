import { expect, test, jest } from '@jest/globals';
import { ticsConfig } from '../../src/configuration';
import Logger from '../../src/helper/logger';
import * as api_helper from '../../src/tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate } from '../../src/tics/fetcher';

// getAnalyzedFiles
test('Should return analyzed file from viewer', async () => {
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }] }));

  const spy = jest.spyOn(Logger.Instance, 'debug');

  const response = await getAnalyzedFiles('url');

  expect(spy).toHaveBeenCalledTimes(2);
  expect(response).toEqual(['file.js']);
});

test('Should return analyzed files from viewer', async () => {
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest
    .spyOn(api_helper, 'httpRequest')
    .mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] }));

  const spy = jest.spyOn(Logger.Instance, 'debug');

  const response = await getAnalyzedFiles('url');

  expect(spy).toHaveBeenCalledTimes(3);
  expect(response).toEqual(['file.js', 'files.js']);
});

test('Should throw error on faulty httpRequest in getAnalyzedFiles', async () => {
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

  const spy = jest.spyOn(Logger.Instance, 'exit');

  await getAnalyzedFiles('url');

  expect(spy).toHaveBeenCalledTimes(1);
});

// getQualityGate
test('Should return quality gates from viewer', async () => {
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: 'data' }));

  ticsConfig.branchName = 'main';

  const response = await getQualityGate('url');

  expect(response).toEqual({ data: 'data' });
});

test('Should throw error on faulty httpRequest in getQualityGate', async () => {
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

  const spy = jest.spyOn(Logger.Instance, 'exit');

  await getQualityGate('url');

  expect(spy).toHaveBeenCalledTimes(1);
});

// getAnnotations
test('Should return analyzed files from viewer', async () => {
  jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
  jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_1' }] }));
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_2' }] }));

  const response = await getAnnotations([{ url: 'url' }, { url: 'url' }]);

  expect(response).toEqual([{ annotation: 'anno_1' }, { annotation: 'anno_2' }]);
});

test('Should throw error on faulty httpRequest in getAnnotations', async () => {
  jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
  jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

  const spy = jest.spyOn(Logger.Instance, 'exit');

  await getAnnotations([{ url: 'url' }]);

  expect(spy).toHaveBeenCalledTimes(1);
});
