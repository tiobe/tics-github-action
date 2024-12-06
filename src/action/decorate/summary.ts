import { EOL } from 'os';
import { format } from 'date-fns';
import { range } from 'underscore';
import { summary } from '@actions/core';
import { SummaryTableRow } from '@actions/core/lib/summary';

import { ChangedFile } from '../../github/interfaces';
import { Status } from '../../helper/enums';
import { logger } from '../../helper/logger';
import { joinUrl } from '../../helper/url';
import {
  AnalysisResult,
  Condition,
  ConditionDetails,
  ExtendedAnnotation,
  Gate,
  TicsReviewComment,
  TicsReviewComments
} from '../../helper/interfaces';
import { generateExpandableAreaMarkdown, generateStatusMarkdown } from './markdown';
import { githubConfig, ticsConfig } from '../../configuration/config';

const capitalize = (s: string): string => s && String(s[0]).toUpperCase() + String(s).slice(1);

export function createSummaryBody(analysisResult: AnalysisResult): string {
  logger.header('Creating summary.');
  summary.addHeading('TICS Quality Gate');
  summary.addHeading(generateStatusMarkdown(getStatus(analysisResult.passed, analysisResult.passedWithWarning), true), 3);

  analysisResult.projectResults.forEach(projectResult => {
    if (projectResult.qualityGate) {
      const failedOrWarnConditions = extractFailedOrWarningConditions(projectResult.qualityGate.gates);

      summary.addHeading(projectResult.project, 2);
      summary.addHeading(getConditionHeading(failedOrWarnConditions), 3);

      failedOrWarnConditions.forEach(condition => {
        const statusMarkdown = generateStatusMarkdown(getStatus(condition.passed, condition.passedWithWarning));
        if (condition.details && condition.details.items.length > 0) {
          summary.addRaw(`${EOL}<details><summary>${statusMarkdown}${condition.message}</summary>${EOL}`);
          summary.addBreak();
          createConditionTables(condition.details).forEach(table => summary.addTable(table));
          summary.addRaw('</details>', true);
        } else {
          summary.addRaw(`${EOL}&nbsp;&nbsp; ${statusMarkdown}${condition.message}`, true);
        }
      });
      summary.addEOL();

      summary.addLink('See the results in the TICS Viewer', projectResult.explorerUrl);

      if (projectResult.reviewComments && projectResult.reviewComments.unpostable.length > 0) {
        summary.addRaw(createUnpostableAnnotationsDetails(projectResult.reviewComments.unpostable));
      }

      summary.addRaw(createFilesSummary(projectResult.analyzedFiles));
    }
  });

  logger.info('Created summary.');

  return summary.stringify();
}

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TICS run.
 * @param warningList list containing all the warnings found in the TICS run.
 * @returns string containing the error summary.
 */
export function createErrorSummaryBody(errorList: string[], warningList: string[]): string {
  logger.header('Creating summary.');

  summary.addHeading('TICS Quality Gate');
  summary.addHeading(generateStatusMarkdown(Status.FAILED, true), 3);

  if (errorList.length > 0) {
    summary.addHeading('The following errors have occurred during analysis:', 2);

    for (const error of errorList) {
      summary.addRaw(`:x: ${error}${EOL}${EOL}`);
    }
  }

  if (warningList.length > 0 && githubConfig.debugger) {
    summary.addBreak();
    summary.addHeading('The following warnings have occurred during analysis:', 2);

    for (const warning of warningList) {
      summary.addRaw(`:warning: ${warning}${EOL}${EOL}`);
    }
  }

  logger.info('Created summary.');
  return summary.stringify();
}

/**
 * Create a summary body for when no files had to be analyzed.
 * @param message Message to display in the body of the comment.
 * @returns string containing the error summary.
 */
