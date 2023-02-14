import { githubConfig, octokit, ticsConfig } from '../../../src/configuration';
import { postNothingAnalyzedReview, postReview } from '../../../src/github/posting/review';
import { createFilesSummary, createLinkSummary, createUnpostableReviewCommentsSummary, createQualityGateSummary } from '../../../src/helper/summary';
import { Events } from '../../../src/helper/enums';
import Logger from '../../../src/helper/logger';

jest.mock('../../../src/helper/summary', () => {
  return {
    createQualityGateSummary: jest.fn(),
    createLinkSummary: jest.fn(),
    createUnpostableReviewCommentsSummary: jest.fn(),
    createFilesSummary: jest.fn()
  };
});

describe('postReview', () => {
  test('Should call createReview once', async () => {
    (createQualityGateSummary as any).mockReturnValueOnce('GateSummary...\n');
    (createLinkSummary as any).mockReturnValueOnce('LinkSummary...\n');
    (createFilesSummary as any).mockReturnValueOnce('FilesSummary...\n');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysis = {
      completed: true,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0,
      explorerUrl: 'url'
    };
    const qualityGate = {
      passed: true,
      message: 'message',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    };
    await postReview(analysis, [''], qualityGate, undefined);
    expect(spy).toBeCalledTimes(1);
  });

  test('Should call createReview with values passed and no comments', async () => {
    (createQualityGateSummary as any).mockReturnValueOnce('GateSummary...\n');
    (createLinkSummary as any).mockReturnValueOnce('LinkSummary...\n');
    (createFilesSummary as any).mockReturnValueOnce('FilesSummary...\n');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysis = {
      completed: true,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0,
      explorerUrl: 'url'
    };
    const qualityGate = {
      passed: true,
      message: 'message',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    };
    await postReview(analysis, [''], qualityGate, undefined);
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.APPROVE,
      body: 'GateSummary...\nLinkSummary...\nFilesSummary...\n',
      comments: undefined
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should call createReview with values failed', async () => {
    (createQualityGateSummary as any).mockReturnValueOnce('GateSummary...\n');
    (createLinkSummary as any).mockReturnValueOnce('LinkSummary...\n');
    (createUnpostableReviewCommentsSummary as any).mockReturnValueOnce('UnpostableSummary...\n');
    (createFilesSummary as any).mockReturnValueOnce('FilesSummary...\n');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysis = {
      completed: true,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0,
      explorerUrl: 'url'
    };
    const qualityGate = {
      passed: false,
      message: 'message',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    };
    const reviewComments = {
      postable: [],
      unpostable: [{}]
    };
    await postReview(analysis, [''], qualityGate, reviewComments);
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.REQUEST_CHANGES,
      body: 'GateSummary...\nLinkSummary...\nUnpostableSummary...\nFilesSummary...\n',
      comments: []
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should call createReview with type COMMENT if pullRequestApproval is set to false', async () => {
    (createQualityGateSummary as any).mockReturnValueOnce('GateSummary...\n');
    (createLinkSummary as any).mockReturnValueOnce('LinkSummary...\n');
    (createUnpostableReviewCommentsSummary as any).mockReturnValueOnce('UnpostableSummary...\n');
    (createFilesSummary as any).mockReturnValueOnce('FilesSummary...\n');

    ticsConfig.pullRequestApproval = false;

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysis = {
      completed: true,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0,
      explorerUrl: 'url'
    };
    const qualityGate = {
      passed: false,
      message: 'message',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    };
    const reviewComments = {
      postable: [],
      unpostable: [{}]
    };
    await postReview(analysis, [''], qualityGate, reviewComments);
    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.COMMENT,
      body: 'GateSummary...\nLinkSummary...\nUnpostableSummary...\nFilesSummary...\n',
      comments: []
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should throw an error on createReview', async () => {
    (createQualityGateSummary as any).mockReturnValueOnce('GateSummary...\n');
    (createLinkSummary as any).mockReturnValueOnce('LinkSummary...\n');
    (createUnpostableReviewCommentsSummary as any).mockReturnValueOnce('UnpostableSummary...\n');
    (createFilesSummary as any).mockReturnValueOnce('FilesSummary...\n');

    jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(Logger.Instance, 'error');

    const analysis = {
      completed: false,
      errorList: ['error1'],
      warningList: [],
      statusCode: 0,
      explorerUrl: undefined
    };
    const qualityGate = {
      passed: true,
      message: 'message',
      url: 'url',
      gates: [],
      annotationsApiV1Links: []
    };
    await postReview(analysis, [''], qualityGate, undefined);

    expect(spy).toBeCalledTimes(1);
  });
});

describe('postNothingAnalyzedReview', () => {
  test('Should call createReview once', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    await postNothingAnalyzedReview('message', Events.APPROVE);
    expect(spy).toBeCalledTimes(1);
  });

  test('Should call createReview with value passed', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    await postNothingAnalyzedReview('message', Events.APPROVE);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.APPROVE,
      body: '## TiCS Analysis\n\n### :heavy_check_mark: Passed \n\nmessage'
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should call createReview with value failed', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    await postNothingAnalyzedReview('message', Events.REQUEST_CHANGES);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.REQUEST_CHANGES,
      body: '## TiCS Analysis\n\n### :x: Failed \n\nmessage'
    };
    expect(spy).toBeCalledWith(calledWith);
  });

  test('Should throw an error on createReview', async () => {
    jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(Logger.Instance, 'error');

    await postNothingAnalyzedReview('message', Events.APPROVE);

    expect(spy).toBeCalledTimes(1);
  });
});
