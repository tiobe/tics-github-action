import { AnalysisResult } from '../../../../../src/helper/interfaces';

export const analysisFailed = {
  completed: false,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisPassed = {
  completed: true,
  statusCode: 0,
  explorerUrls: [],
  errorList: [],
  warningList: ['Warning']
};

export const analysisResultsSoaked: AnalysisResult = {
  passed: false,
  message: 'Project failed qualitygate',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: false,
        passedWithWarning: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: false,
            passedWithWarning: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: false,
                passedWithWarning: false,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file', 'function'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018-03-23',
                      order: 2,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+39',
                          value: 39.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '+3',
                          value: 3.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+30',
                          value: 30.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+24',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'function',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBoxs.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+25',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsSoakedMetricGroup: AnalysisResult = {
  passed: false,
  message: 'Project failed qualitygate',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: false,
        passedWithWarning: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: false,
            passedWithWarning: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: false,
                passedWithWarning: false,
                metricGroup: 'Coding Standard',
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file', 'function'],
                  dataKeys: {
                    absValue: {
                      title: 'Total',
                      order: 1,
                      itemType: 'file'
                    },
                    actualValue: {
                      title: 'Blocking now',
                      order: 2,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018-03-23',
                      order: 3,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        absValue: {
                          formattedValue: '40',
                          value: 40.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        actualValue: {
                          formattedValue: '+39',
                          value: 39.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '+3',
                          value: 3.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        absValue: {
                          formattedValue: '40',
                          value: 40.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        actualValue: {
                          formattedValue: '+30',
                          value: 30.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        absValue: {
                          formattedValue: '40',
                          value: 40.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        actualValue: {
                          formattedValue: '+24',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'function',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBoxs.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        absValue: {
                          formattedValue: '40',
                          value: 40.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        actualValue: {
                          formattedValue: '+25',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: [],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsNotSoaked: AnalysisResult = {
  passed: false,
  message: 'Project failed qualitygate',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: false,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+39',
                          value: 39.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+30',
                          value: 30.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+24',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsNotSoakedMetricGroup: AnalysisResult = {
  passed: false,
  message: 'Project failed qualitygate',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: false,
                error: false,
                metricGroup: 'Coding Standards',
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+39',
                          value: 39.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+30',
                          value: 30.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+24',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              },
              {
                passed: true,
                error: false,
                metricGroup: 'Compiler Warnings',
                message:
                  'No new Compiler Warning Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+39',
                          value: 39.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+30',
                          value: 30.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+24',
                          value: 24.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,views,AboutBox.cpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsPartlySoakedFailed: AnalysisResult = {
  passed: false,
  message: 'Project failed qualitygate',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: false,
        passedWithWarning: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: false,
            passedWithWarning: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: true,
                passedWithWarning: true,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018-03-23',
                      order: 2,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '+3',
                          value: 3.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              },
              {
                passed: false,
                passedWithWarning: false,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+1',
                          value: 1.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsNoSoakedPassed: AnalysisResult = {
  passed: true,
  message: '',
  passedWithWarning: false,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: true,
        passedWithWarning: false,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: true,
            passedWithWarning: false,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: true,
                passedWithWarning: false,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018-03-23',
                      order: 2,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '+3',
                          value: 3.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              },
              {
                passed: true,
                passedWithWarning: false,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+1',
                          value: 1.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};

export const analysisResultsPartlySoakedPassed: AnalysisResult = {
  passed: true,
  message: '',
  passedWithWarning: true,
  projectResults: [
    {
      project: 'Project',
      explorerUrl: '',
      analyzedFiles: [
        'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
        'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
        'PADAnalysis/ApplicationNative/src/views/AboutBox.cpp'
      ],
      qualityGate: {
        passed: true,
        passedWithWarning: true,
        message: 'Project failed to pass quality gate',
        url: 'api/public/v1/QualityGateStatusDetails?axes\u003dDate(1516070506),Project(20065)',
        gates: [
          {
            passed: true,
            passedWithWarning: true,
            name: 'Gate for #32163',
            conditions: [
              {
                passed: true,
                passedWithWarning: true,
                error: false,
                message:
                  'No new Coding Standard Violations for levels 1, 2, 3 with respect to first analysis; failed for 145 files. There will be blocking issues in 138 files after the grace period ends.',
                details: {
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018-03-23',
                      order: 2,
                      itemType: 'file'
                    }
                  },
                  itemCount: 146,
                  itemLimit: 100,
                  items: [
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/Host/include/ITsmControl.hpp',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '0',
                          value: 0.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        },
                        blockingAfter: {
                          formattedValue: '+3',
                          value: 3.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,Host,include,ITsmControl.hpp)),Blocking(deferred)\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    },
                    {
                      itemType: 'file',
                      name: 'PADAnalysis/ApplicationNative/src/controllers/IPerfusionController.h',
                      link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))',
                      data: {
                        actualValue: {
                          formattedValue: '+1',
                          value: 1.0,
                          classes: ['delta-worse'],
                          link: 'AnnotatedSource.html#axes\u003dSuppressions(no),Date(1516070506),Project(20065),Level(Set(1,2,3)),DeltaDate(Run(0)),DiffType(new),File(Path(HIE,20065,main,PADAnalysis,ApplicationNative,src,controllers,IPerfusionController.h)),Blocking(Set(yes,no))\u0026diff\u003dtrue\u0026metrics\u003dG(Diff(CS,DiffType(new)),Level(Set(1,2,3)))'
                        }
                      }
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      },
      annotations: []
    }
  ]
};
