import { ChangedFile } from '../../../src/github/interfaces';

export const changedFiles: ChangedFile[] = [
  {
    sha: 'sha',
    filename: 'file.js',
    status: 'added',
    additions: 0,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url'
  },
  {
    sha: 'sha',
    filename: 'files.js',
    status: 'added',
    additions: 0,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url'
  }
];
