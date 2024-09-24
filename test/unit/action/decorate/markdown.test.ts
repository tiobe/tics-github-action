import { describe, expect, it } from '@jest/globals';
import { Status } from '../../../../src/helper/enums';
import { generateExpandableAreaMarkdown, generateStatusMarkdown } from '../../../../src/action/decorate/markdown';

describe('generateStatusMarkdown', () => {
  it('should return failed without prefix', () => {
    const status = generateStatusMarkdown(Status.FAILED);

    expect(status).toBe(':x: ');
  });

  it('should return failed with prefix', () => {
    const status = generateStatusMarkdown(Status.FAILED, true);

    expect(status).toBe(':x: Failed ');
  });

  it('should return passed without prefix', () => {
    const status = generateStatusMarkdown(Status.PASSED);

    expect(status).toBe(':heavy_check_mark: ');
  });

  it('should return passed with prefix', () => {
    const status = generateStatusMarkdown(Status.PASSED, true);

    expect(status).toBe(':heavy_check_mark: Passed ');
  });

  it('should return warning without prefix', () => {
    const status = generateStatusMarkdown(Status.WARNING);

    expect(status).toBe(':warning: ');
  });

  it('should return warning with prefix', () => {
    const status = generateStatusMarkdown(Status.WARNING, true);

    expect(status).toBe(':warning: Skipped ');
  });

  it('should return skipped without prefix', () => {
    const status = generateStatusMarkdown(Status.SKIPPED);

    expect(status).toBe(':warning: ');
  });

  it('should return skipped with prefix', () => {
    const status = generateStatusMarkdown(Status.SKIPPED, true);

    expect(status).toBe(':warning: Skipped ');
  });
});

describe('generateExpandableAreaMarkdown', () => {
  it('should return markdown expandable area', () => {
    const area = generateExpandableAreaMarkdown('header', 'body');

    expect(area).toBe('<details><summary>header</summary>\nbody</details>\n\n');
  });
});
