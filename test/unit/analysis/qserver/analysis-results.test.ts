import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as changed_files from '../../../../src/analysis/helper/changed-files';
import * as qualityGate from '../../../../src/viewer/qualitygate';
import * as summary from '../../../../src/action/decorate/summary';

import { getAnalysisResult } from '../../../../src/analysis/qserver/analysis-result';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock, ticsReviewComments } from './objects/analysis-results';

afterEach(() => {
  jest.resetAllMocks();
});

// Should be executed last due to spying rules
describe('getAnalysisResult', () => {
  let spyAnalyzedFiles: jest.SpyInstance;
  let spyQualityGate: jest.SpyInstance;
  let spyGetAnnotations: jest.SpyInstance;
  let spyCreateReviewComments: jest.SpyInstance;
  let spyCreateChangedFiles: jest.SpyInstance;

  // For multiproject run with project auto
  ticsCliMock.project = 'project';
  ticsConfigMock.baseUrl = 'http://base.url';

  beforeEach(() => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    jest.spyOn(qualityGate, 'getQualityGateUrl').mockReturnValue('QualityGate?filter=Project(project)');

    spyAnalyzedFiles = jest.spyOn(analyzedFiles, 'getAnalyzedFiles');
    spyQualityGate = jest.spyOn(qualityGate, 'getQualityGate');
    spyGetAnnotations = jest.spyOn(annotations, 'getAnnotations');
    spyCreateReviewComments = jest.spyOn(summary, 'createReviewComments');
    spyCreateChangedFiles = jest.spyOn(changed_files, 'getChangedFiles');
  });

  test('Should return on one passed quality gate with warnings', async () => {
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(passedQualityGate);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: true,
      passedWithWarning: true,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate,
          reviewComments: undefined
        }
      ]
    });
  });

  test('Should return on failed quality gate on single url', async () => {
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(failedQualityGate);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          reviewComments: undefined
        }
      ]
    });
  });

  test('Should return on failed quality gate with annotations', async () => {
    actionConfigMock.postAnnotations = true;

    spyAnalyzedFiles.mockResolvedValueOnce(['file']);
    spyQualityGate.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce(annotationsMock);
    spyCreateReviewComments.mockReturnValueOnce(ticsReviewComments);
    spyCreateChangedFiles.mockResolvedValue(['file']);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: false,
      passedWithWarning: false,
      missesQualityGate: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          reviewComments: ticsReviewComments
        }
      ]
    });
  });
});
