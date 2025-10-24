import { summary } from '@actions/core';
import { ExtendedAnnotation } from '../../../../src/viewer/interfaces';
import {
  createErrorSummaryBody,
  createFilesSummary,
  createNothingAnalyzedSummaryBody,
  createSummaryBody,
  createUnpostableAnnotationsDetails
} from '../../../../src/action/decorate/summary';
import '../../../.setup/extend_jest';
import {
  analysisResultsSoaked,
  analysisResultsNotSoaked,
  analysisResultsPartlySoakedPassed,
  analysisResultsNoSoakedPassed,
  analysisResultsPartlySoakedFailed,
  analysisResultsSoakedMetricGroup,
  analysisResultsNotSoakedMetricGroup
} from './objects/summary';
import { githubConfigMock, ticsConfigMock } from '../../../.setup/mock';

describe('createSummaryBody', () => {
  beforeEach(() => {
    ticsConfigMock.displayUrl = 'http://viewer.url/';
  });

  describe('No metric grouping', () => {
    it('should contain blocking after if there are soaked violations', async () => {
      const string = await createSummaryBody(analysisResultsSoaked);

      expect(string).toContain('<h3>:x: Failed </h3>');
      expect(string).toContain('<h3>Conditions: 1 Failed, 0 Passed</h3>');
      expect(string).toContain(':x: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>');
      expect(string).toContain('>+39</a></td>');
      expect(string).toContain('>+3</a></td></tr><tr><td>');
      expect(string).toContain('>+30</a></td>');
      expect(string).toContain('>0</a></td></tr><tr><td>');
      expect(string).toContain('>+24</a></td>');
      expect(string).toContain('>0</a></td></tr></table>');
      expect(string).toContain('<tr><th>Function</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>');
      expect(string).toContain('>+25</a></td>');
      expect(string).toContain('>0</a></td></tr>');

      summary.clear();
    });

    it('should not contain blocking after if there are no soaked violations', async () => {
      const string = await createSummaryBody(analysisResultsNotSoaked);

      expect(string).toContain('<h3>:x: Failed </h3>');
      expect(string).toContain('<h3>Conditions: 1 Failed, 0 Passed</h3>');
      expect(string).toContain(':x: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:x: Blocking now</th></tr>');
      expect(string).toContain('>+39</a></td></tr><tr><td>');
      expect(string).toContain('>+30</a></td></tr><tr><td>');
      expect(string).toContain('>+24</a></td></tr></table>');

      summary.clear();
    });

    it('Should contain blocking after if there are partly violations', async () => {
      const string = await createSummaryBody(analysisResultsPartlySoakedPassed);

      expect(string).toContain('<h3>:warning: Passed with warnings </h3>');
      expect(string).toContain('<h3>Conditions: 0 Failed, 1 Passed</h3>');
      expect(string).toContain(':warning: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>');
      expect(string).toContain('>0</a></td>');
      expect(string).toContain('>+3</a></td></tr><tr><td>');
      expect(string).toContain('>+1</a></td>');
      expect(string).toContain('>-</td></tr></table>');

      summary.clear();
    });

    it('Should contain blocking after for one of the two conditions', async () => {
      const string = await createSummaryBody(analysisResultsPartlySoakedFailed);

      expect(string).toContain('<h3>:x: Failed </h3>');
      expect(string).toContain('<h3>Conditions: 1 Failed, 1 Passed</h3>');
      expect(string).toContain(':x: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:x: Blocking now</th></tr>');
      expect(string).toContain('>+1</a></td></tr></table>');
      expect(string).toContain(':warning: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>');
      expect(string).toContain('>0</a></td>');
      expect(string).toContain('>+3</a></td></tr></table>');

      summary.clear();
    });

    it('Should pass with no conditions that passed with warnings', async () => {
      const string = await createSummaryBody(analysisResultsNoSoakedPassed);

      expect(string).toContain('<h3>:heavy_check_mark: Passed </h3>');
      expect(string).toContain('<h3>Conditions: 0 Failed, 2 Passed</h3>');

      summary.clear();
    });
  });

  describe('With metric grouping', () => {
    it('should contain blocking after if there are soaked violations', async () => {
      const string = await createSummaryBody(analysisResultsSoakedMetricGroup);

      expect(string).toContain('<h3>:x: Failed </h3>');
      expect(string).toContain('<h3>Coding Standard: :x: 117 Blocking Issues</h3>');
      expect(string).toContain('<h3>Compiler Warnings: :warning: 3 Blocking After Issues</h3>');
      expect(string).toContain(':x: No new Coding Standard Violations');
      expect(string).toContain('<tr><th>File</th><th>:beetle: Total</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>');
      expect(string).toContainTimes('>40</a></td>', 5);
      expect(string).toContain('>+39</a></td>');
      expect(string).toContain('>+3</a></td></tr><tr><td>');
      expect(string).toContain('>+30</a></td>');
      expect(string).toContain('>0</a></td></tr><tr><td>');
      expect(string).toContain('>+24</a></td>');
      expect(string).toContain('>0</a></td></tr></table>');
      expect(string).toContain(
        '<tr><th>Function</th><th>:beetle: Total</th><th>:x: Blocking now</th><th>:warning: Blocking after 2018-03-23</th></tr>'
      );
      expect(string).toContain('>+25</a></td>');
      expect(string).toContain('>0</a></td></tr>');

      summary.clear();
    });

    it('should not contain blocking after if there are no soaked violations', async () => {
      const string = await createSummaryBody(analysisResultsNotSoakedMetricGroup);

      expect(string).toContain('<h3>:x: Failed </h3>');
      expect(string).toContain('<h3>Coding Standards: :x: 93 Blocking Issues</h3>');
      expect(string).toContain('<h3>Compiler Warnings: :heavy_check_mark: Passed </h3>');
      expect(string).toContain(':x: No new Coding Standard Violations');
      expect(string).toContainTimes('<tr><th>File</th><th>:x: Blocking now</th></tr>', 2);
      expect(string).toContain('>+39</a></td></tr><tr><td>');
      expect(string).toContain('>+30</a></td></tr><tr><td>');
      expect(string).toContain('>+24</a></td></tr></table>');

      summary.clear();
    });
  });
});

