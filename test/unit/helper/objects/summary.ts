import { AnalysisResults } from '../../../../src/helper/interfaces';

export const analysisResultsSoaked: AnalysisResults = {
  passed: false,
  message: 'Failed',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
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
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018‑03‑23',
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
                    }
                  ]
                }
              }
            ]
          }
        ],
        annotationsApiV1Links: []
      }
    }
  ]
};

export const analysisResultsNotSoaked: AnalysisResults = {
  passed: false,
  message: 'Failed',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
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
      }
    }
  ]
};

export const analysisResultsPartlySoaked: AnalysisResults = {
  passed: false,
  message: 'Failed',
  missesQualityGate: false,
  projectResults: [
    {
      project: '',
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
                  itemTypes: ['file'],
                  dataKeys: {
                    actualValue: {
                      title: 'Blocking now',
                      order: 1,
                      itemType: 'file'
                    },
                    blockingAfter: {
                      title: 'Blocking after 2018‑03‑23',
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
      }
    }
  ]
};
