import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as analyzer from '../../../src/tics/analyzer';
import * as action from '../../../src/action/decorate/action';
import * as pull_request from '../../../src/action/decorate/pull-request';
import * as qserver from '../../../src/analysis/qserver/analysis-result';
import * as summary from '../../../src/action/decorate/summary';
import * as viewer from '../../../src/viewer/qserver';

import { githubConfigMock, ticsConfigMock } from '../../.setup/mock';
import {
  analysisFailed,
  analysisNotCompleted,
  analysisPassed,
  analysisResultFailed,
  analysisResultPassed,
  analysisWarning5057
} from './objects/qserver';
import { qServerAnalysis } from '../../../src/analysis/qserver';
import { Mode } from '../../../src/configuration/tics';
import { GithubEvent } from '../../../src/configuration/github-event';

describe('setFailed checks (QServer)', () => {
  let spyAnalyzer: jest.SpiedFunction<typeof analyzer.runTicsAnalyzer>;
  let spyPostToConversation: jest.SpiedFunction<typeof pull_request.postToConversation>;
  let spyGetAnalysisResult: jest.SpiedFunction<typeof qserver.getAnalysisResult>;
  let spyGetLastQServerRunDate: jest.SpiedFunction<typeof viewer.getLastQServerRunDate>;

  beforeEach(() => {
    ticsConfigMock.mode = Mode.QSERVER;

    spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer');
    spyPostToConversation = jest.spyOn(pull_request, 'postToConversation');
    spyGetAnalysisResult = jest.spyOn(qserver, 'getAnalysisResult');
    spyGetLastQServerRunDate = jest.spyOn(viewer, 'getLastQServerRunDate');

    jest.spyOn(action, 'decorateAction');
    jest.spyOn(summary, 'createNothingAnalyzedSummaryBody').mockResolvedValue('body');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return failing verdict if the analysis has not been completed', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisNotCompleted);
    githubConfigMock.event = GithubEvent.PULL_REQUEST;

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICSQServer analysis.',
      errorList: ['Error'],
      warningList: []
    });
  });

  it('should return failing verdict if the analysis has failed', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisFailed);
    githubConfigMock.event = GithubEvent.PUSH;

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICSQServer analysis.',
      errorList: ['Error'],
      warningList: []
    });
  });

  it('should return failing verdict if the analysis date is not new', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyAnalyzer.mockResolvedValue(analysisPassed);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICSQServer analysis.',
      errorList: [],
      warningList: ['Warning']
    });
  });

  it('should return passing verdict if the analysis has been completed and no files have been analyzed [WARNING 5057]', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisWarning5057);

    let verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['[WARNING 5057]']
    });
    expect(spyPostToConversation).not.toHaveBeenCalled();

    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
    verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['[WARNING 5057]']
    });
    expect(spyPostToConversation).toHaveBeenCalled();
  });

  it('should return failing verdict if getAnalysisResult throws', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisPassed);
    spyGetAnalysisResult.mockRejectedValue(Error('error'));

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'error',
      errorList: [],
      warningList: ['Warning']
    });
  });

  it('should return failing verdict if getAnalysisResult throws unknown object', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisPassed);
    spyGetAnalysisResult.mockRejectedValue(new URL('http://localhost'));

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Something went wrong: reason unknown',
      errorList: [],
      warningList: ['Warning']
    });
  });

  it('should return failing verdict if getAnalysisResult returns failing Quality Gate', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisPassed);
    spyGetAnalysisResult.mockResolvedValue(analysisResultFailed);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Project failed quality gate',
      errorList: [],
      warningList: ['Warning']
    });
  });

  it('should return passing verdict if getAnalysisResult returns passing Quality Gate', async () => {
    spyGetLastQServerRunDate.mockResolvedValueOnce(123456000);
    spyGetLastQServerRunDate.mockResolvedValueOnce(123457000);
    spyAnalyzer.mockResolvedValue(analysisPassed);
    spyGetAnalysisResult.mockResolvedValue(analysisResultPassed);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['Warning']
    });
  });
});
