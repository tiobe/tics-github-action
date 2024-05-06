import * as processResults from '../../../src/analysis/client/process-analysis';
import * as changedFiles from '../../../src/analysis/helper/changed-files';
import * as analyzer from '../../../src/tics/analyzer';

import { ticsConfigMock } from '../../.setup/mock';
import { analysisNoUrl, analysisWithUrl, singleChangedFiles } from './objects/client';
import { clientAnalysis } from '../../../src/analysis/client';
import { Mode } from '../../../src/configuration/tics';
import { logger } from '../../../src/helper/logger';

describe('SetFailed checks (TICS Client)', () => {
  let spyInfo: jest.SpyInstance;

  let spyChangedFiles: jest.SpyInstance;
  let spyAnalyzer: jest.SpyInstance;
  let spyIncomplete: jest.SpyInstance;
  let spyComplete: jest.SpyInstance;

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

  test('Should return passing verdict if no files have been changed', async () => {
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

  test('Should return failing verdict if there is no Explorer URL and processIncomplete returns a failed message', async () => {
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

  test('Should return passing verdict if there is no Explorer URL and processIncomplete returns no message', async () => {
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

  test('Should return failing verdict if there is an Explorer URL and processComplete returns a failed message', async () => {
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

  test('Should return passing verdict if there is an Explorer URL and processComplete returns no message', async () => {
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