describe('createErrorSummary', () => {
  it('Should return summary of two errors', async () => {
    githubConfigMock.debugger = false;

    const body = await createErrorSummaryBody(['Error', 'Error'], []);
    summary.clear();

    expect(body).toContainTimes('<h2>The following errors have occurred during analysis:</h2>', 1);
    expect(body).toContainTimes('<h2>The following warnings have occurred during analysis:</h2>', 0);
    expect(body).toContainTimes(':x: Error', 2);
    expect(body).toContainTimes(':warning: Warning', 0);
  });

  it('Should return summary of zero warnings on logLevel default', async () => {
    githubConfigMock.debugger = false;

    const body = await createErrorSummaryBody([], ['Warning', 'Warning']);
    summary.clear();

    expect(body).toContainTimes('<h2>The following errors have occurred during analysis:</h2>', 0);
    expect(body).toContainTimes('<h2>The following warnings have occurred during analysis:</h2>', 0);
    expect(body).toContainTimes(':x: Error', 0);
    expect(body).toContainTimes(':warning: Warning', 0);
  });

  it('Should return summary of two  warnings on logLevel debug', async () => {
    githubConfigMock.debugger = true;

    const body = await createErrorSummaryBody([], ['Warning', 'Warning']);
    summary.clear();

    expect(body).toContainTimes('<h2>The following errors have occurred during analysis:</h2>', 0);
    expect(body).toContainTimes('<h2>The following warnings have occurred during analysis:</h2>', 1);
    expect(body).toContainTimes(':x: Error', 0);
    expect(body).toContainTimes(':warning: Warning', 2);
    expect(body).toContainTimes('\n<h2></h2><i title="Workflow / Job / Step">tics-client / TICS / tics-github-action</i>', 1);
    expect(body).toContain('\n<!--tics-client_TICS_1_2-->');
  });

  it('Should return summary of one error and two warnings', async () => {
    githubConfigMock.debugger = true;

    const body = await createErrorSummaryBody(['Error'], ['Warning', 'Warning']);
    summary.clear();

    expect(body).toContainTimes('<h2>The following errors have occurred during analysis:</h2>', 1);
    expect(body).toContainTimes('<h2>The following warnings have occurred during analysis:</h2>', 1);
    expect(body).toContainTimes(':x: Error', 1);
    expect(body).toContainTimes(':warning: Warning', 2);
    expect(body).toContainTimes('\n<h2></h2><i title="Workflow / Job / Step">tics-client / TICS / tics-github-action</i>', 1);
    expect(body).toContainTimes('\n<!--tics-client_TICS_1_2-->', 1);
  });
});

