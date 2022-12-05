import { generateExpandableAreaMarkdown, generateLinkMarkdown, generateStatusMarkdown, generateTableMarkdown } from '../../helper/markdown';
import { QualityGate } from '../../helper/interfaces';
import { baseUrl, ticsConfig } from '../configuration';
import { Status } from '../../helper/enums';

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TiCS run.
 * @param warningList list containing all the warnings found in the TiCS run.
 * @returns string containing the error summary.
 */
export function createErrorSummary(errorList: string[], warningList: string[]): string {
  let summary = '## TICS Quality Gate\r\n\r\n### :x: Failed';

  if (errorList.length > 0) {
    summary += '\r\n\r\n #### The following errors have occurred during analysis:\r\n\r\n';
    errorList.forEach(error => (summary += `> :x: ${error}\r\n`));
  }
  if (warningList.length > 0 && ticsConfig.logLevel === 'debug') {
    summary += '\r\n\r\n #### The following warnings have occurred during analysis:\r\n\r\n';
    warningList.forEach(warning => (summary += `> :warning: ${warning}\r\n`));
  }

  return summary;
}

/**
 * Creates a markdown link summary.
 * @param url Url to the TiCS viewer analysis.
 * @returns Clickable link to the viewer analysis.
 */
export function createLinkSummary(url: string): string {
  return `${generateLinkMarkdown('See the results in the TICS Viewer', url)}\n\n`;
}

/**
 * Creates a list of all the files analyzed.
 * @param fileList list of files.
 * @returns Dropdown with all the files analyzed.
 */
export function createFilesSummary(fileList: string[]): string {
  let header = 'The following files have been checked:';
  let body = '';
  fileList.forEach(file => {
    body += `- ${file}<br>`;
  });
  return generateExpandableAreaMarkdown(header, body);
}

/**
 * Creates a quality gate summary for the TiCS analysis.
 * @param qualityGate quality gate retrieved from the TiCS viewer.
 * @returns Quality gate summary.
 */
export function createQualityGateSummary(qualityGate: QualityGate): string {
  let qualityGateSummary = '';

  qualityGate.gates.forEach(gate => {
    qualityGateSummary += `## ${gate.name}\n\n${createConditionsTable(gate.conditions)}`;
  });
  return `## TICS Quality Gate\n\n### ${generateStatusMarkdown(Status[qualityGate.passed ? 1 : 0], true)}\n\n${qualityGateSummary}`;
}

/**
 * Creates a table containing a summary for all conditions.
 * @param conditions Conditions of the quality gate
 * @returns Table containing a summary for all conditions
 */
function createConditionsTable(conditions: any[]) {
  let conditionsTable = '';
  conditions.forEach(condition => {
    if (condition.skipped) return;
    const conditionStatus = `${generateStatusMarkdown(Status[condition.passed ? 1 : 0], false)}  ${condition.message}`;

    if (condition.details && condition.details.items.length > 0) {
      const headers = ['File', condition.details.dataKeys.actualValue.title];
      const cells = condition.details.items
        .filter((item: any) => item.itemType === 'file')
        .map((item: any) => {
          return [generateLinkMarkdown(item.name, baseUrl + '/' + item.link), item.data.actualValue.formattedValue];
        });
      conditionsTable = generateExpandableAreaMarkdown(conditionStatus, generateTableMarkdown(headers, cells));
    } else {
      conditionsTable += `${conditionStatus}\n\n\n`;
    }
  });
  return conditionsTable;
}
