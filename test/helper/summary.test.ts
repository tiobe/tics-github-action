import { githubConfig, ticsConfig } from '../../src/configuration';
import { QualityGate } from '../../src/helper/interfaces';
import {
  createErrorSummary,
  createFilesSummary,
  createLinkSummary,
  createQualityGateSummary,
  createReviewComments,
  createUnpostableReviewCommentsSummary
} from '../../src/helper/summary';
import '../.setup/extend_jest';

describe('createErrorSummary', () => {
  test('Should return summary of two errors', () => {
    const response = createErrorSummary(['Error', 'Error'], []);

    expect(response).toContainTimes('Error', 2);
    expect(response).toContainTimes('Warning', 0);
  });

  test('Should return summary of zero warnings on logLevel default', () => {
    const response = createErrorSummary([], ['Warning', 'Warning']);

    expect(response).toContainTimes('Error', 0);
    expect(response).toContainTimes('Warning', 0);
  });

  test('Should return summary of two  warnings on logLevel debug', () => {
    githubConfig.debugger = true;

    const response = createErrorSummary([], ['Warning', 'Warning']);

    expect(response).toContainTimes('Error', 0);
    expect(response).toContainTimes('Warning', 2);
  });

  test('Should return summary of one error and two warnings', () => {
    githubConfig.debugger = true;

    const response = createErrorSummary(['Error'], ['Warning', 'Warning']);

    expect(response).toContainTimes('Error', 1);
    expect(response).toContainTimes('Warning', 2);
  });
});

describe('createLinkSummary', () => {
  test('Should return markdown link to url', () => {
    const response = createLinkSummary('https://url.com');

    expect(response).toEqual('[See the results in the TiCS Viewer](https://url.com)\n\n');
  });
});

describe('createFilesSummary', () => {
  test('Should return summary list of a single file', () => {
    const response = createFilesSummary(['test.js']);

    expect(response).toEqual('<details><summary>The following files have been checked:</summary>\n<ul><li>test.js</li></ul></details>\n\n');
  });

  test('Should return summary list of a single file', () => {
    const response = createFilesSummary(['test.js']);

    expect(response).toContainTimes('<li>test.js</li>', 1);
  });

  test('Should return summary list of two files', () => {
    const response = createFilesSummary(['test.js', 'test.ts']);

    expect(response).toContainTimes('<li>test.js</li>', 1);
    expect(response).toContainTimes('<li>test.ts</li>', 1);
  });
});

