import { ticsConfig } from '../../src/configuration';
import { logger } from '../../src/helper/logger';
import * as api_helper from '../../src/tics/api_helper';
import * as fetcher from '../../src/tics/fetcher';

describe('getAnalyzedFiles', () => {
  test('Should return one analyzed file from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }] }));

    const spy = jest.spyOn(logger, 'debug');

    const response = await fetcher.getAnalyzedFiles('url');

    expect(response).toEqual(['file.js']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should return two analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest
      .spyOn(api_helper, 'httpRequest')
      .mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] }));

    const spy = jest.spyOn(logger, 'debug');

    const response = await fetcher.getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  test('Should throw error on faulty httpRequest in getAnalyzedFiles', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await fetcher.getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getQualityGate', () => {
  test('Should return quality gates from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockResolvedValueOnce({ data: 'data' });

    ticsConfig.branchName = 'main';

    const response = await fetcher.getQualityGate('url');

    expect(response).toEqual({ data: 'data' });
  });

  test('Should throw error on faulty httpRequest in getQualityGate', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await fetcher.getQualityGate('url');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getAnnotations', () => {
  test('Should return analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_1' }] }));
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ annotation: 'anno_2' }] }));

    const response = await fetcher.getAnnotations([{ url: 'url' }, { url: 'url' }]);

    expect(response).toEqual([
      { annotation: 'anno_1', gateId: 0, instanceName: undefined },
      { annotation: 'anno_2', gateId: 1, instanceName: undefined }
    ]);
  });

  test('Should throw error on faulty httpRequest in getAnnotations', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await fetcher.getAnnotations([{ url: 'url' }]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getViewerVersion', () => {
  test('Should version of the viewer', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ version: '2022.0.0' }));

    const response = await fetcher.getViewerVersion();

    expect(response?.version).toEqual('2022.0.0');
  });

  test('Should throw error on faulty httpRequest in getViewerVersion', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await fetcher.getViewerVersion();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

// Should be executed last due to spying rules
describe('getAnalysisResults', () => {
  test('Should return nothing on no ExplorerUrl given (should not happen, sanity check)', async () => {
    const result = await fetcher.getAnalysisResults([], []);

    expect(result).toEqual({
      passed: false,
      message: 'No Explorer url found',
      missesQualityGate: true,
      projectResults: []
    });
  });

  test('Should return single analyzed file and no quality gate', async () => {
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(undefined);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: '',
      missesQualityGate: true,
      projectResults: [
        {
          project: 'projectName',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: undefined
        }
      ]
    });
  });

  test('Should return single analyzed file and failed quality gate', async () => {
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce({
      passed: false,
      message: 'failed',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    });

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: 'failed ',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'projectName',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: {
            passed: false,
            message: 'failed',
            url: 'url',
            gates: [],
            annotationsApiV1Links: []
          }
        }
      ]
    });
  });
});
