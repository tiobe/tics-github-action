import { ChangedFile } from '../../../../src/github/interfaces';

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

export const analysisNoUrl = {
  completed: false,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisWithUrl = {
  completed: true,
  statusCode: 0,
  explorerUrls: ['url'],
  errorList: [],
  warningList: ['Warning']
};
