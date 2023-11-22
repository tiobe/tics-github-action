import { existsSync } from 'fs';
import { githubConfig, ticsConfig } from '../../src/configuration';
import { Events } from '../../src/helper/enums';
import { logger } from '../../src/helper/logger';

import * as main from '../../src/main';
import * as pulls from '../../src/github/pulls';
import * as analyzer from '../../src/tics/analyzer';
import * as fetcher from '../../src/tics/fetcher';
import * as review from '../../src/github/review';
import * as annotations from '../../src/github/annotations';
import * as comments from '../../src/github/comments';
import * as artifacts from '../../src/github/artifacts';
import * as api_helper from '../../src/tics/api_helper';

import {
  analysisFailedNoUrl,
  analysisPassed,
  analysisPassedNoUrl,
  analysisPassedNoUrlWarning5057,
  analysisResultsDoubleFilePassed,
  analysisResultsPassedNoUrl,
  analysisResultsSingleFileFailed,
  analysisResultsSingleFilePassed,
  doubleChangedFiles,
  singleAnnotations,
  singleChangedFiles,
  singlePreviousReviewComments
} from './main_helper';

afterEach(() => {
  jest.clearAllMocks();
  delete main.failedMessage;
});

describe('pre checks', () => {
  test('Should throw error if viewer version is too low', async () => {
    jest.spyOn(fetcher, 'getViewerVersion').mockResolvedValue({ version: '2022.0.0' });

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version 2022.0.0.'));
  });

  test('Should throw error if event is not pull request and', async () => {
    jest.spyOn(fetcher, 'getViewerVersion').mockResolvedValue({ version: '2022.4.0' });
    jest.spyOn(main, 'configure').mockImplementation();

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(
      expect.stringContaining('If the the action is run outside a pull request it should be run with a filelist.')
    );
  });

  test('Should throw error if ".git" does not exist', async () => {
    githubConfig.eventName = 'pull_request';

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(
      expect.stringContaining('No checkout found to analyze. Please perform a checkout before running the TICS Action.')
    );
  });

  test('Should throw error if retryCodes are incorrect', async () => {
    (existsSync as any).mockReturnValueOnce(true);

    ticsConfig.retryCodes = [NaN];

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Given retry codes could not be parsed. Please check if the input is correct.'));
  });
});

describe('SetFailed checks', () => {
  test('Should call info if no files are found', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce([]);

    ticsConfig.retryCodes = [500];

    const spyInfo = jest.spyOn(logger, 'info');

    await main.main();

    expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('No changed files found to analyze.'));
  });

  test('Should call setFailed if no Explorer URL and analysis failed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisFailedNoUrl);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('Failed to run TICS Github Action.'));
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call setFailed if no Explorer URL and analysis passed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrl);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

    const spySetFailed = jest.spyOn(logger, 'setFailed');
    const spyError = jest.spyOn(logger, 'error');

    await main.main();

    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('Failed to run TICS Github Action.'));
    expect(spyError).toHaveBeenCalledWith(expect.stringContaining('Explorer URL not returned from TICS analysis.'));
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call setFailed if analysis passed and quality gate undefined', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsPassedNoUrl);
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spySetFailed).toHaveBeenCalledWith('Some quality gates could not be retrieved.');
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call setFailed if analysis passed and quality gate failed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFileFailed);
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spySetFailed).toHaveBeenCalledWith('Project failed 2 out of 2 quality gates');
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should not call setFailed if analysis passed and quality gate passed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spySetFailed).toHaveBeenCalledTimes(0);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });
});

