import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as processResults from '../../../src/analysis/client/process-analysis';
import * as changedFiles from '../../../src/analysis/helper/changed-files';
import * as analyzer from '../../../src/tics/analyzer';

import { ticsConfigMock } from '../../.setup/mock';
import { analysisNoUrl, analysisWithUrl, singleChangedFiles } from './objects/client';
import { clientAnalysis } from '../../../src/analysis/client';
import { Mode } from '../../../src/configuration/tics';
import { logger } from '../../../src/helper/logger';

describe('setFailed checks (TICS Client)', () => {
  let spyInfo: jest.SpiedFunction<typeof logger.info>;

  let spyChangedFiles: jest.SpiedFunction<typeof changedFiles.getChangedFiles>;
  let spyAnalyzer: jest.SpiedFunction<typeof analyzer.runTicsAnalyzer>;
  let spyIncomplete: jest.SpiedFunction<typeof processResults.processIncompleteAnalysis>;
  let spyComplete: jest.SpiedFunction<typeof processResults.processCompleteAnalysis>;

  beforeEach(() => {
    ticsConfigMock.mode = Mode.CLIENT;
    spyInfo = jest.spyOn(logger, 'info');

    spyChangedFiles = jest.spyOn(changedFiles, 'getChangedFiles');
    spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer');
    spyIncomplete = jest.spyOn(processResults, 'processIncompleteAnalysis');
    spyComplete = jest.spyOn(processResults, 'processCompleteAnalysis');
  });

  afterEach(() => {
    jest.resetAllMocks();
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
