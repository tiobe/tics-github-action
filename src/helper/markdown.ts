import { Status } from './enums';

/**
 * Generates a status symbol with optional suffix.
 * @param status The status. (Either 'passed', 'failed', 'skipped' or 'warning').
 * @param hasSuffix if the status needs a suffix for the issue. (Default is false).
 * @returns Status symbol in markdown.
 */
export function generateStatusMarkdown(status: Status, hasSuffix = false): string {
  switch (status) {
    case Status.FAILED:
      return ':x: ' + (hasSuffix ? 'Failed ' : '');
    case Status.PASSED:
      return ':warning: ' + (hasSuffix ? 'Passed ' : '');
    case Status.PASSED_WITH_WARNING:
      return ':warning: ' + (hasSuffix ? 'Passed with warnings ' : '');
    case Status.SKIPPED:
    case Status.WARNING:
      return ':warning: ' + (hasSuffix ? 'Skipped ' : '');
  }
}

/**
 * Generates a dropdown item in markdown.
 * @param header Text to show the dropdown for.
 * @param body The body of the dropdown.
 * @returns Dropdown item in markdown.
 */
export function generateExpandableAreaMarkdown(header: string, body: string): string {
  return `<details><summary>${header}</summary>\n${body}</details>\n\n`;
}
