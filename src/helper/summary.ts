import { summary } from '@actions/core';
import { SummaryTableRow } from '@actions/core/lib/summary';
import { generateExpandableAreaMarkdown, generateStatusMarkdown } from './markdown';
import { AnalysisResults, Annotation, Condition, ExtendedAnnotation, Gate, TicsReviewComment, TicsReviewComments } from './interfaces';
import { ChangedFile } from '../github/interfaces';
import { githubConfig, viewerUrl } from '../configuration';
import { Status } from './enums';
import { range } from 'underscore';
import { logger } from './logger';

export function createSummaryBody(analysisResults: AnalysisResults): string {
  logger.header('Creating summary.');
  summary.addHeading('TICS Quality Gate');
  summary.addHeading(`${generateStatusMarkdown(analysisResults.passed ? Status.PASSED : Status.FAILED, true)}`, 3);

  analysisResults.projectResults.forEach(projectResult => {
    if (projectResult.qualityGate) {
      const failedConditions = extractFailedConditions(projectResult.qualityGate.gates);

      summary.addHeading(projectResult.project, 2);
      summary.addHeading(`${failedConditions.length} Condition(s) failed`, 3);
      failedConditions.forEach(condition => {
        if (condition.details && condition.details.items.length > 0) {
          summary.addRaw(`\n<details><summary>:x: ${condition.message}</summary>\n`);
          summary.addBreak();
          summary.addTable(createConditionTable(condition));
          summary.addRaw('</details>', true);
        } else {
          summary.addRaw(`\n&nbsp;&nbsp;&nbsp;:x: ${condition.message}`, true);
        }
      });
      summary.addEOL();

      summary.addLink('See the results in the TICS Viewer', projectResult.explorerUrl);

      if (projectResult.reviewComments) {
        summary.addRaw(createUnpostableAnnotationsDetails(projectResult.reviewComments.unpostable));
      }

      summary.addRaw(createFilesSummary(projectResult.analyzedFiles));
    }
  });

  logger.info('Created summary.');

  return summary.stringify();
}

function extractFailedConditions(gates: Gate[]): Condition[] {
  let failedConditions: Condition[] = [];

  gates.forEach(gate => {
    failedConditions = failedConditions.concat(gate.conditions.filter(c => !c.passed));
  });

  return failedConditions;
}

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TICS run.
 * @param warningList list containing all the warnings found in the TICS run.
 * @returns string containing the error summary.
 */
export function createErrorSummary(errorList: string[], warningList: string[]): string {
  let summary = '<h1>TICS Quality Gate</h1>\r\n\r\n### :x: Failed';

  if (errorList.length > 0) {
    summary += '\r\n\r\n #### The following errors have occurred during analysis:\r\n\r\n';
    errorList.forEach(error => (summary += `> :x: ${error}\r\n`));
  }
  if (warningList.length > 0 && githubConfig.debugger) {
    summary += '\r\n\r\n #### The following warnings have occurred during analysis:\r\n\r\n';
    warningList.forEach(warning => (summary += `> :warning: ${warning}\r\n`));
  }

  return summary;
}

/**
 * Creates a list of all the files analyzed.
 * @param fileList list of files.
 * @returns Dropdown with all the files analyzed.
 */
export function createFilesSummary(fileList: string[]): string {
  let header = 'The following files have been checked for this project';
  let body = '<ul>';
  fileList.sort();
  fileList.forEach(file => {
    body += `<li>${file}</li>`;
  });
  body += '</ul>';
  return generateExpandableAreaMarkdown(header, body);
}

/**
 * Creates a table containing a summary for all conditions.
 * @param conditions Conditions of the quality gate
 * @returns Table containing a summary for all conditions
 */
function createConditionTable(condition: Condition): SummaryTableRow[] {
  if (!condition.details) return [];

  let rows: SummaryTableRow[] = [
    [
      {
        data: 'File',
        header: true
      },
      {
        data: condition.details.dataKeys.actualValue.title,
        header: true
      }
    ]
  ];
  condition.details.items
    .filter(item => item.itemType === 'file')
    .forEach(item => {
      rows.push([`\n\n[${item.name}](${viewerUrl}/${item.link})\n\n`, item.data.actualValue.formattedValue]);
    });

  return rows;
}

/**
 * Groups the annotations and creates review comments for them.
 * @param annotations Annotations retrieved from the viewer.
 * @param changedFiles List of files changed in the pull request.
 * @returns List of the review comments.
 */
