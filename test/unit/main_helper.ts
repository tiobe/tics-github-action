import { ChangedFile } from '../../src/github/interfaces';
import { ExtendedAnnotation } from '../../src/viewer/interfaces';

export const singleChangedFiles: ChangedFile[] = ['test.js'];
export const doubleChangedFiles: ChangedFile[] = ['test.js', 'jest.js'];

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
    instanceName: 'CS',
    postable: true,
    path: ''
  }
];

export const singlePreviousReviewComments = [
  {
    id: 1
  }
];
