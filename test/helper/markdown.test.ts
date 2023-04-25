import { Status } from '../../src/helper/enums';
import { generateExpandableAreaMarkdown, generateStatusMarkdown } from '../../src/helper/markdown';

describe('generateStatusMarkdown', () => {
  test('Should return failed without prefix', () => {
    const status = generateStatusMarkdown(Status.FAILED);
    expect(status).toEqual(':x: ');
  });

  test('Should return failed with prefix', () => {
    const status = generateStatusMarkdown(Status.FAILED, true);
    expect(status).toEqual(':x: Failed ');
  });

  test('Should return passed without prefix', () => {
    const status = generateStatusMarkdown(Status.PASSED);
    expect(status).toEqual(':heavy_check_mark: ');
  });

  test('Should return passed with prefix', () => {
    const status = generateStatusMarkdown(Status.PASSED, true);
    expect(status).toEqual(':heavy_check_mark: Passed ');
  });

  test('Should return warning without prefix', () => {
    const status = generateStatusMarkdown(Status.WARNING);
    expect(status).toEqual(':warning: ');
  });

  test('Should return warning with prefix', () => {
    const status = generateStatusMarkdown(Status.WARNING, true);
    expect(status).toEqual(':warning: Skipped ');
  });

  test('Should return skipped without prefix', () => {
    const status = generateStatusMarkdown(Status.SKIPPED);
    expect(status).toEqual(':warning: ');
  });

  test('Should return skipped with prefix', () => {
    const status = generateStatusMarkdown(Status.SKIPPED, true);
    expect(status).toEqual(':warning: Skipped ');
  });
});

describe('generateExpandableAreaMarkdown', () => {
  test('Should return markdown expandable area', () => {
    const area = generateExpandableAreaMarkdown('header', 'body');
    expect(area).toEqual('<details><summary>header</summary>\nbody</details>\n\n');
  });
});
