import { Status } from './enums';
import { markdownTable } from 'markdown-table';

/**
 * Generates a link with text in markdown.
 * @param text Text for the link.
 * @param link The actual link to.
 * @returns Annotated link in markdown.
 */
export function generateLinkMarkdown(text: string, link: string): string {
  return `[${text}](${link})`;
}

/**
 * Generates a status symbol with optional suffix.
 * @param status The status. (Either 'passed', 'failed', 'skipped' or 'warning').
 * @param hasSuffix if the status needs a suffix for the issue. (Default is false).
 * @returns Status symbol in markdown.
 */
export function generateStatusMarkdown(status: string, hasSuffix: boolean = false): string {
  switch (status) {
    case Status[0]:
      return ':x: ' + (hasSuffix ? 'Failed ' : '');
    case Status[1]:
      return ':heavy_check_mark: ' + (hasSuffix ? 'Passed ' : '');
    case Status[2]:
    case Status[3]:
      return ':warning: ' + (hasSuffix ? 'Skipped ' : '');
    default:
      return '';
  }
}

/**
 * Generates a dropdown item in markdown.
 * @param header Text to show the dropdown for.
 * @param body The body of the dropdown.
 * @returns Dropdown item in markdown.
 */
export function generateExpandableAreaMarkdown(header: any, body: any): string {
  return `<details><summary>${header}</summary>\n${body}</details>\n\n`;
}

/**
 * Generates a table in markdown.
 * @param headers headers of the table.
 * @param cells cells of the table.
 * @returns Table in markdown.
 */
export function generateTableMarkdown(headers: any[], cells: any[]) {
  return `\n${markdownTable([...headers, ...cells])}\n`;
}