describe('createNothingAnalyzedSummaryBody', () => {
  it('Should return summary with the message given', async () => {
    const body = await createNothingAnalyzedSummaryBody('message');
    expect(body).toEqual(
      '<h1>TICS Quality Gate</h1>\n<h3>:heavy_check_mark: Passed </h3>\nmessage\n<h2></h2><i title="Workflow / Job / Step">tics-client / TICS / tics-github-action</i>\n<!--tics-client_TICS_1_2-->'
    );
  });
});

describe('createFilesSummary', () => {
  it('should return summary list of a single file', () => {
    const response = createFilesSummary(['test.js']);

    expect(response).toBe(
      '<details><summary>The following files have been checked for this project</summary>\n<ul><li>test.js</li></ul></details>\n\n'
    );
    expect(response).toContainTimes('<li>test.js</li>', 1);
  });

  it('should return summary list of two files', () => {
    const response = createFilesSummary(['test.js', 'test.ts']);

    expect(response).toContainTimes('<li>test.js</li>', 1);
    expect(response).toContainTimes('<li>test.ts</li>', 1);
  });
});

describe('createUnpostableAnnotationsDetails', () => {
  it('should return summary of zero unpostable review comments on empty input', () => {
    const response = createUnpostableAnnotationsDetails([]);

    expect(response).toBe(
      '<details><summary>Quality gate failures that cannot be annotated in <b>Files Changed</b></summary>\n</table></details>\n\n'
    );
  });

  it('should return summary of one unpostable review comment', () => {
    const unpostable: ExtendedAnnotation[] = [
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);

    expect(response).toContain(`<table><tr><th colspan='4'>${unpostable[0].path}</th></tr>`);
    expect(response).toContain(
      `<tr><td>:x:</td><td>Blocking</td><td><b>Line:</b> ${unpostable[0].line}<br><b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`
    );
  });

  it('should return summary of two unpostable review comment for one file', () => {
    const unpostable: ExtendedAnnotation[] = [
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      },
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);

    expect(response).toContainTimes(`<table><tr><th colspan='4'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:x:</td><td>Blocking</td><td><b>Line:</b> ${unpostable[0].line}<br><b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });

  it('should return summary of two unpostable review comments for one file', () => {
    const unpostable: ExtendedAnnotation[] = [
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      },
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);

    expect(response).toContainTimes(`<table><tr><th colspan='4'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:x:</td><td>Blocking</td><td><b>Line:</b> ${unpostable[0].line}<br><b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });

  it('should return summary of two unpostable review comment for two files', () => {
    const unpostable: ExtendedAnnotation[] = [
      {
        fullPath: '/home/src/hello.js',
        path: 'src/hello.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        gateId: 0
      },
      {
        fullPath: '/home/src/test.js',
        path: 'src/test.js',
        line: 0,
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0,
        instanceName: 'test',
        blocking: {
          state: 'after',
          after: 1723795324000
        },
        gateId: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);

    expect(response).toContainTimes(`<table><tr><th colspan='4'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(`<table><tr><th colspan='4'>${unpostable[1].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:x:</td><td>Blocking</td><td><b>Line:</b> ${unpostable[0].line}<br><b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      1
    );
    expect(response).toContainTimes(
      `<tr><td>:warning:</td><td>Blocking after 2024-08-16</td><td><b>Line:</b> ${unpostable[1].line}</td><td><b>${unpostable[1].type} violation:</b> ${unpostable[1].rule} <b>${unpostable[1].displayCount}</b><br>${unpostable[1].msg}</td></tr>`,
      1
    );
  });
});
