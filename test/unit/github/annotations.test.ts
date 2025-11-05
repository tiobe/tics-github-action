import { describe, expect, it, jest } from '@jest/globals';
import { deletePreviousReviewComments, getPostedReviewComments, postAnnotations } from '../../../src/github/annotations';
import {
  emptyComment,
  fiveMixedAnalysisResults,
  fourMixedAnalysisResults,
  twohundredAnnotations,
  twoMixedAnalysisResults,
  warningComment
} from './objects/annotations';
import { logger } from '../../../src/helper/logger';
import { octokit } from '../../../src/github/octokit';
import { actionConfigMock, githubConfigMock } from '../../.setup/mock';
import { EOL } from 'os';
import { SpiedFunction } from 'jest-mock';

describe('getPostedReviewComments', () => {
  it('should throw error when a pullRequestNumber is not present', async () => {
    githubConfigMock.pullRequestNumber = undefined;

    let error: any;
    try {
      await getPostedReviewComments();
    } catch (err) {
      error = err;
    }
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe('This function can only be run on a pull request.');
  });

  it('should return single file on getPostedReviewComments', async () => {
    githubConfigMock.pullRequestNumber = 1;
    (octokit.paginate as any).mockReturnValueOnce([{ id: 1 }]);

    const response = await getPostedReviewComments();

    expect(response).toEqual([{ id: 1 }]);
  });

  it('should be called with specific parameters on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce();
    const spy = jest.spyOn(octokit, 'paginate');

    await getPostedReviewComments();

    expect(spy).toHaveBeenCalledWith(octokit.rest.pulls.listReviewComments, { repo: 'test', owner: 'tester', pull_number: 1 });
  });

  it('should return three files on getPostedReviewComments', async () => {
    (octokit.paginate as any).mockReturnValueOnce([{}, {}, {}]);

    const response = await getPostedReviewComments();

    expect(response as any[]).toHaveLength(3);
  });

  it('should post a notice when getPostedReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.paginate as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await getPostedReviewComments();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('deletePreviousReviewComments', () => {
  it('should call deleteReviewComment once on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, emptyComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should call deleteReviewComment twice on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([warningComment, warningComment]);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should not call deleteReviewComment on deletePreviousReviewComments', async () => {
    const spy = jest.spyOn(octokit.rest.pulls, 'deleteReviewComment');

    await deletePreviousReviewComments([emptyComment, emptyComment]);

    expect(spy).toHaveBeenCalledTimes(0);
  });

  it('should post a notice when deletePreviousReviewComments fails', async () => {
    const spy = jest.spyOn(logger, 'notice');

    (octokit.rest.pulls.deleteReviewComment as any).mockImplementationOnce(() => {
      throw new Error();
    });
    await deletePreviousReviewComments([warningComment]);

    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('postAnnotations', () => {
  let createCheckSpy: jest.SpiedFunction<typeof octokit.rest.checks.create>;
  let updateCheckSpy: jest.SpiedFunction<typeof octokit.rest.checks.update>;
  let warningSpy: jest.SpiedFunction<typeof logger.warning>;
  let infoSpy: jest.SpiedFunction<typeof logger.info>;

  beforeEach(() => {
    createCheckSpy = jest.spyOn(octokit.rest.checks, 'create');
    updateCheckSpy = jest.spyOn(octokit.rest.checks, 'update');
    warningSpy = jest.spyOn(logger, 'warning');
    infoSpy = jest.spyOn(logger, 'info');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return if no head_sha is present', async () => {
    const headSha = githubConfigMock.headSha;
    githubConfigMock.headSha = '';

    await postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(warningSpy).toHaveBeenCalledWith('Commit of underlying commit not found, cannot post annotations');
    githubConfigMock.headSha = headSha;
  });

  it('should return if no annotations are present', async () => {
    const test = structuredClone(twoMixedAnalysisResults.projectResults);
    test[0].annotations = [];
    await postAnnotations(test);

    expect(infoSpy).toHaveBeenCalledWith('No annotations to post.');
  });

  it('should post two annotations when showBlockingAfter is true', async () => {
    actionConfigMock.showBlockingAfter = true;

    await postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(createCheckSpy).toHaveBeenCalledWith({
      conclusion: 'success',
      head_sha: 'head-sha-256',
      name: 'TICS annotations',
      output: {
        annotations: [
          {
            annotation_level: 'warning',
            end_line: 0,
            message: `Blocking${EOL}Line: 0`,
            path: 'path0.js',
            start_line: 0,
            title: 'message 0'
          },
          {
            annotation_level: 'notice',
            end_line: 1,
            message: `Blocking after: 1970-01-21${EOL}Level: 2, Category: category 1${EOL}Line: 1, Rule: rule 1`,
            path: 'path1.js',
            start_line: 1,
            title: 'message 1'
          }
        ],
        summary: '',
        title: 'TICS annotations'
      },
      owner: 'tester',
      repo: 'test',
      status: undefined
    });
    expect(updateCheckSpy).toHaveBeenCalledTimes(0);
  });

  it('should post four annotations when showBlockingAfter is true', async () => {
    actionConfigMock.showBlockingAfter = true;

    await postAnnotations(fourMixedAnalysisResults.projectResults);

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(createCheckSpy).toHaveBeenCalledWith({
      conclusion: 'success',
      head_sha: 'head-sha-256',
      name: 'TICS annotations',
      output: {
        annotations: [
          {
            annotation_level: 'warning',
            end_line: 0,
            message: `Blocking${EOL}Line: 0`,
            path: 'path0.js',
            start_line: 0,
            title: 'message 0'
          },
          {
            annotation_level: 'notice',
            end_line: 1,
            message: `Blocking after: 1970-01-21${EOL}Level: 2, Category: category 1${EOL}Line: 1, Rule: rule 1`,
            path: 'path1.js',
            start_line: 1,
            title: 'message 1'
          },
          {
            annotation_level: 'warning',
            end_line: 2,
            message: `Blocking${EOL}Level: 2, Category: category 2${EOL}Line: 2, Rule: rule 2`,
            path: 'path2.js',
            start_line: 2,
            title: 'message 2'
          },
          {
            annotation_level: 'notice',
            end_line: 3,
            message: `Blocking after${EOL}Level: 2, Category: category 3${EOL}Line: 3, Rule: rule 3${EOL}synopsis 3${EOL}Rule-help: https://ruleset/rule+3`,
            path: 'path3.js',
            start_line: 3,
            title: 'message 3'
          }
        ],
        summary: '',
        title: 'TICS annotations'
      },
      owner: 'tester',
      repo: 'test',
      status: undefined
    });
    expect(updateCheckSpy).toHaveBeenCalledTimes(0);
  });

  it('should post only a blocking annotation when showBlockingAfter is false', async () => {
    actionConfigMock.showBlockingAfter = false;

    await postAnnotations(twoMixedAnalysisResults.projectResults);

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(createCheckSpy).toHaveBeenCalledWith({
      conclusion: 'success',
      head_sha: 'head-sha-256',
      name: 'TICS annotations',
      output: {
        annotations: [
          {
            annotation_level: 'warning',
            end_line: 0,
            message: `Blocking${EOL}Line: 0`,
            path: 'path0.js',
            start_line: 0,
            title: 'message 0'
          }
        ],
        summary: '',
        title: 'TICS annotations'
      },
      owner: 'tester',
      repo: 'test',
      status: undefined
    });

    expect(updateCheckSpy).toHaveBeenCalledTimes(0);
  });

  it('should post only two annotations when showBlockingAfter and includeNonBlockingAnnotations are false', async () => {
    actionConfigMock.showBlockingAfter = false;
    actionConfigMock.includeNonBlockingAnnotations = false;

    await postAnnotations(fiveMixedAnalysisResults.projectResults);

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(createCheckSpy).toHaveBeenCalledWith({
      conclusion: 'success',
      head_sha: 'head-sha-256',
      name: 'TICS annotations',
      output: {
        annotations: [
          {
            annotation_level: 'warning',
            end_line: 0,
            message: `Blocking${EOL}Line: 0`,
            path: 'path0.js',
            start_line: 0,
            title: 'message 0'
          },
          {
            annotation_level: 'warning',
            end_line: 2,
            message: `Blocking${EOL}Level: 2, Category: category 2${EOL}Line: 2, Rule: rule 2`,
            path: 'path2.js',
            start_line: 2,
            title: 'message 2'
          }
        ],
        summary: '',
        title: 'TICS annotations'
      },
      owner: 'tester',
      repo: 'test',
      status: undefined
    });

    expect(updateCheckSpy).toHaveBeenCalledTimes(0);
  });

  it('should post three annotations when showBlockingAfter is false and includeNonBlockingAnnotations is true', async () => {
    actionConfigMock.showBlockingAfter = false;
    actionConfigMock.includeNonBlockingAnnotations = true;

    await postAnnotations(fiveMixedAnalysisResults.projectResults);

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(createCheckSpy).toHaveBeenCalledWith({
      conclusion: 'success',
      head_sha: 'head-sha-256',
      name: 'TICS annotations',
      output: {
        annotations: [
          {
            annotation_level: 'warning',
            end_line: 0,
            message: `Blocking${EOL}Line: 0`,
            path: 'path0.js',
            start_line: 0,
            title: 'message 0'
          },
          {
            annotation_level: 'warning',
            end_line: 2,
            message: `Blocking${EOL}Level: 2, Category: category 2${EOL}Line: 2, Rule: rule 2`,
            path: 'path2.js',
            start_line: 2,
            title: 'message 2'
          },
          {
            annotation_level: 'notice',
            end_line: 2,
            message: `Non-Blocking${EOL}Level: 2, Category: category 2${EOL}Line: 2, Rule: rule 2`,
            path: 'path2.js',
            start_line: 2,
            title: 'message 2'
          }
        ],
        summary: '',
        title: 'TICS annotations'
      },
      owner: 'tester',
      repo: 'test',
      status: undefined
    });

    expect(updateCheckSpy).toHaveBeenCalledTimes(0);
  });

  it('should post 200 annotations if all are postable', async () => {
    (createCheckSpy as SpiedFunction<any>).mockResolvedValue({ data: { id: 1234 } });

    await postAnnotations(twohundredAnnotations());

    expect(createCheckSpy).toHaveBeenCalledTimes(1);
    expect(updateCheckSpy).toHaveBeenCalledTimes(3);
    expect(updateCheckSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        check_run_id: 1234,
        conclusion: 'success',
        output: expect.objectContaining({
          annotations: expect.arrayContaining(new Array(50).fill(expect.any(Object)))
        })
      })
    );
  });
});
