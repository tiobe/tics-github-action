import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { getTqiLabel } from '../../../src/viewer/tqi-label';
import * as measure from '../../../src/viewer/measure';
import { MeasureApiResponse } from '../../../src/viewer/interfaces';
import { afterEach } from 'node:test';

describe('getTqiLabel', () => {
  let getSpy: Mock<typeof measure.getMeasureApiData>;

  beforeEach(() => {
    getSpy = vi.spyOn(measure, 'getMeasureApiData');

    getSpy.mockImplementation(
      (
        metrics: string[],
        _project: string,
        opts?: { cdtoken?: string; deltaDate?: number; deltaPrevious?: boolean }
      ): Promise<MeasureApiResponse> => {
        if (metrics.includes('tqiVersion')) {
          if (opts?.cdtoken) {
            return Promise.resolve({
              data: [
                {
                  formattedValue: '4.17',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: {
                    major: 4,
                    minor: 17
                  }
                }
              ],
              dates: ['2026-06-19T17:42:09.000+02:00'],
              metrics: [
                {
                  expression: 'G(tqiVersion,ClientData(tester:OVNLwwwJWNF4fod7uMBq))',
                  fullName: 'TQI version for client data tester:OVNLwwwJWNF4fod7uMBq'
                }
              ],
              nodes: [
                {
                  name: 'main',
                  fullPath: 'HIE://two-projects-c-demo/main'
                }
              ]
            });
          }
          return Promise.resolve({
            data: [
              {
                formattedValue: '5.2',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: {
                  major: 5,
                  minor: 2
                }
              }
            ],
            dates: ['2026-06-19T17:42:09.000+02:00'],
            metrics: [
              {
                expression: 'G(tqiVersion,ClientData(tester:OVNLwwwJWNF4fod7uMBq))',
                fullName: 'TQI version for client data tester:OVNLwwwJWNF4fod7uMBq'
              }
            ],
            nodes: [
              {
                name: 'main',
                fullPath: 'HIE://two-projects-c-demo/main'
              }
            ]
          });
        }

        if (opts?.deltaPrevious) {
          if (opts?.cdtoken) {
            return Promise.resolve({
              data: [
                {
                  formattedValue: '<span class="delta-worse">-1.47%</span>',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: -1.47
                },
                {
                  formattedValue:
                    '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                  letter: null,
                  messages: [],
                  coverage: 0.0,
                  status: 'DISABLED',
                  value: 0.0
                },
                {
                  formattedValue:
                    '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                  letter: null,
                  messages: [],
                  coverage: 0.0,
                  status: 'DISABLED',
                  value: 0.0
                },
                {
                  formattedValue: '<span>0.00%</span>',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: 0.0
                },
                {
                  formattedValue: '<span>0.00%</span>',
                  letter: null,
                  messages: [],
                  coverage: 0.37523452157598497,
                  status: 'PRESENT',
                  value: 0.0
                },
                {
                  formattedValue: '<span class="delta-worse">-14.71%</span>',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: -14.71
                },
                {
                  formattedValue: '<span>0.00%</span>',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: 0.0
                },
                {
                  formattedValue: '<span>0.00%</span>',
                  letter: null,
                  messages: [],
                  coverage: 100.0,
                  status: 'PRESENT',
                  value: 0.0
                },
                {
                  formattedValue:
                    '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                  letter: null,
                  messages: [],
                  coverage: 0.0,
                  status: 'DISABLED',
                  value: 0.0
                }
              ],
              dates: ['2026-06-17T10:35:22.000+02:00'],
              metrics: [
                {
                  expression: 'Delta(G(tqi,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiTestCoverage,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Code Coverage (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiAbstrInt,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Abstract Interpretation (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiComplexity,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Cyclomatic Complexity (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiCompWarn,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Compiler Warnings (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiCodingStd,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Coding Standards (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiDupCode,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Code Duplication (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiFanOut,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Fan Out (Δ Previous analysis)'
                },
                {
                  expression: 'Delta(G(tqiSecurity,ClientData(asdfasdfasdf)),Run(-2))',
                  fullName: 'TQI Code Security (Δ Previous analysis)'
                }
              ],
              nodes: [
                {
                  name: 'c-demo',
                  fullPath: 'HIE://c-demo'
                }
              ]
            });
          }
          return Promise.resolve({
            data: [
              {
                formattedValue: '\u003cspan class\u003d"delta-worse"\u003e-0.01%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: -0.01
              },
              {
                formattedValue:
                  '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
                letter: null,
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              },
              {
                formattedValue:
                  '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
                letter: null,
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              },
              {
                formattedValue: '\u003cspan\u003e0.00%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 0.0
              },
              {
                formattedValue: '\u003cspan\u003e0.00%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 0.37523452157598497,
                status: 'PRESENT',
                value: 0.0
              },
              {
                formattedValue: '\u003cspan class\u003d"delta-worse"\u003e-0.02%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: -0.02
              },
              {
                formattedValue: '\u003cspan\u003e0.00%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 0.0
              },
              {
                formattedValue: '\u003cspan\u003e0.00%\u003c/span\u003e',
                letter: null,
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 0.0
              },
              {
                formattedValue:
                  '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
                letter: null,
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              }
            ],
            dates: ['2026-06-10T10:54:55.000+02:00'],
            metrics: [
              {
                expression: 'Delta(tqi,Run(-2))',
                fullName: 'TQI (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiTestCoverage,Run(-2))',
                fullName: 'TQI Code Coverage (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiAbstrInt,Run(-2))',
                fullName: 'TQI Abstract Interpretation (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiComplexity,Run(-2))',
                fullName: 'TQI Cyclomatic Complexity (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiCompWarn,Run(-2))',
                fullName: 'TQI Compiler Warnings (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiCodingStd,Run(-2))',
                fullName: 'TQI Coding Standards (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiDupCode,Run(-2))',
                fullName: 'TQI Code Duplication (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiFanOut,Run(-2))',
                fullName: 'TQI Fan Out (Δ Previous analysis)'
              },
              {
                expression: 'Delta(tqiSecurity,Run(-2))',
                fullName: 'TQI Code Security (Δ Previous analysis)'
              }
            ],
            nodes: [
              {
                name: 'c-demo',
                fullPath: 'HIE://c-demo'
              }
            ]
          });
        }
        if (opts?.cdtoken) {
          return Promise.resolve({
            data: [
              {
                formattedValue: '26.04%',
                letter: 'F',
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 26.04368514792632
              },
              {
                formattedValue:
                  '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                letter: 'F',
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              },
              {
                formattedValue:
                  '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                letter: 'F',
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              },
              {
                formattedValue: '99.16%',
                letter: 'A',
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 99.16763462235956
              },
              {
                formattedValue: '0.37%',
                letter: 'F',
                messages: [],
                coverage: 0.37523452157598497,
                status: 'PRESENT',
                value: 0.37523452157598497
              },
              {
                formattedValue: '63.77%',
                letter: 'D',
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 63.7767208441954
              },
              {
                formattedValue: '100.00%',
                letter: 'A',
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 100.0
              },
              {
                formattedValue: '93.85%',
                letter: 'A',
                messages: [],
                coverage: 100.0,
                status: 'PRESENT',
                value: 93.85928846068848
              },
              {
                formattedValue:
                  '<i data-bind="i18n:{title: \'$t(metricValueStatus.DISABLED.message)\'}" class="text-muted fa-solid fa-ban" style="cursor: help"></i>',
                letter: 'F',
                messages: [],
                coverage: 0.0,
                status: 'DISABLED',
                value: 0.0
              }
            ],
            dates: ['2026-06-17T10:35:22.000+02:00'],
            metrics: [
              {
                expression: 'G(tqi,ClientData(asdfasdfasdf))',
                fullName: 'TQI'
              },
              {
                expression: 'G(tqiTestCoverage,ClientData(asdfasdfasdf))',
                fullName: 'TQI Code Coverage'
              },
              {
                expression: 'G(tqiAbstrInt,ClientData(asdfasdfasdf))',
                fullName: 'TQI Abstract Interpretation'
              },
              {
                expression: 'G(tqiComplexity,ClientData(asdfasdfasdf))',
                fullName: 'TQI Cyclomatic Complexity'
              },
              {
                expression: 'G(tqiCompWarn,ClientData(asdfasdfasdf))',
                fullName: 'TQI Compiler Warnings'
              },
              {
                expression: 'G(tqiCodingStd,ClientData(asdfasdfasdf))',
                fullName: 'TQI Coding Standards'
              },
              {
                expression: 'G(tqiDupCode,ClientData(asdfasdfasdf))',
                fullName: 'TQI Code Duplication'
              },
              {
                expression: 'G(tqiFanOut,ClientData(asdfasdfasdf))',
                fullName: 'TQI Fan Out'
              },
              {
                expression: 'G(tqiSecurity,ClientData(asdfasdfasdf))',
                fullName: 'TQI Code Security'
              }
            ],
            nodes: [
              {
                name: 'main',
                fullPath: 'HIE://c-demo/main'
              }
            ]
          });
        }
        return Promise.resolve({
          data: [
            {
              formattedValue: '27.51%',
              letter: 'F',
              messages: [],
              coverage: 100.0,
              status: 'PRESENT',
              value: 27.51433490874863
            },
            {
              formattedValue:
                '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
              letter: 'F',
              messages: [],
              coverage: 0.0,
              status: 'DISABLED',
              value: 0.0
            },
            {
              formattedValue:
                '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
              letter: 'F',
              messages: [],
              coverage: 0.0,
              status: 'DISABLED',
              value: 0.0
            },
            {
              formattedValue: '99.16%',
              letter: 'A',
              messages: [],
              coverage: 100.0,
              status: 'PRESENT',
              value: 99.16763462235956
            },
            {
              formattedValue: '0.37%',
              letter: 'F',
              messages: [],
              coverage: 0.37523452157598497,
              status: 'PRESENT',
              value: 0.37523452157598497
            },
            {
              formattedValue: '78.48%',
              letter: 'C',
              messages: [],
              coverage: 100.0,
              status: 'PRESENT',
              value: 78.48321845241853
            },
            {
              formattedValue: '100.00%',
              letter: 'A',
              messages: [],
              coverage: 100.0,
              status: 'PRESENT',
              value: 100.0
            },
            {
              formattedValue: '93.85%',
              letter: 'A',
              messages: [],
              coverage: 100.0,
              status: 'PRESENT',
              value: 93.85928846068848
            },
            {
              formattedValue:
                '\u003ci data-bind\u003d"i18n:{title: \u0027$t(metricValueStatus.DISABLED.message)\u0027}" class\u003d"text-muted fa-solid fa-ban" style\u003d"cursor: help"\u003e\u003c/i\u003e',
              letter: null,
              messages: [],
              coverage: 0.0,
              status: 'DISABLED',
              value: 0.0
            }
          ],
          dates: ['2026-06-10T10:54:55.000+02:00'],
          metrics: [
            {
              expression: 'tqi',
              fullName: 'TQI'
            },
            {
              expression: 'tqiTestCoverage',
              fullName: 'TQI Code Coverage'
            },
            {
              expression: 'tqiAbstrInt',
              fullName: 'TQI Abstract Interpretation'
            },
            {
              expression: 'tqiComplexity',
              fullName: 'TQI Cyclomatic Complexity'
            },
            {
              expression: 'tqiCompWarn',
              fullName: 'TQI Compiler Warnings'
            },
            {
              expression: 'tqiCodingStd',
              fullName: 'TQI Coding Standards'
            },
            {
              expression: 'tqiDupCode',
              fullName: 'TQI Code Duplication'
            },
            {
              expression: 'tqiFanOut',
              fullName: 'TQI Fan Out'
            },
            {
              expression: 'tqiSecurity',
              fullName: 'TQI Code Security'
            }
          ],
          nodes: [
            {
              name: 'main',
              fullPath: 'HIE://c-demo/main'
            }
          ]
        });
      }
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create tqi label information retrieved from viewer with client token present', async () => {
    const response = await getTqiLabel('project', 'asdfasdfasdf');

    expect(response).toStrictEqual([
      { deltaValue: -1.47, letter: 'F', metric: 'TQI', status: 'PRESENT', score: 26.04368514792632 },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Code Coverage',
        status: 'DISABLED',
        score: 0
      },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Abstract Interpretation',
        status: 'DISABLED',
        score: 0
      },
      {
        deltaValue: 0,
        letter: 'A',
        metric: 'TQI Cyclomatic Complexity',
        status: 'PRESENT',
        score: 99.16763462235956
      },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Compiler Warnings',
        status: 'PRESENT',
        score: 0.37523452157598497
      },
      {
        deltaValue: -14.71,
        letter: 'D',
        metric: 'TQI Coding Standards',
        status: 'PRESENT',
        score: 63.7767208441954
      },
      {
        deltaValue: 0,
        letter: 'A',
        metric: 'TQI Code Duplication',
        status: 'PRESENT',
        score: 100
      },
      { deltaValue: 0, letter: 'A', metric: 'TQI Fan Out', status: 'PRESENT', score: 93.85928846068848 },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Code Security',
        status: 'DISABLED',
        score: 0
      }
    ]);
  });

  it('should create tqi label information retrieved from viewer', async () => {
    const response = await getTqiLabel('project');

    expect(response).toStrictEqual([
      { deltaValue: -0.01, letter: 'F', metric: 'TQI', status: 'PRESENT', score: 27.51433490874863 },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Code Coverage',
        status: 'DISABLED',
        score: 0
      },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Abstract Interpretation',
        status: 'DISABLED',
        score: 0
      },
      {
        deltaValue: 0,
        letter: 'A',
        metric: 'TQI Cyclomatic Complexity',
        status: 'PRESENT',
        score: 99.16763462235956
      },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Compiler Warnings',
        status: 'PRESENT',
        score: 0.37523452157598497
      },
      {
        deltaValue: -0.02,
        letter: 'C',
        metric: 'TQI Coding Standards',
        status: 'PRESENT',
        score: 78.48321845241853
      },
      {
        deltaValue: 0,
        letter: 'A',
        metric: 'TQI Code Duplication',
        status: 'PRESENT',
        score: 100
      },
      { deltaValue: 0, letter: 'A', metric: 'TQI Fan Out', status: 'PRESENT', score: 93.85928846068848 },
      {
        deltaValue: 0,
        letter: 'F',
        metric: 'TQI Code Security',
        status: 'DISABLED',
        score: 0
      }
    ]);
  });
});
