import { ticsConfig } from '../../src/configuration';
import { AnalysisResults, ProjectResult, QualityGate } from '../../src/helper/interfaces';
import { logger } from '../../src/helper/logger';
import * as api_helper from '../../src/tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate, getViewerVersion } from '../../src/tics/fetcher';

describe('getAnalyzedFiles', () => {
  test('Should return one analyzed file from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: [{ formattedValue: 'file.js' }] }));

    const spy = jest.spyOn(logger, 'debug');

    const response = await getAnalyzedFiles('url');

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

    const response = await getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  test('Should throw error on faulty httpRequest in getAnalyzedFiles', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await getAnalyzedFiles('url');

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

    const spy = jest.spyOn(logger, 'exit');

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

    const analysisResults: AnalysisResults = {
      passed: false,
      message: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: false,
            message: '',
            url: '',
            gates: [],
            annotationsApiV1Links: [{ url: 'url' }, { url: 'url' }]
          }
        }
      ]
    };

    const response = await getAnnotations(analysisResults);

    console.log(response);
    expect(response).toEqual([
      { annotation: 'anno_1', gateId: 0, instanceName: undefined },
      { annotation: 'anno_2', gateId: 1, instanceName: undefined }
    ]);
  });

  test('Should throw error on faulty httpRequest in getAnnotations', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    const analysisResults: AnalysisResults = {
      passed: false,
      message: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: false,
            message: '',
            url: '',
            gates: [],
            annotationsApiV1Links: [{ url: 'url' }]
          }
        }
      ]
    };

    await getAnnotations(analysisResults);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('getViewerVersion', () => {
  test('Should version of the viewer', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.resolve({ version: '2022.0.0' }));

    const response = await getViewerVersion();

    expect(response?.version).toEqual('2022.0.0');
  });

  test('Should throw error on faulty httpRequest in getViewerVersion', async () => {
    jest.spyOn(api_helper, 'httpRequest').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    const spy = jest.spyOn(logger, 'exit');

    await getViewerVersion();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