export function createNothingAnalyzedSummaryBody(message: string): string {
  logger.header('Creating summary.');

  summary.addHeading('TICS Quality Gate');
  summary.addHeading(generateStatusMarkdown(Status.PASSED, true), 3);

  summary.addRaw(message);

  logger.info('Created summary.');
  return summary.stringify();
}

function getConditionHeading(failedOrWarnConditions: Condition[]): string {
  const countFailedConditions = failedOrWarnConditions.filter(c => !c.passed).length;
  const countWarnConditions = failedOrWarnConditions.filter(c => c.passed && c.passedWithWarning).length;
  const header = [];
  if (countFailedConditions > 0) {
    header.push(`${countFailedConditions.toString()} Condition(s) failed`);
  }
  if (countWarnConditions > 0) {
    header.push(`${countWarnConditions.toString()} Condition(s) passed with warning`);
  }

  if (failedOrWarnConditions.length === 0) {
    header.push('All conditions passed');
  }

  return header.join(', ');
}

function getStatus(passed: boolean, passedWithWarning?: boolean) {
  if (!passed) {
    return Status.FAILED;
  } else if (passedWithWarning) {
    return Status.PASSED_WITH_WARNING;
  } else {
    return Status.PASSED;
  }
}

/**
 * Extract conditions that have failed or have passed with warning(s)
 * @param gates Gates of a quality gate
 * @returns Extracted conditions
 */
function extractFailedOrWarningConditions(gates: Gate[]): Condition[] {
  let failedOrWarnConditions: Condition[] = [];

  gates.forEach(gate => {
    failedOrWarnConditions = failedOrWarnConditions.concat(gate.conditions.filter(c => !c.passed || c.passedWithWarning));
  });

  return failedOrWarnConditions.sort((a, b) => Number(a.passed) - Number(b.passed));
}

/**
 * Creates a list of all the files analyzed.
 * @param fileList list of files.
 * @returns Dropdown with all the files analyzed.
 */
