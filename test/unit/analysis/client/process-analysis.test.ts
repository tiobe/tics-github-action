import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as analysisResults from '../../../../src/analysis/client/analysis-results';
import * as comments from '../../../../src/github/comments';
import * as decorate from '../../../../src/action/decorate/action';
import * as pullRequest from '../../../../src/action/decorate/pull-request';
import * as output from '../../../../src/github/output';

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
  let spyGetPostedComments: Mock<any>;
  let spyDeletePreviousComments: Mock<typeof comments.deletePreviousComments>;
  let spyPostToConversation: Mock<typeof pullRequest.postToConversation>;

  beforeEach(() => {
    spyGetPostedComments = vi.spyOn(comments, 'getPostedComments');
    spyDeletePreviousComments = vi.spyOn(comments, 'deletePreviousComments');
    spyPostToConversation = vi.spyOn(pullRequest, 'postToConversation');
  });

  afterEach(() => {
    vi.resetAllMocks();
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

//TODO: this should be done
describe('processCompleteAnalysis', () => {
  let decorateSpy: Mock<typeof decorate.decorateAction>;
  let createAndSetOutputSpy: Mock<typeof output.createAndSetOutput>;
  let getClientAnalysisResultsSpy: Mock<typeof analysisResults.getClientAnalysisResults>;

  beforeEach(() => {
    decorateSpy = vi.spyOn(decorate, 'decorateAction').mockResolvedValue();
    createAndSetOutputSpy = vi.spyOn(output, 'createAndSetOutput').mockReturnValue();
    getClientAnalysisResultsSpy = vi.spyOn(analysisResults, 'getClientAnalysisResults');

    vi.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
  });

  it('should return failed message if there are missing quality gates', async () => {
    getClientAnalysisResultsSpy.mockResolvedValueOnce(analysisNoQualityGates);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('Project failed qualitygate');
    expect(decorateSpy).toHaveBeenCalledWith(analysisNoQualityGates, analysisPassedNoUrl);
    expect(createAndSetOutputSpy).toHaveBeenCalledWith(analysisNoQualityGates.projectResults);
  });

  it('should return failed message if there is a single quality gates failing with no Explorer Url', async () => {
    getClientAnalysisResultsSpy.mockResolvedValueOnce(analysisResultsSingleQgFailed);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('Project failed qualitygate');
    expect(decorateSpy).toHaveBeenCalledWith(analysisResultsSingleQgFailed, analysisPassedNoUrl);
    expect(createAndSetOutputSpy).toHaveBeenCalledWith(analysisResultsSingleQgFailed.projectResults);
  });

  it('should return failed message if there a single quality gates failing with Explorer Urls', async () => {
    getClientAnalysisResultsSpy.mockResolvedValueOnce(analysisResultsSingleQgFailed);

    const message = await processCompleteAnalysis(analysisWithUrl, []);

    expect(message).toBe('Project failed qualitygate');
    expect(decorateSpy).toHaveBeenCalledWith(analysisResultsSingleQgFailed, analysisWithUrl);
    expect(createAndSetOutputSpy).toHaveBeenCalledWith(analysisResultsSingleQgFailed.projectResults);
  });

  it('should return failed message if there are two quality gates failing with Explorer Urls', async () => {
    getClientAnalysisResultsSpy.mockResolvedValueOnce(analysisResultsDualQgFailed);

    const message = await processCompleteAnalysis(analysisWithDoubleUrl, []);

    expect(message).toBe('Project failed qualitygate');
    expect(decorateSpy).toHaveBeenCalledWith(analysisResultsDualQgFailed, analysisWithDoubleUrl);
    expect(createAndSetOutputSpy).toHaveBeenCalledWith(analysisResultsDualQgFailed.projectResults);
  });

  it('should return no message if analysis passed and quality gate passed', async () => {
    getClientAnalysisResultsSpy.mockResolvedValueOnce(analysisResultsSingleFilePassed);

    const message = await processCompleteAnalysis(analysisPassedNoUrl, []);

    expect(message).toBe('');
    expect(decorateSpy).toHaveBeenCalledWith(analysisResultsSingleFilePassed, analysisPassedNoUrl);
    expect(createAndSetOutputSpy).toHaveBeenCalledWith(analysisResultsSingleFilePassed.projectResults);
  });
});
