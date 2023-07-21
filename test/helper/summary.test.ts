import { githubConfig } from '../../src/configuration';
import { ChangedFile } from '../../src/github/interfaces';
import { createErrorSummary, createFilesSummary, createReviewComments, createUnpostableAnnotationsDetails } from '../../src/helper/summary';
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

describe('createReviewComments', () => {
  test('Should return no review comments on empty input', async () => {
    const response = createReviewComments([], []);
    expect(response).toEqual({ postable: [], unpostable: [] });
  });

  test('Should return one postable review comment', async () => {
    const changedFiles: ChangedFile[] = [
      {
        sha: 'sha',
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        blob_url: 'url',
        raw_url: 'url',
        contents_url: 'url',
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
        count: 1,
        supp: false
      }
    ];

    const expected_postable = [
      {
        title: 'test: test',
        path: 'src/test.js',
        line: 0,
        body: 'Line: 0: test\r\nLevel: 1, Category: test'
      }
    ];

    const response = createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: [] });
  });

  test('Should return one combined postable review comment for the same line', async () => {
    const changedFiles: ChangedFile[] = [
      {
        sha: 'sha',
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        blob_url: 'url',
        raw_url: 'url',
        contents_url: 'url',
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
        count: 1,
        supp: false
      },
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false
      }
    ];

    const expected_postable = [
      {
        title: 'test: test',
        path: 'src/test.js',
        line: 0,
        body: 'Line: 0: (2x) test\r\nLevel: 1, Category: test'
      }
    ];

    const response = createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: [] });
  });

  test('Should return one postable and one unpostable review comment', async () => {
    const changedFiles: ChangedFile[] = [
      {
        sha: 'sha',
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        blob_url: 'url',
        raw_url: 'url',
        contents_url: 'url',
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
        count: 1,
        supp: false
      },
      {
        fullPath: 'HIE://project/branch/src/jest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false
      },
      {
        fullPath: 'HIE://project/branch/src/zest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false
      }
    ];

    const expected_postable = [
      {
        title: 'test: test',
        path: 'src/test.js',
        line: 0,
        body: 'Line: 0: test\r\nLevel: 1, Category: test'
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
        supp: false,
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
        supp: false,
        displayCount: '',
        diffLines: []
      }
    ];

    const response = createReviewComments(annotations, changedFiles);
    expect(response).toEqual({ postable: expected_postable, unpostable: expected_unpostable });
  });
});

describe('createUnpostableReviewCommentsSummary', () => {
  test('Should return summary of zero unpostable review comments on empty input', () => {
    const response = createUnpostableAnnotationsDetails([]);
    expect(response).toEqual(
      '<details><summary>Quality gate failures that cannot be annotated in <b>Files Changed</b>:</summary>\n</table></details>\n\n'
    );
  });

  test('Should return summary of one unpostable review comment', () => {
    const unpostable = [
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
        count: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);
    expect(response).toContain(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`);
    expect(response).toContain(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`
    );
  });

  test('Should return summary of two unpostable review comment for one file', () => {
    const unpostable = [
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
        count: 0
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
        count: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });

  test('Should return summary of two unpostable review comment for two files', () => {
    const unpostable = [
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
        count: 0
      },
      {
        fullPath: '/home/src/test.js',
        path: 'src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        displayCount: '',
        msg: 'test',
        supp: false,
        count: 0
      }
    ];

    const response = createUnpostableAnnotationsDetails(unpostable);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[0].path}</th></tr>`, 1);
    expect(response).toContainTimes(`<table><tr><th colspan='3'>${unpostable[1].path}</th></tr>`, 1);
    expect(response).toContainTimes(
      `<tr><td>:warning:</td><td><b>Line:</b> ${unpostable[0].line} <b>Level:</b> ${unpostable[0].level}<br><b>Category:</b> ${unpostable[0].category}</td><td><b>${unpostable[0].type} violation:</b> ${unpostable[0].rule} <b>${unpostable[0].displayCount}</b><br>${unpostable[0].msg}</td></tr>`,
      2
    );
  });
});