export function createFilesSummary(fileList: string[]): string {
  const header = 'The following files have been checked for this project';
  let body = '<ul>';
  fileList.sort((a, b) => a.localeCompare(b));
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
function createConditionTables(details: ConditionDetails): SummaryTableRow[][] {
  return details.itemTypes.map(itemType => {
    const rows: SummaryTableRow[] = [];
    const titleRow: SummaryTableRow = [
      {
        data: capitalize(itemType),
        header: true
      },
      {
        data: details.dataKeys.actualValue.title,
        header: true
      }
    ];
    if (details.dataKeys.blockingAfter) {
      titleRow.push({
        data: details.dataKeys.blockingAfter.title,
        header: true
      });
    }
    rows.push(titleRow);

    details.items
      .filter(item => item.itemType === itemType)
      .forEach(item => {
        const dataRow: SummaryTableRow = [
          `${EOL}${EOL}[${item.name}](${joinUrl(ticsConfig.displayUrl, item.link)})${EOL}${EOL}`,
          item.data.actualValue.formattedValue
        ];

        if (item.data.blockingAfter) {
          dataRow.push(item.data.blockingAfter.formattedValue);
        } else if (details.dataKeys.blockingAfter) {
          dataRow.push('0');
        }

        rows.push(dataRow);
      });
    return rows;
  });
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

  const unpostable: ExtendedAnnotation[] = [];
  const postable: TicsReviewComment[] = [];

  groupedAnnotations
    .filter(a => a.blocking?.state !== 'no')
    .forEach(annotation => {
      const displayCount = annotation.count === 1 ? '' : `(${annotation.count.toString()}x) `;
      const title = annotation.instanceName + (annotation.rule ? `: ${annotation.rule}` : '');

      if (githubConfig.event.isPullRequest) {
        if (changedFiles.find(c => annotation.fullPath.includes(c.filename))) {
          const reviewComment = {
            blocking: annotation.blocking?.state,
            title: title,
            body: createBody(annotation, displayCount),
            path: annotation.path,
            line: annotation.line
          };
          logger.debug(`Postable: ${JSON.stringify(reviewComment)}`);
          postable.push(reviewComment);
        } else {
          annotation.displayCount = displayCount;
          logger.debug(`Unpostable: ${JSON.stringify(annotation)}`);
          unpostable.push(annotation);
        }
      } else if (annotation.diffLines?.includes(annotation.line)) {
        const reviewComment = {
          blocking: annotation.blocking?.state,
          title: title,
          body: createBody(annotation, displayCount),
          path: annotation.path,
          line: annotation.line
        };
        logger.debug(`Postable: ${JSON.stringify(reviewComment)}`);
        postable.push(reviewComment);
      } else {
        annotation.displayCount = displayCount;
        logger.debug(`Unpostable: ${JSON.stringify(annotation)}`);
        unpostable.push(annotation);
      }
    });
  logger.info('Created review comments from annotations.');
  return { postable: postable, unpostable: unpostable };
}

function createBody(annotation: ExtendedAnnotation, displayCount: string) {
  let body = '';
  if (annotation.blocking?.state === 'yes') {
    body += `Blocking${EOL}`;
  } else if (annotation.blocking?.state === 'after' && annotation.blocking.after) {
    body += `Blocking after: ${format(annotation.blocking.after, 'yyyy-MM-dd')}${EOL}`;
  }

  const secondLine: string[] = [];
  if (annotation.level) {
    secondLine.push(`Level: ${annotation.level.toString()}`);
  }
  if (annotation.category) {
    secondLine.push(`Category: ${annotation.category}`);
  }

  body += `Line: ${annotation.line.toString()}: ${displayCount}${annotation.msg}`;
  body += secondLine.length > 0 ? `${EOL}${secondLine.join(', ')}` : '';
  body += annotation.ruleHelp ? `${EOL}Rule-help: ${annotation.ruleHelp}` : '';

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
  const groupedAnnotations: ExtendedAnnotation[] = [];
  annotations.forEach(annotation => {
    const file = changedFiles.find(c => annotation.fullPath.includes(c.filename));
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
      annotation.diffLines = file ? fetchDiffLines(file) : [];
      annotation.path = file ? file.filename : annotation.fullPath.split('/').slice(4).join('/');
      groupedAnnotations.push(annotation);
    } else if (groupedAnnotations[index].gateId === annotation.gateId) {
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
  const label = 'Quality gate failures that cannot be annotated in <b>Files Changed</b>';
  let body = '';
  let previousPath = '';

  unpostableReviewComments.forEach(reviewComment => {
    const path = reviewComment.path ? reviewComment.path : '';
    const displayCount = reviewComment.displayCount ? reviewComment.displayCount : '';
    const icon = reviewComment.blocking?.state === 'after' ? ':warning:' : ':x:';
    const blocking =
      reviewComment.blocking?.state === 'after' && reviewComment.blocking.after
        ? `Blocking after ${format(reviewComment.blocking.after, 'yyyy-MM-dd')}`
        : 'Blocking';

    if (previousPath === '') {
      body += `<table><tr><th colspan='4'>${path}</th></tr>`;
    } else if (previousPath !== path) {
      body += `</table><table><tr><th colspan='4'>${path}</th></tr>`;
    }
    body += `<tr><td>${icon}</td><td>${blocking}</td><td><b>Line:</b> ${reviewComment.line.toString()}`;
    body += reviewComment.level ? `<br><b>Level:</b> ${reviewComment.level.toString()}` : '';
    body += reviewComment.category ? `<br><b>Category:</b> ${reviewComment.category}` : '';
    body += `</td><td><b>${reviewComment.type} violation:</b> ${reviewComment.rule ?? ''} <b>${displayCount}</b><br>${reviewComment.msg}</td></tr>`;
    previousPath = reviewComment.path ? reviewComment.path : '';
  });
  body += '</table>';
  return generateExpandableAreaMarkdown(label, body);
}
