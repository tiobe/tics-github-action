import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
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

  let spyGetAnnotations: Mock<typeof annotations.getAnnotations>;

  beforeEach(() => {
    vi.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    vi.spyOn(qualityGate, 'getQualityGateUrl').mockResolvedValue('QualityGate?filter=Project(project)');
    spyGetAnnotations = vi.spyOn(annotations, 'getAnnotations');
  });

  afterEach(() => {
    vi.resetAllMocks();
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
    vi.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);
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
    vi.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
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
    vi.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(passedQualityGate);
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
    vi.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValue(['file']);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValue(failedQualityGate);
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

    vi.spyOn(analyzedFiles, 'getAnalyzedFiles').mockResolvedValueOnce(['file']);
    vi.spyOn(qualityGate, 'getQualityGate').mockResolvedValueOnce(failedQualityGate);
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
