import { ChangedFile, ChangedFileResData, GraphQlResponse } from '../../../../src/github/interfaces';

export const singleFileResponse: GraphQlResponse<ChangedFileResData> = {
  repository: {
    pullRequest: {
      files: {
        totalCount: 22,
        pageInfo: {
          endCursor: 'MjI',
          hasNextPage: false
        },
        nodes: [
          {
            path: 'test.js',
            changeType: 'MODIFIED',
            additions: 3,
            deletions: 1
          }
        ]
      }
    }
  }
};

export const renamedChangedFileResponse: GraphQlResponse<ChangedFileResData> = {
  repository: {
    pullRequest: {
      files: {
        totalCount: 22,
        pageInfo: {
          endCursor: 'MjI',
          hasNextPage: false
        },
        nodes: [
          {
            path: 'test.js',
            changeType: 'MODIFIED',
            additions: 3,
            deletions: 1
          },
          {
            path: 'jest.js',
            changeType: 'RENAMED',
            additions: 3,
            deletions: 1
          }
        ]
      }
    }
  }
};

export const renamedUnchangedFileResponse: GraphQlResponse<ChangedFileResData> = {
  repository: {
    pullRequest: {
      files: {
        totalCount: 22,
        pageInfo: {
          endCursor: 'MjI',
          hasNextPage: false
        },
        nodes: [
          {
            path: 'test.js',
            changeType: 'MODIFIED',
            additions: 3,
            deletions: 1
          },
          {
            path: 'jest.js',
            changeType: 'RENAMED',
            additions: 0,
            deletions: 0
          }
        ]
      }
    }
  }
};

export const fourFilesChangedResponse: GraphQlResponse<ChangedFileResData> = {
  repository: {
    pullRequest: {
      files: {
        totalCount: 22,
        pageInfo: {
          endCursor: 'MjI',
          hasNextPage: false
        },
        nodes: [
          {
            path: 'test.js',
            changeType: 'ADDED',
            additions: 3,
            deletions: 0
          },
          {
            path: 'jest.js',
            changeType: 'CHANGED',
            additions: 3,
            deletions: 1
          },
          {
            path: 'gest.js',
            changeType: 'DELETED',
            additions: 0,
            deletions: 5
          },
          {
            path: 'vest.js',
            changeType: 'COPIED',
            additions: 10,
            deletions: 5
          }
        ]
      }
    }
  }
};

export const changedFile: ChangedFile = {
  sha: '',
  filename: 'test.js',
  status: 'renamed',
  additions: 0,
  deletions: 0,
  changes: 1,
  blob_url: '',
  raw_url: '',
  contents_url: ''
};
