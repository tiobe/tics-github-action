import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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
import { GithubEvent } from '../../../../src/configuration/github-event';

describe('processIncompleteAnalysis', () => {
  let spyGetPostedComments: jest.SpiedFunction<any>;
  let spyDeletePreviousComments: jest.SpiedFunction<typeof comments.deletePreviousComments>;
  let spyPostToConversation: jest.SpiedFunction<typeof pullRequest.postToConversation>;

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
      githubConfigMock.event = GithubEvent.PUSH;
    });

    it('should return failed message if incomplete analysis failed without url', async () => {
      const message = await processIncompleteAnalysis(analysisIncompleteFailedNoUrl);

      expect(message).toBe('Failed to complete TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });

    it('should not return failed message if complete analysis failed without url but with warning 5057', async () => {
      const message = await processIncompleteAnalysis(analysisCompleteFailedWithWarning5057);

      expect(message).toBe('');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });

    it('should return failed message if complete analysis failed without url', async () => {
      const message = await processIncompleteAnalysis(analysisCompleteFailedNoUrl);

      expect(message).toBe('Explorer URL not returned from TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(0);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(0);
      expect(spyPostToConversation).toHaveBeenCalledTimes(0);
    });
  });

  describe('pull request', () => {
    beforeEach(() => {
      githubConfigMock.event = GithubEvent.PULL_REQUEST;
    });

    it('should return failed message if incomplete analysis failed without url', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisIncompleteFailedNoUrl);

      expect(message).toBe('Failed to complete TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });

    it('should not return failed message if complete analysis failed without url but with warning 5057', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisCompleteFailedWithWarning5057);

      expect(message).toBe('');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });

    it('should return failed message if complete analysis failed without url (no previous posted comments)', async () => {
      spyGetPostedComments.mockResolvedValue(['']);

      const message = await processIncompleteAnalysis(analysisCompleteFailedNoUrl);

      expect(message).toBe('Explorer URL not returned from TICS analysis.');
      expect(spyGetPostedComments).toHaveBeenCalledTimes(1);
      expect(spyDeletePreviousComments).toHaveBeenCalledTimes(1);
      expect(spyPostToConversation).toHaveBeenCalledTimes(1);
    });
  });
});

describe('processCompleteAnalysis', () => {
  it('should return failed message if there are missing quality gates', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisNoQualityGates);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockResolvedValueOnce(undefined);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('Some quality gates could not be retrieved.');
  });

  it('should return failed message if there is a single quality gates failing with no Explorer Url', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockResolvedValueOnce(undefined);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('Project failed quality gate(s)');
  });

  it('should return failed message if there a single quality gates failing with Explorer Urls', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockResolvedValueOnce(undefined);

    const message = await processCompleteAnalysis(analysisWithUrl, []);

    expect(message).toBe('Project failed quality gate(s)');
  });

  it('should return failed message if there are two quality gates failing with Explorer Urls', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsDualQgFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockResolvedValueOnce(undefined);

    const message = await processCompleteAnalysis(analysisWithDoubleUrl, []);

    expect(message).toBe('2 out of 2 projects failed quality gate(s)');
  });

  it('should return no message if analysis passed and quality gate passed', async () => {
    jest.spyOn(analysisResults, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
    jest.spyOn(decorate, 'decorateAction').mockResolvedValueOnce(undefined);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('');
  });
});
