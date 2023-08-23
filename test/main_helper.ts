import { ExtendedAnnotation, QualityGate } from '../src/helper/interfaces';

interface changedFile {
  sha: string;
  filename: string;
  status: 'modified' | 'added' | 'removed' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string | undefined;
  previous_filename?: string | undefined;
}

export const singleAnalyzedFiles: string[] = ['test.js'];
export const singleChangedFiles: changedFile[] = [
  {
    sha: 'test',
    filename: 'test.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url',
    patch: '@@ -0,1 +0,1 @@',
    previous_filename: undefined
  }
];

export const doubleAnalyzedFiles: string[] = ['test.js', 'jest.js'];
export const doubleChangedFiles: changedFile[] = [
  {
    sha: 'test',
    filename: 'test.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url',
    patch: '@@ -0,1 +0,1 @@',
    previous_filename: undefined
  },
  {
    sha: 'jest',
    filename: 'jest.js',
    status: 'modified',
    additions: 1,
    deletions: 1,
    changes: 1,
    blob_url: 'url',
    raw_url: 'url',
    contents_url: 'url',
    patch: '@@ -0,1 +0,1 @@',
    previous_filename: undefined
  }
];

export const analysisFailedNoUrl = {
  completed: false,
  statusCode: 1,
  explorerUrl: undefined,
  errorList: ['Error'],
  warningList: []
};

export const analysisPassedNoUrl = {
  completed: true,
  statusCode: 0,
  explorerUrl: undefined,
  errorList: ['Error'],
  warningList: []
};

export const analysisPassedNoUrlWarning5057 = {
  completed: true,
  statusCode: 0,
  explorerUrl: undefined,
  errorList: ['Error'],
  warningList: ['[WARNING 5057] No url ...']
};

export const analysisPassed = {
  completed: true,
  statusCode: 0,
  explorerUrl: 'explorerUrl',
  errorList: ['Error'],
  warningList: []
};

export const analysisPassedNoUrlWarning = {
  completed: true,
  statusCode: 0,
  explorerUrl: undefined,
  errorList: ['Error'],
  warningList: ['[WARNING 5057] No files have been analyzed.']
};

export const singleFileQualityGateFailed: QualityGate = {
  passed: false,
  message: 'Project failed 2 out of 2 quality gates',
  url: 'api',
  gates: [
    {
      passed: false,
      name: 'JavaScript',
      conditions: [
        {
          passed: false,
          error: false,
          message: 'message',
          details: {
            itemTypes: ['file'],
            dataKeys: {
              actualValue: {
                title: 'Coding Standard Violations',
                order: 1,
                itemType: 'file'
              }
            },
            itemCount: 1,
            itemLimit: 100,
            items: [
              {
                itemType: 'file',
                name: 'test.js',
                link: 'link',
                data: {
                  actualValue: {
                    formattedValue: '+4',
                    value: 4.0,
                    classes: ['delta-worse']
                  }
                }
              }
            ]
          },
          annotationsApiV1Links: [
            {
              url: 'api'
            }
          ]
        }
      ]
    }
  ],
  annotationsApiV1Links: [
    {
      url: 'api'
    }
  ]
};

export const singleFileQualityGatePassed: QualityGate = {
  passed: true,
  message: 'Project passed 2 out of 2 quality gates',
  url: 'api',
  gates: [
    {
      passed: true,
      name: 'JavaScript',
      conditions: [
        {
          passed: true,
          error: false,
          message: 'message',
          details: {
            itemTypes: ['file'],
            dataKeys: {
              actualValue: {
                title: 'Coding Standard Violations',
                order: 1,
                itemType: 'file'
              }
            },
            itemCount: 1,
            itemLimit: 100,
            items: [
              {
                itemType: 'file',
                name: 'test.js',
                link: 'link',
                data: {
                  actualValue: {
                    formattedValue: '+4',
                    value: 4.0,
                    classes: ['delta-worse']
                  }
                }
              }
            ]
          },
          annotationsApiV1Links: [
            {
              url: 'api'
            }
          ]
        }
      ]
    }
  ],
  annotationsApiV1Links: [
    {
      url: 'api'
    }
  ]
};

export const doubleFileQualityGatePassed: QualityGate = {
  passed: true,
  message: 'Project passed 2 out of 2 quality gates',
  url: 'api',
  gates: [
    {
      passed: true,
      name: 'JavaScript',
      conditions: [
        {
          passed: true,
          error: false,
          message: 'message',
          details: {
            itemTypes: ['file'],
            dataKeys: {
              actualValue: {
                title: 'Coding Standard Violations',
                order: 1,
                itemType: 'file'
              }
            },
            itemCount: 1,
            itemLimit: 100,
            items: [
              {
                itemType: 'file',
                name: 'test.js',
                link: 'link',
                data: {
                  actualValue: {
                    formattedValue: '+4',
                    value: 4.0,
                    classes: ['delta-worse']
                  }
                }
              },
              {
                itemType: 'file',
                name: 'jest.js',
                link: 'link',
                data: {
                  actualValue: {
                    formattedValue: '+4',
                    value: 4.0,
                    classes: ['delta-worse']
                  }
                }
              }
            ]
          },
          annotationsApiV1Links: [
            {
              url: 'api'
            }
          ]
        }
      ]
    }
  ],
  annotationsApiV1Links: [
    {
      url: 'api'
    }
  ]
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

export const singleExpectedPostable = {
  postable: [
    {
      path: 'test.js',
      line: 0,
      body: ':warning: **TICS: test violation: test**\r\nLine: 0, Rule: test, Level: 1, Category: test\r\n'
    }
  ],
  unpostable: []
};
