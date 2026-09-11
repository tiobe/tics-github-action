import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as qualityGate from '../../../../src/viewer/qualitygate';
import * as tqiLabel from '../../../../src/viewer/tqi-label';

import { getClientAnalysisResults } from '../../../../src/analysis/client/analysis-results';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock, labelInfo } from './objects/analysis-results';

// Should be executed last due to spying rules
describe('getClientAnalysisResults', () => {
  // For multiproject run with project auto
  ticsCliMock.project = 'auto';
  ticsConfigMock.baseUrl = 'http://base.url';

  let analyzedFilesSpy: Mock<typeof analyzedFiles.getAnalyzedFiles>;
  let gateSpy: Mock<typeof qualityGate.getQualityGate>;
  let spyGetAnnotations: Mock<typeof annotations.getAnnotations>;
  let spyTqiLabel: Mock<typeof tqiLabel.getTqiLabel>;

  beforeEach(() => {
    vi.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    vi.spyOn(qualityGate, 'getQualityGateUrl').mockResolvedValue('QualityGate?filter=Project(project)');

    analyzedFilesSpy = vi.spyOn(analyzedFiles, 'getAnalyzedFiles');
    gateSpy = vi.spyOn(qualityGate, 'getQualityGate');
    spyGetAnnotations = vi.spyOn(annotations, 'getAnnotations');
    spyTqiLabel = vi.spyOn(tqiLabel, 'getTqiLabel');
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
    analyzedFilesSpy.mockResolvedValue(['file']);
    gateSpy.mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
        }
      ]
    });
  });

  it('should return on failed quality gate on single url', async () => {
    analyzedFilesSpy.mockResolvedValueOnce(['file']);
    gateSpy.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
        }
      ]
    });
  });

  it('should return on one failed quality gate on multiple urls', async () => {
    analyzedFilesSpy.mockResolvedValue(['file']);
    gateSpy.mockResolvedValueOnce(failedQualityGate);
    gateSpy.mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: passedQualityGate,
          annotations: [],
          labelInfo: []
        }
      ]
    });
  });

  it('should return on all failed quality gates on multiple urls', async () => {
    analyzedFilesSpy.mockResolvedValue(['file']);
    gateSpy.mockResolvedValue(failedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
        },
        {
          project: 'project',
          explorerUrl: 'https://url.com/Project(project)',
          analyzedFiles: ['file'],
          qualityGate: failedQualityGate,
          annotations: [],
          labelInfo: []
        }
      ]
    });
  });

  it('should return on failed quality gate with annotations', async () => {
    actionConfigMock.postAnnotations = true;

    analyzedFilesSpy.mockResolvedValueOnce(['file']);
    gateSpy.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce(annotationsMock);
    spyTqiLabel.mockResolvedValue(labelInfo);

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
          annotations: annotationsMock,
          labelInfo: labelInfo
        }
      ]
    });
  });
});
