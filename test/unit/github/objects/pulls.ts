import { ChangedFile, ChangedFilesQueryResponse } from '../../../../src/github/interfaces';

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

export const singleFileResponse: ChangedFilesQueryResponse = {
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
            deletions: 1,
            viewerViewedState: 'UNVIEWED'
          }
        ]
      }
    }
  },
  rateLimit: {
    remaining: 1000
  }
};

export const renamedChangedFileResponse: ChangedFilesQueryResponse = {
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
            deletions: 1,
            viewerViewedState: 'UNVIEWED'
          },
          {
            path: 'jest.js',
            changeType: 'RENAMED',
            additions: 3,
            deletions: 1,
            viewerViewedState: 'UNVIEWED'
          }
        ]
      }
    }
  },
  rateLimit: {
    remaining: 1000
  }
};

export const renamedUnchangedFileResponse: ChangedFilesQueryResponse = {
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
            deletions: 1,
            viewerViewedState: 'UNVIEWED'
          },
          {
            path: 'jest.js',
            changeType: 'RENAMED',
            additions: 0,
            deletions: 0,
            viewerViewedState: 'UNVIEWED'
          }
        ]
      }
    }
  },
  rateLimit: {
    remaining: 1000
  }
};

export const fourFilesChangedResponse: ChangedFilesQueryResponse = {
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
            deletions: 0,
            viewerViewedState: 'UNVIEWED'
          },
          {
            path: 'jest.js',
            changeType: 'CHANGED',
            additions: 3,
            deletions: 1,
            viewerViewedState: 'UNVIEWED'
          },
          {
            path: 'gest.js',
            changeType: 'DELETED',
            additions: 0,
            deletions: 5,
            viewerViewedState: 'UNVIEWED'
          },
          {
            path: 'vest.js',
            changeType: 'COPIED',
            additions: 10,
            deletions: 5,
            viewerViewedState: 'UNVIEWED'
          }
        ]
      }
    }
  },
  rateLimit: {
    remaining: 1000
  }
};
