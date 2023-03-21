import { Status } from '../../src/helper/enums';
import { generateExpandableAreaMarkdown, generateLinkMarkdown, generateStatusMarkdown } from '../../src/helper/markdown';

describe('generateStatusMarkdown', () => {
  test('Should return failed without prefix', () => {
    const status = generateStatusMarkdown(Status[0]);
    expect(status).toEqual(':x: ');
  });

  test('Should return failed with prefix', () => {
    const status = generateStatusMarkdown(Status[0], true);
    expect(status).toEqual(':x: Failed ');
  });

  test('Should return passed without prefix', () => {
    const status = generateStatusMarkdown(Status[1]);
    expect(status).toEqual(':heavy_check_mark: ');
  });

  test('Should return passed with prefix', () => {
    const status = generateStatusMarkdown(Status[1], true);
    expect(status).toEqual(':heavy_check_mark: Passed ');
  });

  test('Should return warning without prefix', () => {
    const status = generateStatusMarkdown(Status[2]);
    expect(status).toEqual(':warning: ');
  });

  test('Should return warning with prefix', () => {
    const status = generateStatusMarkdown(Status[2], true);
    expect(status).toEqual(':warning: Skipped ');
  });

  test('Should return skipped without prefix', () => {
    const status = generateStatusMarkdown(Status[3]);
    expect(status).toEqual(':warning: ');
  });

  test('Should return skipped with prefix', () => {
    const status = generateStatusMarkdown(Status[3], true);
    expect(status).toEqual(':warning: Skipped ');
  });

  test('Should return nothing when status is not given', () => {
    const status = generateStatusMarkdown('');
    expect(status).toEqual('');
  });
});

describe('generateLinkMarkdown', () => {
  test('Should return markdown link', () => {
    const link = generateLinkMarkdown('link', 'url');
    expect(link).toEqual('[link](url)');
  });
});

describe('generateExpandableAreaMarkdown', () => {
  test('Should return markdown expandable area', () => {
    const area = generateExpandableAreaMarkdown('header', 'body');
    expect(area).toEqual('<details><summary>header</summary>\nbody</details>\n\n');
  });
});
