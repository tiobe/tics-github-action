import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as qualityGate from '../../../../src/viewer/qualitygate';
import * as summary from '../../../../src/action/decorate/summary';

import { getClientAnalysisResults } from '../../../../src/analysis/client/analysis-results';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock, ticsReviewComments } from './objects/analysis-results';

// Should be executed last due to spying rules
describe('getClientAnalysisResults', () => {
  // For multiproject run with project auto
  ticsCliMock.project = 'auto';
  ticsConfigMock.baseUrl = 'http://base.url';

  test('Should return nothing on no ExplorerUrl given (should not happen, sanity check)', async () => {
    const result = await getClientAnalysisResults([], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      missesQualityGate: true,
      projectResults: []
    });
  });

  test('Should return on one passed quality gate with warnings', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: true,
      passedWithWarning: true,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate
        }
      ]
    });
  });

  test('Should return on failed quality gate on single url', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
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
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate
        }
      ]
    });
  });

  test('Should return on all failed quality gates on multiple urls', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValue(failedQualityGate);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate
        }
      ]
    });
  });

  test('Should return on failed quality gate with annotations', async () => {
    actionConfigMock.postAnnotations = true;

    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    jest.spyOn(annotations, 'getAnnotations').mockResolvedValueOnce(annotationsMock);
    jest.spyOn(summary, 'createReviewComments').mockReturnValueOnce(ticsReviewComments);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
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
