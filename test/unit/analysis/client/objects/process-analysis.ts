import { AnalysisResult, QualityGate } from '../../../../../src/helper/interfaces';

export const analysisIncompleteFailedNoUrl = {
  completed: false,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisCompleteFailedNoUrl = {
  completed: true,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisCompleteFailedWithWarning5057 = {
  completed: true,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: ['[WARNING 5057] No files to analyze']
};

export const analysisPassedNoUrl = {
  completed: true,
  statusCode: 0,
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

export const analysisWithDoubleUrl = {
  completed: true,
  statusCode: 0,
  explorerUrls: ['url', 'url'],
  errorList: [],
  warningList: ['Warning']
};

export const analysisNoQualityGates: AnalysisResult = {
  passed: false,
  missesQualityGate: true,
  projectResults: [],
  passedWithWarning: false
};

const singleQualityGateFailed: QualityGate = {
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
                    classes: ['delta-worse'],
                    link: ''
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

const singleFileQualityGatePassed: QualityGate = {
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
                    classes: ['delta-worse'],
                    link: ''
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

const doubleFileQualityGatePassed: QualityGate = {
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
                    classes: ['delta-worse'],
                    link: ''
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
                    classes: ['delta-worse'],
                    link: ''
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

export const analysisResultsSingleQgFailed: AnalysisResult = {
  passed: false,
  missesQualityGate: false,
  projectResults: [
    {
      analyzedFiles: ['test.js'],
      explorerUrl: 'url',
      project: 'project',
      qualityGate: singleQualityGateFailed
    }
  ],
  passedWithWarning: false
};

export const analysisResultsDualQgFailed: AnalysisResult = {
  passed: false,
  missesQualityGate: false,
  projectResults: [
    {
      analyzedFiles: ['test.js'],
      explorerUrl: 'url',
      project: 'project',
      qualityGate: singleQualityGateFailed
    },
    {
      analyzedFiles: ['test.js'],
      explorerUrl: 'url',
      project: 'project',
      qualityGate: singleQualityGateFailed
    }
  ],
  passedWithWarning: false
};

export const analysisResultsSingleFilePassed: AnalysisResult = {
  passed: true,
  missesQualityGate: false,
  projectResults: [
    {
      analyzedFiles: ['test.js'],
      explorerUrl: 'url',
      project: 'project',
      qualityGate: singleFileQualityGatePassed
    }
  ],
  passedWithWarning: false
};

export const analysisResultsDoubleFilePassed: AnalysisResult = {
  passed: true,
  missesQualityGate: false,
  projectResults: [
    {
      analyzedFiles: ['test.js', 'jest.js'],
      explorerUrl: 'url',
      project: 'project',
      qualityGate: doubleFileQualityGatePassed
    }
  ],
  passedWithWarning: false
};
