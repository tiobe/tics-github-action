import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as changed_files from '../../../../src/analysis/helper/changed-files';
import * as qualityGate from '../../../../src/viewer/qualitygate';
import * as changedFiles from '../../../../src/analysis/helper/changed-files';

import { getAnalysisResult } from '../../../../src/analysis/qserver/analysis-result';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock } from './objects/analysis-results';

afterEach(() => {
  vi.resetAllMocks();
});

// Should be executed last due to spying rules
describe('getAnalysisResult', () => {
  let spyGetChangedFiles: Mock<typeof changedFiles.getChangedFiles>;
  let spyAnalyzedFiles: Mock<typeof analyzedFiles.getAnalyzedFiles>;
  let spyQualityGate: Mock<typeof qualityGate.getQualityGate>;
  let spyGetAnnotations: Mock<typeof annotations.getAnnotations>;
  let spyCreateChangedFiles: Mock<any>;

  // For multiproject run with project auto
  ticsCliMock.project = 'project';
  ticsConfigMock.baseUrl = 'http://base.url';

  beforeEach(() => {
    vi.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    vi.spyOn(qualityGate, 'getQualityGateUrl').mockResolvedValue('QualityGate?filter=Project(project)');

    spyGetChangedFiles = vi.spyOn(changedFiles, 'getChangedFiles');
    spyAnalyzedFiles = vi.spyOn(analyzedFiles, 'getAnalyzedFiles');
    spyQualityGate = vi.spyOn(qualityGate, 'getQualityGate');
    spyGetAnnotations = vi.spyOn(annotations, 'getAnnotations');
    spyCreateChangedFiles = vi.spyOn(changed_files, 'getChangedFiles');
  });

  it('should return on one passed quality gate with warnings', async () => {
    spyGetChangedFiles.mockResolvedValue({ files: [], path: '' });
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: true,
      message: '',
      passedWithWarning: true,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on failed quality gate on single url', async () => {
    spyGetChangedFiles.mockResolvedValue({ files: [], path: '' });
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce([]);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: false,
      message: 'Project failed quality gate',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: []
        }
      ]
    });
  });

  it('should return on failed quality gate with annotations', async () => {
    actionConfigMock.postAnnotations = true;

    spyGetChangedFiles.mockResolvedValue({ files: [], path: '' });
    spyAnalyzedFiles.mockResolvedValueOnce(['file']);
    spyQualityGate.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce(annotationsMock);
    spyCreateChangedFiles.mockResolvedValue(['file']);

    const result = await getAnalysisResult(12345000);

    expect(result).toEqual({
      passed: false,
      message: 'Project failed quality gate',
      passedWithWarning: false,
      projectResults: [
        {
          project: 'project',
          explorerUrl: 'http://base.url/url',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: annotationsMock
        }
      ]
    });
  });
});
