import { EOL } from 'os';
import { format } from 'date-fns';
import { summary } from '@actions/core';
import { SummaryTableRow } from '@actions/core/lib/summary';
import { Status } from '../../helper/enums';
import { logger } from '../../helper/logger';
import { joinUrl } from '../../helper/url';
import { AnalysisResult, Condition, ConditionDetails, ExtendedAnnotation, Gate } from '../../helper/interfaces';
import { generateComment, generateExpandableAreaMarkdown, generateItalic, generateStatusMarkdown } from './markdown';
import { githubConfig, ticsConfig } from '../../configuration/config';
import { getCurrentStepPath } from '../../github/runs';

const capitalize = (s: string): string => s && s[0].toUpperCase() + s.slice(1);

export async function createSummaryBody(analysisResult: AnalysisResult): Promise<string> {
  logger.header('Creating summary.');
  setSummaryHeader(getStatus(analysisResult.passed, analysisResult.passedWithWarning));

  analysisResult.projectResults.forEach(projectResult => {
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

    const unpostableAnnotations = projectResult.annotations.filter(r => !r.postable);
    if (unpostableAnnotations.length > 0) {
      summary.addRaw(createUnpostableAnnotationsDetails(unpostableAnnotations));
    }

    summary.addRaw(createFilesSummary(projectResult.analyzedFiles));
  });
  await setSummaryFooter();

  logger.info('Created summary.');

  return summary.stringify();
}

/**
 * Creates a summary of all errors (and warnings optionally) to comment in a pull request.
 * @param errorList list containing all the errors found in the TICS run.
 * @param warningList list containing all the warnings found in the TICS run.
 * @returns string containing the error summary.
 */
export async function createErrorSummaryBody(errorList: string[], warningList: string[]): Promise<string> {
  logger.header('Creating summary.');

  setSummaryHeader(Status.FAILED);

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
  await setSummaryFooter();

  logger.info('Created summary.');
  return summary.stringify();
}

/**
 * Create a summary body for when no files had to be analyzed.
 * @param message Message to display in the body of the comment.
 * @returns string containing the error summary.
 */
export async function createNothingAnalyzedSummaryBody(message: string): Promise<string> {
  logger.header('Creating summary.');

  setSummaryHeader(Status.PASSED);

  summary.addRaw(message);
  await setSummaryFooter();

  logger.info('Created summary.');
  return summary.stringify();
}

function setSummaryHeader(status: Status) {
  summary.addHeading('TICS Quality Gate');
  summary.addHeading(generateStatusMarkdown(status, true), 3);
}

async function setSummaryFooter() {
  summary.addEOL();
  summary.addRaw('<h2></h2>');
  summary.addRaw(generateItalic(await getCurrentStepPath(), 'Workflow / Job / Step'), true);
  summary.addRaw(generateComment(githubConfig.getCommentIdentifier()));
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
 * Creates a summary of all the review comments that could not be posted
 * @param unpostableAnnotations Review comments that could not be posted.
 * @returns Summary of all the review comments that could not be posted.
 */
// Exported for testing
export function createUnpostableAnnotationsDetails(unpostableAnnotations: ExtendedAnnotation[]): string {
  const label = 'Quality gate failures that cannot be annotated in <b>Files Changed</b>';
  let body = '';
  let previousPath = '';

  unpostableAnnotations.forEach(reviewComment => {
    const path = reviewComment.path ?? '';
    const displayCount = reviewComment.displayCount ?? '';
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
    previousPath = reviewComment.path ?? '';
  });
  body += '</table>';
  return generateExpandableAreaMarkdown(label, body);
}
