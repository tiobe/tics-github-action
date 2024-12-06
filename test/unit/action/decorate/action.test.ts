import * as summary from '../../../../src/action/decorate/summary';
import * as pullRequest from '../../../../src/action/decorate/pull-request';
import * as annotations from '../../../../src/github/annotations';

import { decorateAction } from '../../../../src/action/decorate/action';
import { actionConfigMock, githubConfigMock } from '../../../.setup/mock';
import { analysisPassed, analysisResultsSoaked } from './objects/summary';
import { GithubEvent } from '../../../../src/configuration/github-event';

describe('decorateAction', () => {
  let spyCreateSummaryBody: jest.SpyInstance;
  let spyCreateErrorSummaryBody: jest.SpyInstance;
  let spyDecoratePullRequest: jest.SpyInstance;
  let spyPostAnnotations: jest.SpyInstance;

  beforeEach(() => {
    spyCreateSummaryBody = jest.spyOn(summary, 'createSummaryBody').mockResolvedValue('body');
    spyCreateErrorSummaryBody = jest.spyOn(summary, 'createErrorSummaryBody').mockResolvedValue('body');
    spyDecoratePullRequest = jest.spyOn(pullRequest, 'decoratePullRequest').mockImplementation();
    spyPostAnnotations = jest.spyOn(annotations, 'postAnnotations').mockImplementation();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Should call createSummaryBody if analysisResult is present', async () => {
    githubConfigMock.event = GithubEvent.PUSH;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyCreateErrorSummaryBody).not.toHaveBeenCalled();
  });

  test('Should call createErrorSummaryBody if analysisResult is not present', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
    actionConfigMock.postAnnotations = false;

    await decorateAction(undefined, analysisPassed);

    expect(spyCreateSummaryBody).not.toHaveBeenCalled();
    expect(spyCreateErrorSummaryBody).toHaveBeenCalledWith([], ['Warning']);
  });

  test('Should not call decoratePullRequest and postAnnotations if the event is not pull request and no post annotations', async () => {
    githubConfigMock.event = GithubEvent.PUSH;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).not.toHaveBeenCalled();
    expect(spyPostAnnotations).not.toHaveBeenCalled();
  });

  test('Should not call decoratePullRequest and postAnnotations if the event is not pull request and no post annotations', async () => {
    githubConfigMock.event = GithubEvent.WORKFLOW_CALL;
    actionConfigMock.postAnnotations = false;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).not.toHaveBeenCalled();
    expect(spyPostAnnotations).not.toHaveBeenCalled();
  });

  test('Should call decoratePullRequest and postAnnotations if the event is pull request and post annotations', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST_TARGET;
    actionConfigMock.postAnnotations = true;

    await decorateAction(analysisResultsSoaked, analysisPassed);

    expect(spyCreateSummaryBody).toHaveBeenCalledWith(analysisResultsSoaked);
    expect(spyDecoratePullRequest).toHaveBeenCalledWith(analysisResultsSoaked.passed, 'body');
    expect(spyPostAnnotations).toHaveBeenCalledWith(analysisResultsSoaked.projectResults);
  });
});
