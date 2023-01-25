import { existsSync } from 'fs';

import { githubConfig, ticsConfig, configure } from '../src/configuration';
import { Events } from '../src/helper/enums';
import { run } from '../src/main';
import Logger from '../src/helper/logger';

import * as pulls from '../src/github/calling/pulls';
import * as analyzer from '../src/tics/analyzer';
import * as fetcher from '../src/tics/fetcher';
import * as review from '../src/github/posting/review';
import * as calling_annotations from '../src/github/calling/annotations';
import * as posting_annotations from '../src/github/posting/annotations';

import {
  analysisFailedNoUrl,
  analysisFailedUrl,
  analysisPassed,
  analysisPassedNoUrl,
  analysisPassedNoUrlWarning5057,
  doubleAnalyzedFiles,
  doubleChangedFiles,
  doubleFileQualityGatePassed,
  singleAnalyzedFiles,
  singleAnnotations,
  singleChangedFiles,
  singleExpectedPostable,
  singleFileQualityGateFailed,
  singleFileQualityGatePassed as singleFileQualityGatePassed,
  singlePreviousReviewComments
} from './main_helper';

describe('pre checks', () => {
  test('Should call exit if event is not pull request', async () => {
    (configure as any).mockImplementation();
    const spyExit = jest.spyOn(Logger.Instance, 'exit');

    await run();

    // for some reason the code is run before testing, so this exit is called twice
    expect(spyExit).toHaveBeenCalled();
    expect(spyExit).toHaveBeenCalledWith(expect.stringContaining('This action can only run on pull requests.'));
  });

  test('Should call exit if ".git" does not exist', async () => {
    githubConfig.eventName = 'pull_request';

    const spyExit = jest.spyOn(Logger.Instance, 'exit');

    await run();

    expect(spyExit).toHaveBeenCalled();
    expect(spyExit).toHaveBeenCalledWith(
      expect.stringContaining('No checkout found to analyze. Please perform a checkout before running the TiCS Action.')
    );
  });

  test('Should call exit if no files are found', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockRejectedValueOnce(new Error('Error'));

    const spySetFailed = jest.spyOn(Logger.Instance, 'exit');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('Error'));
  });
});

describe('SetFailed checks', () => {
  test('Should call setFailed if no files are found', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce([]);

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('No changed files found to analyze.'));
  });

  test('Should call setFailed if no Explorer URL and analysis failed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisFailedNoUrl);

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('Failed to run TiCS Github Action.'));
  });

  test('Should call setFailed if no Explorer URL and analysis passed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrl);

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');
    const spyError = jest.spyOn(Logger.Instance, 'error');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith(expect.stringContaining('Failed to run TiCS Github Action.'));
    expect(spyError).toHaveBeenCalledWith(expect.stringContaining('Explorer URL not returned from TiCS analysis.'));
  });

  test('Should call setFailed if analysis passed and quality gate undefined', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce([]);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce({});
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith(undefined);
  });

  test('Should call setFailed if analysis passed and quality gate failed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(singleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(singleFileQualityGateFailed);
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');

    await run();

    expect(spySetFailed).toHaveBeenCalled();
    expect(spySetFailed).toHaveBeenCalledWith('Project failed 2 out of 2 quality gates');
  });

  test('Should not call setFailed if analysis passed and quality gate passed', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(singleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(singleFileQualityGatePassed);
    jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    const spySetFailed = jest.spyOn(Logger.Instance, 'setFailed');

    await run();

    expect(spySetFailed).toHaveBeenCalledTimes(0);
  });
});

describe('postNothingAnalyzedReview', () => {
  test('Should call postNothingAnalyzedReview when Explorer URL given and analysis failed with warning 5057', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrlWarning5057);

    const spyReview = jest.spyOn(review, 'postNothingAnalyzedReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalled();
    expect(spyReview).toHaveBeenCalledWith('No changed files applicable for TiCS analysis quality gating.', Events.APPROVE);
  });
});

describe('PostReview checks', () => {
  test('Should call postReview with no files analyzed, no quality gate and no annotations', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce([]);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce({});

    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalledWith(analysisPassed, [], {}, undefined);
  });

  test('Should call postReview with one file analyzed, qualitygate failed and no annotations', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(singleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(singleFileQualityGateFailed);

    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalledWith(analysisPassed, singleAnalyzedFiles, singleFileQualityGateFailed, undefined);
  });

  test('Should call postReview with one file analyzed, qualitygate passed and no annotations', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(singleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(singleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(singleFileQualityGatePassed);

    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalledWith(analysisPassed, singleAnalyzedFiles, singleFileQualityGatePassed, undefined);
  });

  test('Should call postReview when postAnnotations is true with no annotations and no previously posted review comments', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(doubleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(doubleFileQualityGatePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce([]);
    jest.spyOn(calling_annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);

    ticsConfig.postAnnotations = true;
    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalledWith(analysisPassed, doubleAnalyzedFiles, doubleFileQualityGatePassed, undefined);
  });

  test('Should call postReview when postAnnotations is true with one annotation and no previously posted review comment', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(doubleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(doubleFileQualityGatePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
    jest.spyOn(calling_annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);

    ticsConfig.postAnnotations = true;
    const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyReview).toHaveBeenCalledWith(analysisPassed, doubleAnalyzedFiles, doubleFileQualityGatePassed, singleExpectedPostable);
  });
});

describe('DeletePreviousReviewComments check', () => {
  test('Should call deletePreviousReviewComments when postAnnotations is true with one annotation and one previously posted review comment', async () => {
    (existsSync as any).mockReturnValueOnce(true);
    jest.spyOn(pulls, 'getChangedFiles').mockResolvedValueOnce(doubleChangedFiles);
    jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
    jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
    jest.spyOn(fetcher, 'getAnalyzedFiles').mockResolvedValueOnce(doubleAnalyzedFiles);
    jest.spyOn(fetcher, 'getQualityGate').mockResolvedValueOnce(doubleFileQualityGatePassed);
    jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
    jest.spyOn(calling_annotations, 'getPostedReviewComments').mockImplementationOnce((): any => singlePreviousReviewComments);

    ticsConfig.postAnnotations = true;
    const spyDelete = jest.spyOn(posting_annotations, 'deletePreviousReviewComments').mockImplementationOnce(() => Promise.resolve());

    await run();

    expect(spyDelete).toHaveBeenCalledWith(singlePreviousReviewComments);
  });
});
