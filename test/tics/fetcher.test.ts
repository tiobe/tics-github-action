import { ticsConfig } from '../../src/configuration';
import { ChangedFile } from '../../src/helper/interfaces';
import Logger from '../../src/helper/logger';
import * as api_helper from '../../src/tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate, getViewerVersion } from '../../src/tics/fetcher';

describe('getAnalyzedFiles', () => {
  test('Should return one analyzed file from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }] }));

    const spy = jest.spyOn(Logger.Instance, 'debug');

    const response = await getAnalyzedFiles('url', changedFiles);

    expect(response).toEqual(['file.js']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should return two analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest
      .spyOn(api_helper, 'httpRequest')
      .mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] }));

    const spy = jest.spyOn(Logger.Instance, 'debug');

    const response = await getAnalyzedFiles('url', changedFiles);

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  test('Should return one analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest
      .spyOn(api_helper, 'httpRequest')
      .mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }, { formattedValue: 'filed.js' }] }));

    const spy = jest.spyOn(Logger.Instance, 'debug');

    const response = await getAnalyzedFiles('url', changedFiles);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(response).toEqual(['file.js']);
  });

  test('Should throw error on faulty httpRequest in getAnalyzedFiles', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(Logger.Instance, 'exit');

    await getAnalyzedFiles('url', changedFiles);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getQualityGate', () => {
  test('Should return quality gates from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockResolvedValueOnce({ data: 'data' });

    ticsConfig.branchName = 'main';

    const response = await getQualityGate('url');

    expect(response).toEqual({ data: 'data' });
  });

  test('Should throw error on faulty httpRequest in getQualityGate', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(Logger.Instance, 'exit');

    await getQualityGate('url');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getAnnotations', () => {
  test('Should return analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_1' }] }));
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_2' }] }));

    const response = await getAnnotations([{ url: 'url' }, { url: 'url' }]);

    expect(response).toEqual([
      { annotation: 'anno_1', gateId: 0 },
      { annotation: 'anno_2', gateId: 1 }
    ]);
  });

  test('Should throw error on faulty httpRequest in getAnnotations', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(Logger.Instance, 'exit');

    await getAnnotations([{ url: 'url' }]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getViewerVersion', () => {
  test('Should version of the viewer', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ version: '2022.0.0' }));

    const response = await getViewerVersion();

    expect(response.version).toEqual('2022.0.0');
  });

  test('Should throw error on faulty httpRequest in getViewerVersion', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(Logger.Instance, 'exit');

    await getViewerVersion();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

const changedFiles: ChangedFile[] = [
  {
    sha: 'sha',
    filename: 'file.js',
    status: 'added',
    additions: 0,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url'
  },
  {
    sha: 'sha',
    filename: 'files.js',
    status: 'added',
    additions: 0,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url'
  }
];
