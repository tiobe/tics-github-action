import * as fs from 'fs';

import * as main from '../../src/main';
import * as version from '../../src/viewer/version';
import * as qserver from '../../src/analysis/qserver';
import { githubConfigMock, ticsConfigMock } from '../.setup/mock';

afterEach(() => {
  jest.clearAllMocks();
});

let existsSpy: jest.SpyInstance;

beforeEach(() => {
  existsSpy = jest.spyOn(fs, 'existsSync');
});

describe('meetsPrerequisites', () => {
  let viewerVersionSpy: jest.SpyInstance;

  beforeEach(() => {
    viewerVersionSpy = jest.spyOn(version, 'getViewerVersion');
  });

  test('Should throw error if viewer version is too low', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.0.0' });

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version 2022.0.0.'));
  });

  test('Should throw error if viewer version is too low with prefix character', async () => {
    viewerVersionSpy.mockResolvedValue({ version: 'r2022.0.0' });

    let error: any;
    try {
      await main.main();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toEqual(expect.stringContaining('Minimum required TICS Viewer version is 2022.4. Found version 2022.0.0.'));
  });

  test('Should not throw version error if viewer version sufficient with prefix character', async () => {
    viewerVersionSpy.mockResolvedValue({ version: 'r2022.4.0' });

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

  test('Should throw error on mode Client when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.4.0' });
    githubConfigMock.eventName = 'commit';
    ticsConfigMock.filelist = '';

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

  test('Should throw no error on mode QServer when it is not a pull request and no filelist is given', async () => {
    viewerVersionSpy.mockResolvedValue({ version: '2022.4.0' });
    existsSpy.mockReturnValue(true);
    jest.spyOn(qserver, 'qServerAnalysis').mockResolvedValue({
      passed: true,
      message: '',
      errorList: [],
      warningList: []
    });

    githubConfigMock.eventName = 'commit';
    ticsConfigMock.mode = 'qserver';
    ticsConfigMock.filelist = '';

    await main.main();
  });

  test('Should throw error if ".git" does not exist', async () => {
    existsSpy.mockReturnValue(false);

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
});

// describe('SetFailed checks (TICS Client)', () => {
//   beforeEach(() => {
//     ticsConfigMock.mode = Mode.CLIENT;
//   });

//   test('Should call info if no files are found', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce([]);

//     actionConfigMock.retryConfig.codes = [500];

//     const spyInfo = jest.spyOn(logger, 'info');

//     await main.main();

//     expect(spyInfo).toHaveBeenCalledWith(expect.stringContaining('No changed files found to analyze.'));
//   });

//   test('Should call setFailed if no Explorer URL and analysis failed', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisFailedNoUrl);
//     jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

//     const spySetFailed = jest.spyOn(logger, 'setFailed');

//     await main.main();

//     expect(spySetFailed).toHaveBeenCalledWith('Failed to run TICS Github Action.');
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

// test('Should call setFailed if no Explorer URL and analysis passed', async () => {
//   existsSpy.mockReturnValueOnce(true);
//   jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//   jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//   const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrl);
//   jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

//   const spySetFailed = jest.spyOn(logger, 'setFailed');

//   await main.main();

//   expect(spySetFailed).toHaveBeenCalledWith('Explorer URL not returned from TICS analysis.');
//   expect(spyAnalyzer).toHaveBeenCalledTimes(1);
// });

// test('Should call setFailed if analysis passed and quality gate undefined', async () => {
//   existsSpy.mockReturnValueOnce(true);
//   jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//   jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//   const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//   jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsPassedNoUrl);
//   jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

//   const spySetFailed = jest.spyOn(logger, 'setFailed');
//   await main.main();

//   expect(spySetFailed).toHaveBeenCalledWith('Some quality gates could not be retrieved.');
//   expect(spyAnalyzer).toHaveBeenCalledTimes(1);
// });

// test('Should call setFailed if analysis passed and quality gate failed', async () => {
//   existsSpy.mockReturnValueOnce(true);
//   jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//   jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//   const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//   jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFileFailed);
//   jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());
//   jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
//   jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValue([]);

//   const spySetFailed = jest.spyOn(logger, 'setFailed');

//   await main.main();

//   expect(spySetFailed).toHaveBeenCalledWith('Project failed 2 out of 2 quality gates');
//   expect(spyAnalyzer).toHaveBeenCalledTimes(1);
// });

// test('Should not call setFailed if analysis passed and quality gate passed', async () => {
//   existsSpy.mockReturnValueOnce(true);
//   jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//   jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//   const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//   jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
//   jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());
//   jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);
//   jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValue([]);

//   const spySetFailed = jest.spyOn(logger, 'setFailed');

//   await main.main();

//   expect(spySetFailed).toHaveBeenCalledTimes(0);
//   expect(spyAnalyzer).toHaveBeenCalledTimes(1);
// });
// });

// describe('postNothingAnalyzed (TICS Client)', () => {
//   beforeEach(() => {
//     ticsConfig.mode = Mode.CLIENT;
//   });

//   test('Should call postNothingAnalyzedReview when Explorer URL given and analysis failed with warning 5057', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrlWarning5057);

//     const spyReview = jest.spyOn(review, 'postNothingAnalyzedReview').mockImplementationOnce(() => Promise.resolve());

//     ticsConfig.pullRequestApproval = true;
//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith('No changed files applicable for TICS analysis quality gating.');
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

//   test('Should call postNothingAnalyzedReview when Explorer URL given and analysis failed with warning 5057', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassedNoUrlWarning5057);

//     const spyReview = jest.spyOn(comments, 'postNothingAnalyzedComment').mockImplementationOnce(() => Promise.resolve());

//     ticsConfig.pullRequestApproval = false;
//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith('No changed files applicable for TICS analysis quality gating.');
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });
// });

// describe('PostReview checks (TICS Client)', () => {
//   beforeEach(() => {
//     ticsConfig.mode = Mode.CLIENT;
//   });

//   test('Should call postReview with one file analyzed, qualitygate failed and no annotations', async () => {
//     ticsConfig.pullRequestApproval = true;
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//     jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFileFailed);
//     jest.spyOn(comments, 'getPostedComments').mockResolvedValue([]);

//     const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.REQUEST_CHANGES);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

//   test('Should call postReview with one file analyzed, qualitygate passed and no annotations', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//     jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
//     jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

//     const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

//   test('Should call postReview when postAnnotations is true with no annotations and no previously posted review comments', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//     jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsSingleFilePassed);
//     jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce([]);
//     jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);
//     jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

//     ticsConfig.postAnnotations = true;
//     const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

//   test('Should call postReview when postAnnotations is true with one annotation and no previously posted review comment', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//     jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsDoubleFilePassed);
//     jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
//     jest.spyOn(annotations, 'getPostedReviewComments').mockResolvedValueOnce([]);
//     jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

//     ticsConfig.postAnnotations = true;
//     const spyReview = jest.spyOn(review, 'postReview').mockImplementationOnce(() => Promise.resolve());

//     await main.main();

//     expect(spyReview).toHaveBeenCalledWith(expect.stringContaining('TICS Quality Gate'), Events.APPROVE);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });
// });

// describe('Artifact upload tests (TICS Client)', () => {
//   beforeEach(() => {
//     ticsConfig.mode = Mode.CLIENT;
//   });

//   test('Should not call uploadArtifacts when tmpDir or isDebug are not set', async () => {
//     const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
//     const spySummary = jest.spyOn(api_helper, 'cliSummary');
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

//     await main.main();

//     expect(spyArtifact).toHaveBeenCalledTimes(0);
//     expect(spySummary).toHaveBeenCalledTimes(1);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });

//   test('Should not call uploadArtifacts when tmpDir is set but no analysis has been done', async () => {
//     const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
//     const spySummary = jest.spyOn(api_helper, 'cliSummary');
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce([]);

//     await main.main();

//     expect(spyArtifact).toHaveBeenCalledTimes(0);
//     expect(spySummary).toHaveBeenCalledTimes(0);
//   });

//   test('Should call uploadArtifacts when action is run with debug', async () => {
//     const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
//     const spySummary = jest.spyOn(api_helper, 'cliSummary');
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

//     githubConfig.debugger = true;

//     await main.main();

//     expect(spyArtifact).toHaveBeenCalledTimes(1);
//     expect(spySummary).toHaveBeenCalledTimes(1);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);

//     githubConfig.debugger = false;
//   });

//   test('Should call uploadArtifacts when tmpDir is set', async () => {
//     const spyArtifact = jest.spyOn(artifacts, 'uploadArtifact').mockImplementationOnce(() => Promise.resolve());
//     const spySummary = jest.spyOn(api_helper, 'cliSummary');
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(singleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);

//     ticsConfig.tmpdir = '/tmp';

//     await main.main();

//     expect(spyArtifact).toHaveBeenCalledTimes(1);
//     expect(spySummary).toHaveBeenCalledTimes(1);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });
// });

// describe('DeletePreviousReviewComments check (TICS Client)', () => {
//   beforeEach(() => {
//     ticsConfig.mode = Mode.CLIENT;
//   });

//   test('Should call deletePreviousReviewComments when postAnnotations is true with one annotation and one previously posted review comment', async () => {
//     existsSpy.mockReturnValueOnce(true);
//     jest.spyOn(pulls, 'getChangedFilesOfPullRequest').mockResolvedValueOnce(doubleChangedFiles);
//     jest.spyOn(pulls, 'changedFilesToFile').mockReturnValueOnce('location/changedFiles.txt');
//     const spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer').mockResolvedValueOnce(analysisPassed);
//     jest.spyOn(fetcher, 'getClientAnalysisResults').mockResolvedValueOnce(analysisResultsDoubleFilePassed);
//     jest.spyOn(fetcher, 'getAnnotations').mockResolvedValueOnce(singleAnnotations);
//     jest.spyOn(annotations, 'getPostedReviewComments').mockImplementationOnce((): any => singlePreviousReviewComments);
//     jest.spyOn(comments, 'getPostedComments').mockImplementationOnce(() => Promise.resolve([]));

//     ticsConfig.postAnnotations = true;
//     const spyDelete = jest.spyOn(annotations, 'deletePreviousReviewComments').mockImplementationOnce(() => Promise.resolve());

//     await main.main();

//     expect(spyDelete).toHaveBeenCalledWith(singlePreviousReviewComments);
//     expect(spyAnalyzer).toHaveBeenCalledTimes(1);
//   });
// });

//
