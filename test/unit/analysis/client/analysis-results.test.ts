import { describe, expect, it, jest } from '@jest/globals';
import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as qualityGate from '../../../../src/viewer/qualitygate';

import { getClientAnalysisResults } from '../../../../src/analysis/client/analysis-results';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock } from './objects/analysis-results';

// Should be executed last due to spying rules
describe('getClientAnalysisResults', () => {
  // For multiproject run with project auto
  ticsCliMock.project = 'auto';
  ticsConfigMock.baseUrl = 'http://base.url';

  let spyGetAnnotations: jest.SpiedFunction<typeof annotations.getAnnotations>;

  beforeEach(() => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    jest.spyOn(qualityGate, 'getQualityGateUrl').mockResolvedValue('QualityGate?filter=Project(project)');
    spyGetAnnotations = jest.spyOn(annotations, 'getAnnotations');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return nothing on no ExplorerUrl given (should not happen, sanity check)', async () => {
    const result = await getClientAnalysisResults([], []);

    expect(result).toEqual({
      passed: false,
      message: '',
      passedWithWarning: false,
      projectResults: []
    });
  });

  it('should return on one passed quality gate with warnings', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: true,
      message: '',
      passedWithWarning: true,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on failed quality gate on single url', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: 'Project failed quality gate(s)',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on one failed quality gate on multiple urls', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: '1 out of 2 projects failed quality gate(s)',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: []
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on all failed quality gates on multiple urls', async () => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValue(failedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)', 'https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: '2 out of 2 projects failed quality gate(s)',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: []
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on failed quality gate with annotations', async () => {
    actionConfigMock.postAnnotations = true;

    jest.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    jest.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce(annotationsMock);

    const result = await getClientAnalysisResults(['https://url.com/Project(project)'], []);

    expect(result).toEqual({
      passed: false,
      message: 'Project failed quality gate(s)',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: annotationsMock
        }
      ]
    });
  });
});
