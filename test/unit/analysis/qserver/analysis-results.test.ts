import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as analyzedFiles from '../../../../src/viewer/analyzed-files';
import * as annotations from '../../../../src/viewer/annotations';
import * as changed_files from '../../../../src/analysis/helper/changed-files';
import * as qualityGate from '../../../../src/viewer/qualitygate';
import * as changedFiles from '../../../../src/analysis/helper/changed-files';
import * as tqiLabel from '../../../../src/viewer/tqi-label';

import { getAnalysisResult } from '../../../../src/analysis/qserver/analysis-result';
import { ticsCliMock, ticsConfigMock, actionConfigMock } from '../../../.setup/mock';
import { passedQualityGate, failedQualityGate, annotationsMock, labelInfo } from './objects/analysis-results';

afterEach(() => {
  jest.resetAllMocks();
});

// Should be executed last due to spying rules
describe('getAnalysisResult', () => {
  let spyGetChangedFiles: jest.SpiedFunction<typeof changedFiles.getChangedFiles>;
  let spyAnalyzedFiles: jest.SpiedFunction<typeof analyzedFiles.getAnalyzedFiles>;
  let spyQualityGate: jest.SpiedFunction<typeof qualityGate.getQualityGate>;
  let spyGetAnnotations: jest.SpiedFunction<typeof annotations.getAnnotations>;
  let spyCreateChangedFiles: jest.SpiedFunction<any>;
  let spyTqiLabel: jest.SpiedFunction<typeof tqiLabel.getTqiLabel>;

  // For multiproject run with project auto
  ticsCliMock.project = 'project';
  ticsConfigMock.baseUrl = 'http://base.url';

  beforeEach(() => {
    jest.spyOn(analyzedFiles, 'getAnalyzedFilesUrl').mockReturnValue('AnalyzedFiles?filter=Project(project)');
    jest.spyOn(qualityGate, 'getQualityGateUrl').mockResolvedValue('QualityGate?filter=Project(project)');

    spyGetChangedFiles = jest.spyOn(changedFiles, 'getChangedFiles');
    spyAnalyzedFiles = jest.spyOn(analyzedFiles, 'getAnalyzedFiles');
    spyQualityGate = jest.spyOn(qualityGate, 'getQualityGate');
    spyGetAnnotations = jest.spyOn(annotations, 'getAnnotations');
    spyCreateChangedFiles = jest.spyOn(changed_files, 'getChangedFiles');
    spyTqiLabel = jest.spyOn(tqiLabel, 'getTqiLabel');
  });

  it('should return on one passed quality gate with warnings', async () => {
    spyGetChangedFiles.mockResolvedValue({ files: [], path: '' });
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(passedQualityGate);
    spyGetAnnotations.mockResolvedValue([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
        }
      ]
    });
  });

  it('should return on failed quality gate on single url', async () => {
    spyGetChangedFiles.mockResolvedValue({ files: [], path: '' });
    spyAnalyzedFiles.mockResolvedValue(['file']);
    spyQualityGate.mockResolvedValueOnce(failedQualityGate);
    spyGetAnnotations.mockResolvedValueOnce([]);
    spyTqiLabel.mockResolvedValue([]);

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
          annotations: [],
          labelInfo: []
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
    spyTqiLabel.mockResolvedValue(labelInfo);

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
          annotations: annotationsMock,
          labelInfo: labelInfo
        }
      ]
    });
  });
});
