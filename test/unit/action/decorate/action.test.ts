import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as summary from '../../../../src/action/decorate/summary';
import * as pullRequest from '../../../../src/action/decorate/pull-request';
import * as annotations from '../../../../src/github/annotations';

import { decorateAction } from '../../../../src/action/decorate/action';
import { actionConfigMock, githubConfigMock } from '../../../.setup/mock';
import { analysisPassed, analysisResultsSoaked } from './objects/summary';
import { GithubEvent } from '../../../../src/configuration/github-event';

describe('decorateAction', () => {
  let spyCreateSummaryBody: jest.SpiedFunction<typeof summary.createSummaryBody>;
  let spyCreateErrorSummaryBody: jest.SpiedFunction<typeof summary.createErrorSummaryBody>;
  let spyDecoratePullRequest: jest.SpiedFunction<typeof pullRequest.decoratePullRequest>;
  let spyPostAnnotations: jest.SpiedFunction<typeof annotations.postAnnotations>;

  beforeEach(() => {
    spyCreateSummaryBody = jest.spyOn(summary, 'createSummaryBody').mockReturnValue('body');
    spyCreateErrorSummaryBody = jest.spyOn(summary, 'createErrorSummaryBody').mockReturnValue('body');
    spyDecoratePullRequest = jest.spyOn(pullRequest, 'decoratePullRequest').mockImplementation((): any => {});
    spyPostAnnotations = jest.spyOn(annotations, 'postAnnotations').mockImplementation((): any => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should call createSummaryBody if analysisResult is present', async () => {
    githubConfigMock.event = GithubEvent.PUSH;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyCreateErrorSummaryBody).not.toHaveBeenCalled();
  });

  it('should call createErrorSummaryBody if analysisResult is not present', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
    actionConfigMock.postAnnotations = false;

    await decorateAction(undefined, analysisPassed);

    expect(spyCreateSummaryBody).not.toHaveBeenCalled();
    expect(spyCreateErrorSummaryBody).toHaveBeenCalledWith([], ['Warning']);
  });

  it('should not call decoratePullRequest and postAnnotations if the event is push and no post annotations', async () => {
    githubConfigMock.event = GithubEvent.PUSH;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).not.toHaveBeenCalled();
    expect(spyPostAnnotations).not.toHaveBeenCalled();
  });

  it('should not call decoratePullRequest and postAnnotations if the event is workflow_call and no post annotations', async () => {
    githubConfigMock.event = GithubEvent.WORKFLOW_CALL;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).not.toHaveBeenCalled();
    expect(spyPostAnnotations).not.toHaveBeenCalled();
  });

  it('should call decoratePullRequest and postAnnotations if the event is pull request and post annotations', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST_TARGET;
    actionConfigMock.postAnnotations = true;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).toHaveBeenCalledWith(analysisResultsSoaked.passed, 'body');
    expect(spyPostAnnotations).toHaveBeenCalledWith(analysisResultsSoaked.projectResults);
  });
});
