import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as processResults from '../../../src/analysis/client/process-analysis';
import * as changedFiles from '../../../src/analysis/helper/changed-files';
import * as analyzer from '../../../src/tics/analyzer';

import { ticsConfigMock } from '../../.setup/mock';
import { analysisNoUrl, analysisWithUrl, singleChangedFiles } from './objects/client';
import { clientAnalysis } from '../../../src/analysis/client';
import { Mode } from '../../../src/configuration/tics';
import { logger } from '../../../src/helper/logger';

describe('setFailed checks (TICS Client)', () => {
  let spyInfo: Mock<typeof logger.info>;

  let spyChangedFiles: Mock<typeof changedFiles.getChangedFiles>;
  let spyAnalyzer: Mock<typeof analyzer.runTicsAnalyzer>;
  let spyIncomplete: Mock<typeof processResults.processIncompleteAnalysis>;
  let spyComplete: Mock<typeof processResults.processCompleteAnalysis>;

  beforeEach(() => {
    ticsConfigMock.mode = Mode.CLIENT;
    spyInfo = vi.spyOn(logger, 'info');

    spyChangedFiles = vi.spyOn(changedFiles, 'getChangedFiles');
    spyAnalyzer = vi.spyOn(analyzer, 'runTicsAnalyzer');
    spyIncomplete = vi.spyOn(processResults, 'processIncompleteAnalysis');
    spyComplete = vi.spyOn(processResults, 'processCompleteAnalysis');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return passing verdict if no files have been changed', async () => {
    spyChangedFiles.mockResolvedValueOnce({ files: [], path: '' });

    const verdict = await clientAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: []
    });
    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('No changed files found to analyze.'));
  });

  it('should return failing verdict if there is no Explorer URL and processIncomplete returns a failed message', async () => {
    spyChangedFiles.mockResolvedValueOnce({ files: singleChangedFiles, path: 'location/changedFiles.txt' });
    spyAnalyzer.mockResolvedValue(analysisNoUrl);
    spyIncomplete.mockResolvedValueOnce('Failed to complete TICS analysis.');

    const verdict = await clientAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICS analysis.',
      errorList: ['Error'],
      warningList: []
    });
  });

  it('should return passing verdict if there is no Explorer URL and processIncomplete returns no message', async () => {
    spyChangedFiles.mockResolvedValueOnce({ files: singleChangedFiles, path: 'location/changedFiles.txt' });
    spyAnalyzer.mockResolvedValue(analysisNoUrl);
    spyIncomplete.mockResolvedValueOnce('');

    const verdict = await clientAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: ['Error'],
      warningList: []
    });
  });

  it('should return failing verdict if there is an Explorer URL and processComplete returns a failed message', async () => {
    spyChangedFiles.mockResolvedValueOnce({ files: singleChangedFiles, path: 'location/changedFiles.txt' });
    spyAnalyzer.mockResolvedValue(analysisWithUrl);
    spyComplete.mockResolvedValueOnce('Failed to complete TICS analysis.');

    const verdict = await clientAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICS analysis.',
      errorList: [],
      warningList: ['Warning']
    });
  });

  it('should return passing verdict if there is an Explorer URL and processComplete returns no message', async () => {
    spyChangedFiles.mockResolvedValueOnce({ files: singleChangedFiles, path: 'location/changedFiles.txt' });
    spyAnalyzer.mockResolvedValue(analysisWithUrl);
    spyComplete.mockResolvedValueOnce('');

    const verdict = await clientAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['Warning']
    });
  });
});
