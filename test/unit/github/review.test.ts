import { githubConfig, octokit, ticsConfig } from '../../../src/configuration';
import { postNothingAnalyzedReview, postReview } from '../../../src/github/review';
import { createSummaryBody } from '../../../src/helper/summary';
import { Events } from '../../../src/helper/enums';
import { logger } from '../../../src/helper/logger';
import { AnalysisResults } from '../../../src/helper/interfaces';

jest.mock('../../../src/helper/summary', () => {
  return {
    createSummaryBody: jest.fn()
  };
});

describe('postReview', () => {
  test('Should call createReview once', async () => {
    (createSummaryBody as any).mockReturnValueOnce('ReviewBody...');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysisResults: AnalysisResults = {
      passed: true,
      failureMessage: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: true,
            message: 'message',
            url: 'url',
            gates: [],
            annotationsApiV1Links: []
          }
        }
      ],
      passedWithWarning: false
    };

    let body = createSummaryBody(analysisResults);
    let event = analysisResults.passed ? Events.APPROVE : Events.REQUEST_CHANGES;
    await postReview(body, event);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should call createReview with values passed and no comments', async () => {
    (createSummaryBody as any).mockReturnValueOnce('ReviewBody...');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysisResults: AnalysisResults = {
      passed: true,
      failureMessage: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: true,
            message: 'message',
            url: 'url',
            gates: [],
            annotationsApiV1Links: []
          }
        }
      ],
      passedWithWarning: false
    };

    let body = createSummaryBody(analysisResults);
    let event = analysisResults.passed ? Events.APPROVE : Events.REQUEST_CHANGES;
    await postReview(body, event);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.APPROVE,
      body: 'ReviewBody...',
      comments: undefined
    };
    expect(spy).toHaveBeenCalledWith(calledWith);
  });

  test('Should call createReview with values failed', async () => {
    (createSummaryBody as any).mockReturnValueOnce('ReviewBody...');

    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    const analysisResults: AnalysisResults = {
      passed: false,
      failureMessage: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: false,
            message: 'message',
            url: 'url',
            gates: [],
            annotationsApiV1Links: []
          },
          reviewComments: {
            postable: [],
            unpostable: []
          }
        }
      ],
      passedWithWarning: false
    };

    let body = createSummaryBody(analysisResults);
    let event = analysisResults.passed ? Events.APPROVE : Events.REQUEST_CHANGES;
    await postReview(body, event);

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.REQUEST_CHANGES,
      body: 'ReviewBody...'
    };
    expect(spy).toHaveBeenCalledWith(calledWith);
  });

  test('Should post a notice on createReview', async () => {
    (createSummaryBody as any).mockReturnValueOnce('ReviewBody...');

    jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(logger, 'notice');

    const analysisResults: AnalysisResults = {
      passed: false,
      failureMessage: '',
      missesQualityGate: false,
      projectResults: [
        {
          project: '',
          explorerUrl: 'url',
          analyzedFiles: [],
          qualityGate: {
            passed: false,
            message: 'message',
            url: 'url',
            gates: [],
            annotationsApiV1Links: []
          }
        }
      ],
      passedWithWarning: false
    };

    let body = createSummaryBody(analysisResults);
    let event = analysisResults.passed ? Events.APPROVE : Events.REQUEST_CHANGES;
    await postReview(body, event);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postNothingAnalyzedReview', () => {
  test('Should call createReview once', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    await postNothingAnalyzedReview('message');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('Should call createReview with value passed', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'createReview');

    ticsConfig.pullRequestApproval = true;

    await postNothingAnalyzedReview('message');

    const calledWith = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber,
      event: Events.APPROVE,
      body: '<h1>TICS Quality Gate</h1>\n\n### :heavy_check_mark: Passed \n\nmessage'
    };
    expect(spy).toHaveBeenCalledWith(calledWith);
  });

  test('Should post a notice on createReview', async () => {
    jest.spyOn(octokit.rest.pulls, 'createReview').mockImplementationOnce(() => {
      throw new Error();
    });
    const spy = jest.spyOn(logger, 'notice');

    await postNothingAnalyzedReview('message');

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