describe('createQualityGateSummary', () => {
  test('Should return summary failed quality gate', () => {
    const qualityGate: QualityGate = {
      passed: false,
      message: 'Project successfully passed all 2 quality gates',
      url: 'api',
      gates: [
        {
          passed: false,
          name: 'JavaScript',
          conditions: [
            {
              passed: false,
              error: false,
              message: 'Δ Coding Standard Violations for levels 1, 2, 3, 4 should be at most 0 for each file with respect to second-to-last analysis'
            },
            {
              passed: true,
              error: false,
              message: 'Δ Maximum Cyclomatic Complexity should be at most 5 for each file with respect to second-to-last analysis'
            },
            {
              passed: true,
              error: false,
              message: 'Δ TQI Cyclomatic Complexity should be at most 100.00% for each file with respect to second-to-last analysis'
            }
          ]
        },
        {
          passed: true,
          name: 'SecondTest',
          conditions: [
            {
              passed: true,
              error: false,
              message: 'Δ Coding Standard Violations for levels 1, 2, 3, 4 should be at most 0 for each file with respect to second-to-last analysis'
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

    const response = createQualityGateSummary(qualityGate);

    expect(response).toContainTimes(':x:', 2);
  });

  test('Should return summary failed quality gate', () => {
    const qualityGate: QualityGate = {
      passed: false,
      message: 'Project successfully passed all 2 quality gates',
      url: 'api',
      gates: [
        {
          passed: false,
          name: 'JavaScript',
          conditions: [
            {
              passed: false,
              error: false,
              message:
                'Δ Coding Standard Violations for levels 1, 2, 3, 4 should be at most 0 for each file with respect to second-to-last analysis, but was not for 1 file',
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
                    name: 'src/tics/TicsAnalyzer.js',
                    link: 'AnnotatedSource.html#axes\u003dLevel(Set(1,2,3,4)),Suppressions(no),Date(1672314064),ClientData(17ILj0tRtP5czHpnwhAOxQ),Project(js%20test%20project),Branch(main),Window(changed,ge,1672314064),File(Path(HIE,js%20test%20project,main,src,tics,TicsAnalyzer.js)),IsNew(yes)\u0026diff\u003dtrue\u0026metrics\u003dDelta(G(Violations(CS),Level(Set(1,2,3,4))),Run(-2))',
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
                  url: 'api/public/v1/Annotations?filters\u003dDate(1672314064),ClientData(17ILj0tRtP5czHpnwhAOxQ),Project(js%20test%20project),Branch(main),Window(-1),Level(Set(1,2,3,4)),Where(Eq(Violations(CS),gt,0)),DeltaDate(Run(-2)),IsNew(yes)\u0026metric\u003dAnnotations(CS)'
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

    const response = createQualityGateSummary(qualityGate);

    expect(response).toContainTimes(':x:', 2);
  });

  test('Should return summary on skipped quality gate', () => {
    const qualityGate: QualityGate = {
      passed: true,
      message: 'Project successfully passed all 2 quality gates',
      url: 'api',
      gates: [
        {
          passed: true,
          name: 'JavaScript',
          conditions: [
            {
              passed: true,
              skipped: true,
              error: false,
              message: ''
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

    const response = createQualityGateSummary(qualityGate);

    expect(response).toContainTimes(':x:', 0);
  });
});

describe('createReviewComments', () => {
  test('Should return no review comments on empty input', async () => {
    const response = await createReviewComments([], []);
    expect(response).toEqual({ postable: [], unpostable: [] });
  });

  test('Should return one postable review comment', async () => {
    const changedFiles = [
      {
        filename: 'src/test.js',
        patch: '@@ -0,1 +0,1 @@'
      }
    ];
    const annotations = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      }
    ];

    const expected_postable = [
      {
        path: 'src/test.js',
        line: 0,
        body: ':warning: **TiCS: test violation: test**\r\nLine: 0, Rule: test, Level: 1, Category: test\r\n'
      }
    ];

    const response = await createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: [] });
  });

  test('Should return one combined postable review comment for the same line', async () => {
    const changedFiles = [
      {
        filename: 'src/test.js',
        patch: '@@ -0,1 +0,1 @@'
      }
    ];
    const annotations = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      },
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      }
    ];

    const expected_postable = [
      {
        path: 'src/test.js',
        line: 0,
        body: ':warning: **TiCS: test violation: test**\r\n(2x) Line: 0, Rule: test, Level: 1, Category: test\r\n'
      }
    ];

    const response = await createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: [] });
  });

  test('Should return one postable and one unpostable review comment', async () => {
    const changedFiles = [
      {
        filename: 'src/test.js',
        patch: '@@ -0,1 +0,1 @@'
      }
    ];
    const annotations = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      },
      {
        fullPath: 'HIE://project/branch/src/jest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      },
      {
        fullPath: 'HIE://project/branch/src/zest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1
      }
    ];

    const expected_postable = [
      {
        path: 'src/test.js',
        line: 0,
        body: ':warning: **TiCS: test violation: test**\r\nLine: 0, Rule: test, Level: 1, Category: test\r\n'
      }
    ];

    const expected_unpostable = [
      {
        path: 'src/jest.js',
        fullPath: 'HIE://project/branch/src/jest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        displayCount: '',
        diffLines: []
      },
      {
        path: 'src/zest.js',
        fullPath: 'HIE://project/branch/src/zest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        displayCount: '',
        diffLines: []
      }
    ];

    const response = await createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: expected_unpostable });
  });
});

describe('createUnpostableReviewCommentsSummary', () => {
  test('Should return summary of zero unpostable review comments on empty input', () => {
    const response = createUnpostableReviewCommentsSummary([]);
    expect(response).toEqual(
      '<details><summary>Quality gate failures that cannot be annotated in <b>Files Changed</b>:</summary>\n</table></details>\n\n'
    );
  });

  test('Should return summary of one unpostable review comment', () => {
    const unpostable = [
      {
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test'
      }
    ];

    const response = createUnpostableReviewCommentsSummary(unpostable);
    expect(response).toContain(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`);
    expect(response).toContain(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`
    );
  });

  test('Should return summary of two unpostable review comment for one file', () => {
    const unpostable = [
      {
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test'
      },
      {
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test'
      }
    ];

    const response = createUnpostableReviewCommentsSummary(unpostable);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });

  test('Should return summary of two unpostable review comment for two files', () => {
    const unpostable = [
      {
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test'
      },
      {
        path: 'src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test'
      }
    ];

    const response = createUnpostableReviewCommentsSummary(unpostable);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[1].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });
});
