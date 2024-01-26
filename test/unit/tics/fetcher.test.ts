import { ticsConfig, httpClient } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';
import * as api_helper from '../../../src/tics/api_helper';
import * as fetcher from '../../../src/tics/fetcher';
import * as summary from '../../../src/helper/summary';
import { ticsReviewComments, annotations, failedQualityGate, passedQualityGate } from './objects/fetcher';

describe('getAnalyzedFiles', () => {
  test('Should return one analyzed file from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: [{ formattedValue: 'file.js' }] } }));

    const spy = jest.spyOn(logger, 'debug');

    const response = await fetcher.getAnalyzedFiles('url');

    expect(response).toEqual(['file.js']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should return two analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest
      .spyOn(httpClient, 'get')
      .mockImplementationOnce(
        (): Promise<any> => Promise.resolve({ data: { data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] } })
      );

    const spy = jest.spyOn(logger, 'debug');

    const response = await fetcher.getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  test('Should throw error on faulty get in getAnalyzedFiles', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await fetcher.getAnalyzedFiles('url');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getQualityGate', () => {
  test('Should return quality gates from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: 'data' } }));

    ticsConfig.branchName = 'main';

    const response = await fetcher.getQualityGate('url');

    expect(response).toEqual({ data: 'data' });
  });

  test('Should throw error on faulty get in getQualityGate', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(api_helper, 'getProjectName').mockReturnValueOnce('projectName');
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await fetcher.getQualityGate('url');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getAnnotations', () => {
  test('Should return analyzed files from viewer', async () => {
    jest.spyOn(api_helper, 'getItemFromUrl').mockReturnValueOnce('clientData');
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: [{ type: 'CS' }] } }));
    jest
      .spyOn(httpClient, 'get')
      .mockImplementationOnce(
        (): Promise<any> =>
          Promise.resolve({ data: { data: [{ type: 'CS' }], annotationTypes: { CS: { instanceName: 'Coding Standard Violations' } } } })
      );

    const response = await fetcher.getAnnotations([{ url: 'url' }, { url: 'url' }]);

    expect(response).toEqual([
      { type: 'CS', gateId: 0, instanceName: 'CS' },
      { type: 'CS', gateId: 1, instanceName: 'Coding Standard Violations' }
    ]);
  });

  test('Should throw error on faulty get in getAnnotations', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await fetcher.getAnnotations([{ url: 'url' }]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getViewerVersion', () => {
  test('Should version of the viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { version: '2022.0.0' } }));

    const response = await fetcher.getViewerVersion();

    expect(response?.version).toEqual('2022.0.0');
  });

  test('Should throw error on faulty get in getViewerVersion', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await fetcher.getViewerVersion();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

// Should be executed last due to spying rules
describe('getAnalysisResults', () => {
  // For multiproject run with project auto
  ticsConfig.projectName = 'auto';

  test('Should return nothing on no ExplorerUrl given (should not happen, sanity check)', async () => {
    const result = await fetcher.getAnalysisResults([], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: 'No Explorer url found',
      missesQualityGate: true,
      projectResults: []
    });
  });

  test('Should return on no quality gate', async () => {
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(undefined);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: '',
      missesQualityGate: true,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: undefined
        }
      ]
    });
  });

  test('Should return on one passed quality gate with warnings', async () => {
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(projectName)'], []);

    expect(result).toEqual({
      passed: true,
      passedWithWarning: true,
      message: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'projectName',
          explorerUrl: 'https://url.com/Project(projectName)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate
        }
      ]
    });
  });

  test('Should return on failed quality gate on single url', async () => {
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: 'failed;',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        }
      ]
    });
  });

  test('Should return on one failed quality gate on multiple urls', async () => {
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(projectName)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: 'failed;',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        },
        {
          project: 'projectName',
          explorerUrl: 'https://url.com/Project(projectName)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate
        }
      ]
    });
  });

  test('Should return on all failed quality gates on multiple urls', async () => {
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValue(failedQualityGate);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(projectName)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: 'failed; failed;',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        },
        {
          project: 'projectName',
          explorerUrl: 'https://url.com/Project(projectName)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        }
      ]
    });
  });

  test('Should return on failed quality gate with annotations', async () => {
    ticsConfig.postAnnotations = true;

    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(annotations);
    jest.spyOn(summary, 'createReviewComments').mockReturnValueOnce(ticsReviewComments);

    const result = await fetcher.getAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      message: 'failed;',
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          reviewComments: ticsReviewComments
        }
      ]
    });
  });
});