export function createReviewComments(annotations: ExtendedAnnotation[], changedFiles: ChangedFile[]): TicsReviewComments {
  logger.info('Creating review comments from annotations.');

  const sortedAnnotations = sortAnnotations(annotations);
  const groupedAnnotations = groupAnnotations(sortedAnnotations, changedFiles);

  let unpostable: ExtendedAnnotation[] = [];
  let postable: TicsReviewComment[] = [];

  groupedAnnotations.forEach(annotation => {
    const displayCount = annotation.count === 1 ? '' : `(${annotation.count}x) `;
    if (annotation.diffLines?.includes(annotation.line)) {
      logger.debug(`Postable: ${JSON.stringify(annotation)}`);
      postable.push({
        title: `${annotation.instanceName}: ${annotation.rule}`,
        body: createBody(annotation, displayCount),
        path: annotation.path,
        line: annotation.line
      });
    } else {
      annotation.displayCount = displayCount;
      logger.debug(`Unpostable: ${JSON.stringify(annotation)}`);
      unpostable.push(annotation);
    }
  });
  logger.info('Created review comments from annotations.');
  return { postable: postable, unpostable: unpostable };
}

function createBody(annotation: Annotation, displayCount: string) {
  let body = `Line: ${annotation.line}: ${displayCount}${annotation.msg}`;
  body += `\r\nLevel: ${annotation.level}, Category: ${annotation.category}`;
  body += annotation.ruleHelp ? `\r\nRule help: ${annotation.ruleHelp}` : '';

  return body;
}

/**
 * Sorts annotations based on file name and line number.
 * @param annotations annotations returned by TICS analyzer.
 * @returns sorted anotations.
 */
function sortAnnotations(annotations: ExtendedAnnotation[]): ExtendedAnnotation[] {
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
function groupAnnotations(annotations: ExtendedAnnotation[], changedFiles: ChangedFile[]): ExtendedAnnotation[] {
  let groupedAnnotations: ExtendedAnnotation[] = [];
  annotations.forEach(annotation => {
    const file = changedFiles.find(c => annotation.fullPath.includes(c.filename));
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
      annotation.diffLines = file ? fetchDiffLines(file) : [];
      annotation.path = file ? file.filename : annotation.fullPath.split('/').slice(4).join('/');
      groupedAnnotations.push(annotation);
    } else {
      if (groupedAnnotations[index].gateId === annotation.gateId) {
        groupedAnnotations[index].count += annotation.count;
      }
    }
  });
  return groupedAnnotations;
}

/**
 * Finds all lines that are shown in GitHub diff chunk.
 * @param file file to search the lines changed chunk for.
 * @returns List of all the lines in the diff chunk.
 */
function fetchDiffLines(file: ChangedFile): number[] {
  const regex = /\+(\d+),(\d+)+/g;
  let diffLines: number[] = [];

  if (!file.patch) return [];

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
function findAnnotationInList(list: ExtendedAnnotation[], annotation: ExtendedAnnotation) {
  return list.findIndex(a => {
    return (
      a.fullPath === annotation.fullPath &&
      a.type === annotation.type &&
      a.line === annotation.line &&
      a.rule === annotation.rule &&
      a.level === annotation.level &&
      a.category === annotation.category &&
      a.msg === annotation.msg
    );
  });
}

/**
 * Creates a summary of all the review comments that could not be posted
 * @param unpostableReviewComments Review comments that could not be posted.
 * @returns Summary of all the review comments that could not be posted.
 */
export function createUnpostableAnnotationsDetails(unpostableReviewComments: ExtendedAnnotation[]): string {
  let label = 'Quality gate failures that cannot be annotated in <b>Files Changed</b>';
  let body = '';
  let previousPath = '';

  unpostableReviewComments.forEach(reviewComment => {
    let path = reviewComment.path ? reviewComment.path : '';
    let displayCount = reviewComment.displayCount ? reviewComment.displayCount : '';
    if (previousPath === '') {
      body += `<table><tr><th colspan='3'>${path}</th></tr>`;
    } else if (previousPath !== path) {
      body += `</table><table><tr><th colspan='3'>${path}</th></tr>`;
    }
    body += `<tr><td>:warning:</td><td><b>Line:</b> ${reviewComment.line} <b>Level:</b> ${reviewComment.level}<br><b>Category:</b> ${reviewComment.category}</td><td><b>${reviewComment.type} violation:</b> ${reviewComment.rule} <b>${displayCount}</b><br>${reviewComment.msg}</td></tr>`;
    previousPath = reviewComment.path ? reviewComment.path : '';
  });
  body += '</table>';
  return generateExpandableAreaMarkdown(label, body);
}