describe('postNothingAnalyzed', () => {
  test('Should call postNothingAnalyzedReview when Explorer URL given and analysis failed with warning 5057', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrlWarning5057);

    const spyReview = jest.spyOn(review, 'postNothingAnalyzedReview').mockImplementationOnce(() => Promise.resolve());

    ticsConfig.pullRequestApproval = true;
    await main.main();

    expect(spyReview).toHaveBeenCalledWith('No changed files applicable for TICS analysis quality gating.');
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call postNothingAnalyzedReview when Explorer URL given and analysis failed with warning 5057', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrlWarning5057);

    const spyReview = jest.spyOn(comments, 'postNothingAnalyzedComment').mockImplementationOnce(() => Promise.resolve());

    ticsConfig.pullRequestApproval = false;
    await main.main();

    expect(spyReview).toHaveBeenCalledWith('No changed files applicable for TICS analysis quality gating.');
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });
});

describe('PostReview checks', () => {
  test('Should call postReview with one file analyzed, qualitygate failed and no annotations', async () => {
    ticsConfig.pullRequestApproval = true;
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFileFailed);
    jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await main.main();

    expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.REQUEST_CHANGES);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call postReview with one file analyzed, qualitygate passed and no annotations', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
    jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await main.main();

    expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call postReview when postAnnotations is true with no annotations and no previously posted review comments', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce([]);
    jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);
    jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

    ticsConfig.postAnnotations = true;
    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await main.main();

    expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should call postReview when postAnnotations is true with one annotation and no previously posted review comment', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsDoubleFilePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
    jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);
    jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

    ticsConfig.postAnnotations = true;
    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await main.main();

    expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });
});

describe('Artifact upload tests', () => {
  test('Should not call uploadArtifacts when tmpDir or isDebug are not set', async () => {
    const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
    const spySummary = jest.spyOn(api_helper, 'cliSummary');
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

    await main.main();

    expect(spyArtifact).toHaveBeenCalledTimes(0);
    expect(spySummary).toHaveBeenCalledTimes(1);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });

  test('Should not call uploadArtifacts when tmpDir is set but no analysis has been done', async () => {
    const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
    const spySummary = jest.spyOn(api_helper, 'cliSummary');
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce([]);

    await main.main();

    expect(spyArtifact).toHaveBeenCalledTimes(0);
    expect(spySummary).toHaveBeenCalledTimes(0);
  });

  test('Should call uploadArtifacts when action is run with debug', async () => {
    const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
    const spySummary = jest.spyOn(api_helper, 'cliSummary');
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

    githubConfig.debugger = true;

    await main.main();

    expect(spyArtifact).toHaveBeenCalledTimes(1);
    expect(spySummary).toHaveBeenCalledTimes(1);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);

    githubConfig.debugger = false;
  });

  test('Should call uploadArtifacts when tmpDir is set', async () => {
    const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
    const spySummary = jest.spyOn(api_helper, 'cliSummary');
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

    ticsConfig.tmpDir = '/tmp';

    await main.main();

    expect(spyArtifact).toHaveBeenCalledTimes(1);
    expect(spySummary).toHaveBeenCalledTimes(1);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });
});

describe('DeletePreviousReviewComments check', () => {
  test('Should call deletePreviousReviewComments when postAnnotations is true with one annotation and one previously posted review comment', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalysisResults').mockResolvedValueOnce(analysisResultsDoubleFilePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
    jest.spyOn(annotations, 'getPostedReviewComments').mockImplementationOnce((): any => singlePreviousReviewComments);
    jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

    ticsConfig.postAnnotations = true;
    const spyDelete = jest.spyOn(annotations, 'deletePreviousReviewComments').mockImplementationOnce(() => Promise.resolve());

    await main.main();

    expect(spyDelete).toHaveBeenCalledWith(singlePreviousReviewComments);
    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
  });
});

describe('Diagnostic mode checks', () => {
  test('Diagnostic mode succeeds', async () => {
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

    ticsConfig.mode = 'diagnostic';
    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
    expect(spySetFailed).toHaveBeenCalledTimes(0);
  });

  test('Diagnostic mode fails', async () => {
    const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisFailedNoUrl);

    ticsConfig.mode = 'diagnostic';
    const spySetFailed = jest.spyOn(logger, 'setFailed');

    await main.main();

    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
    expect(spySetFailed).toHaveBeenCalledTimes(1);
  });
});
