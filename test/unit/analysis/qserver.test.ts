import * as analyzer from '../../../src/tics/analyzer';
import * as action from '../../../src/action/decorate/action';
import * as pull_request from '../../../src/action/decorate/pull-request';
import * as qserver from '../../../src/analysis/qserver/analysis-result';
import * as summary from '../../../src/action/decorate/summary';

import { githubConfigMock, ticsConfigMock } from '../../.setup/mock';
import { analysisFailed, analysisNotCompleted, analysisPassed, analysisResult, analysisWarning5057 } from './objects/qserver';
import { qServerAnalysis } from '../../../src/analysis/qserver';
import { Mode } from '../../../src/configuration/tics';

describe('SetFailed checks (QServer)', () => {
  let spyAnalyzer: jest.SpyInstance;
  let spyPostToConversation: jest.SpyInstance;
  let spyGetAnalysisResult: jest.SpyInstance;
  let spyDecorateAction: jest.SpyInstance;

  beforeEach(() => {
    ticsConfigMock.mode = Mode.QSERVER;

    spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer');
    spyPostToConversation = jest.spyOn(pull_request, 'postToConversation');
    spyGetAnalysisResult = jest.spyOn(qserver, 'getAnalysisResult');

    jest.spyOn(action, 'decorateAction');
    jest.spyOn(summary, 'createNothingAnalyzedSummaryBody').mockReturnValue('body');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should return failing verdict if the analysis has not been completed', async () => {
    spyAnalyzer.mockResolvedValue(analysisNotCompleted);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICSQServer analysis.',
      errorList: ['Error'],
      warningList: []
    });
  });

  test('Should return failing verdict if the analysis has failed', async () => {
    spyAnalyzer.mockResolvedValue(analysisFailed);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: false,
      message: 'Failed to complete TICSQServer analysis.',
      errorList: ['Error'],
      warningList: []
    });
  });

  test('Should return passing verdict if the analysis has been completed and no files have been analyzed [WARNING 5057]', async () => {
    spyAnalyzer.mockResolvedValue(analysisWarning5057);

    let verdict = await qServerAnalysis();
    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['[WARNING 5057]']
    });
    expect(spyPostToConversation).not.toHaveBeenCalled();

    githubConfigMock.eventName = 'pull_request';
    verdict = await qServerAnalysis();
    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['[WARNING 5057]']
    });
    expect(spyPostToConversation).toHaveBeenCalled();
  });

  test('Should return failing verdict if getAnalysisResult throws', async () => {
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

  test('Should return failing verdict if getAnalysisResult throws unknown object', async () => {
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

  test('Should return passing verdict if getAnalysisResult returns', async () => {
    spyAnalyzer.mockResolvedValue(analysisPassed);
    spyGetAnalysisResult.mockResolvedValue(analysisResult);

    const verdict = await qServerAnalysis();

    expect(verdict).toEqual({
      passed: true,
      message: '',
      errorList: [],
      warningList: ['Warning']
    });
  });
});
