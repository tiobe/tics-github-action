import { generateExpandableAreaMarkdown, generateLinkMarkdown, generateStatusMarkdown, generateTableMarkdown } from '../../helper/markdown';
import { QualityGate, ReviewComment, ReviewComments } from '../../helper/interfaces';
import { ticsConfig, viewerUrl } from '../configuration';
import { Status } from '../../helper/enums';
import { range } from 'underscore';
import Logger from '../../helper/logger';

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TiCS run.
 * @param warningList list containing all the warnings found in the TiCS run.
 * @returns string containing the error summary.
 */
export function createErrorSummary(errorList: string[], warningList: string[]): string {
  let summary = '## TiCS Quality Gate\r\n\r\n### :x: Failed';

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
  return `${generateLinkMarkdown('See the results in the TiCS Viewer', url)}\n\n`;
}

/**
 * Creates a list of all the files analyzed.
 * @param fileList list of files.
 * @returns Dropdown with all the files analyzed.
 */
export function createFilesSummary(fileList: string[]): string {
  let header = 'The following files have been checked:';
  let body = '<ul>';
  fileList.sort();
  fileList.forEach(file => {
    body += `<li>${file}</li>`;
  });
  body += '</ul>';
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
  return `## TiCS Quality Gate\n\n### ${generateStatusMarkdown(Status[qualityGate.passed ? 1 : 0], true)}\n\n${qualityGateSummary}`;
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
      const headers = [['File', condition.details.dataKeys.actualValue.title]];
      const cells = condition.details.items
        .filter((item: any) => item.itemType === 'file')
        .map((item: any) => {
          return [generateLinkMarkdown(item.name, viewerUrl + '/' + item.link), item.data.actualValue.formattedValue];
        });
      conditionsTable = generateExpandableAreaMarkdown(conditionStatus, generateTableMarkdown(headers, cells));
    } else {
      conditionsTable += `${conditionStatus}\n\n\n`;
    }
  });
  return conditionsTable;
}

/**
 * Groups the annotations and creates review comments for them.
 * @param annotations Annotations retrieved from the viewer.
 * @param changedFiles List of files changed in the pull request.
 * @returns List of the review comments.
 */
export async function createReviewComments(annotations: any[], changedFiles: any[]): Promise<ReviewComments> {
  Logger.Instance.info('Creating review comments from annotations.');

  const sortedAnnotations = sortAnnotations(annotations);
  const groupedAnnotations = groupAnnotations(sortedAnnotations, changedFiles);

  let unpostable: ReviewComment[] = [];
  let postable: ReviewComment[] = [];

  groupedAnnotations.forEach(annotation => {
    const displayCount = annotation.count === 1 ? '' : `(${annotation.count}x) `;
    if (annotation.diffLines.includes(annotation.line)) {
      Logger.Instance.debug(`Postable: ${JSON.stringify(annotation)}`);
      postable.push({
        body: `:warning: **TiCS: ${annotation.type} violation: ${annotation.msg}** \r\n${displayCount}Line: ${annotation.line}, Rule: ${annotation.rule}, Level: ${annotation.level}, Category: ${annotation.category} \r\n`,
        path: annotation.path,
        line: annotation.line
      });
    } else {
      Logger.Instance.debug(`Unpostable: ${JSON.stringify(annotation)}`);
      annotation.displayCount = displayCount;
      unpostable.push(annotation);
    }
  });
  Logger.Instance.info('Created review comments from annotations.');
  return { postable: postable, unpostable: unpostable };
}

/**
 * Sorts annotations based on file name and line number.
 * @param annotations annotations returned by TiCS analyzer.
 * @returns sorted anotations.
 */
function sortAnnotations(annotations: any[]) {
  return annotations.sort((a, b) => {
    if (a.fullPath === b.fullPath) return a.line - b.line;
    return a.fullPath > b.fullPath ? 1 : -1;
  });
}

/**
 * Groups annotations by file. Excludes annotations for files that have not been changed.
 * @param annotations sorted annotations by file and line.
 * @param changedFiles List of files changed in the pull request.
 * @returns grouped annotations.
 */
function groupAnnotations(annotations: any[], changedFiles: any[]) {
  let groupedAnnotations: any[] = [];
  annotations.forEach(annotation => {
    const file = changedFiles.find(c => annotation.fullPath.includes(c.filename));
    if (!file) return;
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
      annotation.diffLines = fetchDiffLines(file);
      annotation.path = file.filename;
      groupedAnnotations.push(annotation);
    } else {
      groupedAnnotations[index].count += annotation.count;
    }
  });
  return groupedAnnotations;
}

/**
 * Finds all lines that are shown in GitHub diff chunk.
 * @param file file to search the lines changed chunk for.
 * @returns List of all the lines in the diff chunk.
 */
function fetchDiffLines(file: any) {
  const regex = /\+(\d+),(\d+)+/g;
  let diffLines: number[] = [];

  let match = regex.exec(file.patch);
  while (match !== null) {
    const startLine = parseInt(match[1]);
    const amountOfLines = parseInt(match[2]);
    diffLines = diffLines.concat(range(startLine, startLine + amountOfLines));
    match = regex.exec(file.patch);
  }

  return diffLines;
}

/**
 * Finds an annotation in a list and returns the index.
 * @param list List to find the annotation in.
 * @param annotation Annotation to find.
 * @returns The index of the annotation found or -1
 */
function findAnnotationInList(list: any[], annotation: any) {
  return list.findIndex(a => {
    return (
      a.fullPath === annotation.fullPath &&
      a.type === annotation.type &&
      a.line === annotation.line &&
      a.rule === annotation.rule &&
      a.level === annotation.level &&
      a.category === annotation.category &&
      a.message === annotation.message
    );
  });
}

/**
 * Creates a summary of all the review comments that could not be posted
 * @param unpostableReviewComments Review comments that could not be posted.
 * @returns Summary of all the review comments that could not be posted.
 */
export function createUnpostableReviewCommentsSummary(unpostableReviewComments: any[]) {
  let header = 'Quality gate failures that cannot be annotated in <b>Files Changed</b>:';
  let body = '';
  let previousPath = '';

  unpostableReviewComments.forEach(reviewComment => {
    if (previousPath === '') {
      body += `<table><tr><th colspan='3'>${reviewComment.path}</th></tr>`;
    } else if (previousPath !== reviewComment.path) {
      body += `</table><table><tr><th colspan='3'>${reviewComment.path}</th></tr>`;
    } else {
      body += `<tr><td>:warning:</td><td><b>Line:</b> ${reviewComment.line} <b>Level:</b> ${reviewComment.level}<br><b>Category:</b> ${reviewComment.category}</td><td><b>${reviewComment.type} violation:</b> ${reviewComment.rule} <b>${reviewComment.displayCount}</b><br>${reviewComment.msg}</td></tr>`;
    }
    previousPath = reviewComment.path;
  });
  body += '</table>';
  return generateExpandableAreaMarkdown(header, body);
}
