import * as analysisResults from '../../../../src/analysis/client/analysis-results';
import * as comments from '../../../../src/github/comments';
import * as decorate from '../../../../src/action/decorate/action';
import * as pullRequest from '../../../../src/action/decorate/pull-request';

import { githubConfigMock } from '../../../.setup/mock';
import { processIncompleteAnalysis, processCompleteAnalysis } from '../../../../src/analysis/client/process-analysis';
import {
  analysisNoQualityGates,
  analysisResultsSingleQgFailed,
  analysisResultsSingleFilePassed,
  analysisResultsDualQgFailed,
  analysisIncompleteFailedNoUrl,
  analysisCompleteFailedNoUrl,
  analysisCompleteFailedWithWarning5057,
  analysisPassedNoUrl,
  analysisWithUrl,
  analysisWithDoubleUrl
} from './objects/process-analysis';

describe('processIncompleteAnalysis', () => {
  let spyGetPostedComments: jest.SpyInstance;
  let spyDeletePreviousComments: jest.SpyInstance;
  let spyPostToConversation: jest.SpyInstance;

  beforeEach(() => {
    spyGetPostedComments = jest.spyOn(comments, 'getPostedComments');
    spyDeletePreviousComments = jest.spyOn(comments, 'deletePreviousComments');
    spyPostToConversation = jest.spyOn(pullRequest, 'postToConversation');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('non pull request', () => {
    beforeEach(() => {
      githubConfigMock.eventName = 'commit';
    });

    test('Should return failed message if incomplete analysis failed without url', async () => {
      const message = await processIncompleteAnalysis(analysisIncompleteFailedNoUrl);

      expect(message).toEqual('Failed to complete TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });

    test('Should not return failed message if complete analysis failed without url but with warning 5057', async () => {
      const message = await processIncompleteAnalysis(analysisCompleteFailedWithWarning5057);

      expect(message).toEqual('');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });

    test('Should return failed message if complete analysis failed without url', async () => {
      const message = await processIncompleteAnalysis(analysisCompleteFailedNoUrl);

      expect(message).toEqual('Explorer URL not returned from TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });
  });

  describe('pull request', () => {
    beforeEach(() => {
      githubConfigMock.eventName = 'pull_request';
    });

    test('Should return failed message if incomplete analysis failed without url', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisIncompleteFailedNoUrl);

      expect(message).toEqual('Failed to complete TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });

    test('Should not return failed message if complete analysis failed without url but with warning 5057', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisCompleteFailedWithWarning5057);

      expect(message).toEqual('');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });

    test('Should return failed message if complete analysis failed without url (no previous posted comments)', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisCompleteFailedNoUrl);

      expect(message).toEqual('Explorer URL not returned from TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });
  });
});

describe('processCompleteAnalysis', () => {
  test('Should return failed message if there are missing quality gates', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisNoQualityGates);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockImplementationOnce(() => Promise.resolve());

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toEqual('Some quality gates could not be retrieved.');
  });

  test('Should return failed message if there is a single quality gates failing with no Explorer Url', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockImplementationOnce(() => Promise.resolve());

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toEqual('Project failed quality gate(s)');
  });

  test('Should return failed message if there a single quality gates failing with Explorer Urls', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockImplementationOnce(() => Promise.resolve());

    const message = await processCompleteAnalysis(analysisWithUrl, []);

    expect(message).toEqual('Project failed quality gate(s)');
  });

  test('Should return failed message if there are two quality gates failing with Explorer Urls', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsDualQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockImplementationOnce(() => Promise.resolve());

    const message = await processCompleteAnalysis(analysisWithDoubleUrl, []);

    expect(message).toEqual('2 out of 2 projects failed quality gate(s)');
  });

  test('Should return no message if analysis passed and quality gate passed', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockImplementationOnce(() => Promise.resolve());

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toEqual('');
  });
});
