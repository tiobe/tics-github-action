import { ChangedFile } from '../../src/github/interfaces';
import { ExtendedAnnotation } from '../../src/helper/interfaces';

export const singleChangedFiles: ChangedFile[] = [
  {
    filename: 'test.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    sha: '',
    blob_url: '',
    raw_url: '',
    contents_url: ''
  }
];

export const doubleChangedFiles: ChangedFile[] = [
  {
    filename: 'test.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    sha: '',
    blob_url: '',
    raw_url: '',
    contents_url: ''
  },
  {
    filename: 'jest.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    sha: '',
    blob_url: '',
    raw_url: '',
    contents_url: ''
  }
];

export const analysisPassedNoUrlWarning5057 = {
  completed: true,
  statusCode: 0,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: ['[WARNING 5057] No url ...']
};

export const analysisPassed = {
  completed: true,
  statusCode: 0,
  explorerUrls: ['explorerUrl'],
  errorList: ['Error'],
  warningList: []
};

export const analysisPassedNoUrlWarning = {
  completed: true,
  statusCode: 0,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: ['[WARNING 5057] No files have been analyzed.']
};

export const singleAnnotations: ExtendedAnnotation[] = [
  {
    fullPath: 'c:/src/test.js',
    line: 0,
    level: 1,
    category: 'test',
    type: 'test',
    rule: 'test',
    msg: 'test',
    count: 1,
    supp: false,
    instanceName: 'CS'
  }
];

export const singlePreviousReviewComments = [
  {
    id: 1
  }
];
