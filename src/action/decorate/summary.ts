import { EOL } from 'os';
import { format } from 'date-fns';
import { summary } from '@actions/core';
import { SummaryTableRow } from '@actions/core/lib/summary';
import { Status } from '../../helper/enums';
import { logger } from '../../helper/logger';
import { joinUrl } from '../../helper/url';
import { AnalysisResult, ProjectResult } from '../../helper/interfaces';
import { generateComment, generateExpandableAreaMarkdown, generateItalic, generateStatusMarkdown } from './markdown';
import { githubConfig, ticsConfig } from '../../configuration/config';
import { getCurrentStepPath } from '../../github/runs';
import { GroupedConditions } from './interface';
import { AbstractCondition, Condition, ConditionDetails, ExtendedAnnotation } from '../../viewer/interfaces';
import { ViewerFeature, viewerVersion } from '../../viewer/version';

const capitalize = (s: string): string => s && s[0].toUpperCase() + s.slice(1);

export async function createSummaryBody(analysisResult: AnalysisResult): Promise<string> {
  logger.header('Creating summary.');
  setSummaryHeader(getStatus(analysisResult.passed, analysisResult.passedWithWarning));

  for (const projectResult of analysisResult.projectResults) {
    const groupedConditions = groupConditions(projectResult);
    summary.addHeading(projectResult.project, 2);

    for (const group of groupedConditions) {
      if (await viewerVersion.viewerSupports(ViewerFeature.NEW_ANNOTATIONS)) {
        newConditionsView(group);
      } else {
        oldConditionsView(group);
      }
    }

    summary.addEOL();
    summary.addLink('See the results in the TICS Viewer', projectResult.explorerUrl);

    const unpostableAnnotations = projectResult.annotations.filter(r => !r.postable);
    if (unpostableAnnotations.length > 0) {
      summary.addRaw(createUnpostableAnnotationsDetails(unpostableAnnotations));
    }

    summary.addRaw('<h2></h2>');
    summary.addRaw(createFilesSummary(projectResult.analyzedFiles));
  }
  await setSummaryFooter();

  logger.info('Created summary.');

  return summary.stringify();
}

function newConditionsView(group: GroupedConditions): void {
  summary.addRaw(`<details><summary><h3>${getConditionHeading(group)}</h3></summary>`, true);

  for (const condition of group.conditions) {
    const statusMarkdown = generateStatusMarkdown(getStatus(condition.passed, condition.passedWithWarning));
    if (condition.details && condition.details.items.length > 0) {
      summary.addRaw(`${statusMarkdown}${condition.message}`, true);
      createConditionTables(condition.details).forEach(table => summary.addTable(table));
    } else {
      summary.addRaw(`${EOL}${statusMarkdown}${condition.message}`, true);
    }
  }
  summary.addRaw('</details>', true);
}

function oldConditionsView(group: GroupedConditions): void {
  summary.addHeading(getConditionHeading(group), 3);

  for (const condition of group.conditions) {
    const statusMarkdown = generateStatusMarkdown(getStatus(condition.passed, condition.passedWithWarning));
    if (condition.details && condition.details.items.length > 0) {
      summary.addRaw(`${EOL}<details><summary>${statusMarkdown}${condition.message}</summary>${EOL}`);
      summary.addBreak();
      createConditionTables(condition.details).forEach(table => summary.addTable(table));
      summary.addRaw('</details>', true);
    } else {
      summary.addRaw(`${EOL}${statusMarkdown}${condition.message}`, true);
    }
  }
}

export function groupConditions(projectResult: ProjectResult): GroupedConditions[] {
  const conditions = projectResult.qualityGate.gates.flatMap(g => g.conditions);

  const groupedMap = new Map<string | undefined, GroupedConditions>();
  for (const condition of conditions) {
    const group = groupedMap.get(condition.metricGroup);
    const blockingIssues = condition.details?.items.map(c => c.data.actualValue.value).reduce(sum, 0) ?? 0;
    const deferredIssues =
      condition.details?.items
        .map(c => c.data.blockingAfter?.value)
        .filter(c => c !== undefined)
        .reduce(sum, 0) ?? 0;

    if (group) {
      group.conditions.push(condition);
      group.blockingIssueCount += blockingIssues;
      group.deferredIssueCount += deferredIssues;
    } else {
      groupedMap.set(condition.metricGroup, {
        metricGroup: condition.metricGroup,
        passed: false, // just a placeholder
        passedWithWarning: false, // just a placeholder
        conditions: [condition],
        blockingIssueCount: blockingIssues,
        deferredIssueCount: deferredIssues
      });
    }
  }
  const grouped = Array.from(groupedMap.values());

  // sort conditions
  for (const group of grouped) {
    group.conditions.sort(sortConditions);
    // update passed based on most severe condition
    if (conditions.length > 0) {
      group.passed = group.conditions[0].passed;
      group.passedWithWarning = group.conditions[0].passedWithWarning;
    }
  }
  // sort groups
  return grouped.sort(sortConditions);
}

function sum(partial: number, current: number): number {
  return partial + current;
}

/**
 * Sort condition(group)s: failed, passed with warnings, passed
 */
function sortConditions(a: AbstractCondition, b: AbstractCondition): number {
  const rank = (item: AbstractCondition) => {
    if (!item.passed) return 0;
    if (item.passedWithWarning) return 1;
    return 2;
  };

  return rank(a) - rank(b);
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

function getConditionHeading(group: GroupedConditions): string {
  if (!group.metricGroup) {
    return getNoMetricGroupHeading(group.conditions);
  }
  if (group.blockingIssueCount > 0) {
    return `${group.metricGroup ?? ''}: ${generateStatusMarkdown(getStatus(group.passed, group.passedWithWarning), false)}${group.blockingIssueCount.toString()} Blocking ${getSingularOrPlural('Issue', group.blockingIssueCount)}`;
  } else if (group.deferredIssueCount > 0) {
    return `${group.metricGroup ?? ''}: ${generateStatusMarkdown(getStatus(group.passed, group.passedWithWarning), false)}${group.deferredIssueCount.toString()} Blocking-after ${getSingularOrPlural('Issue', group.deferredIssueCount)}`;
  }
  return `${group.metricGroup ?? ''}: ${generateStatusMarkdown(getStatus(group.passed, group.passedWithWarning), true)}`;
}

function getSingularOrPlural(string: string, howMany: number): string {
  return `${string}${howMany === 1 ? '' : 's'}`;
}

function getNoMetricGroupHeading(conditions: Condition[]): string {
  const countPassedConditions = conditions.filter(c => c.passed).length;
  const countFailedConditions = conditions.filter(c => !c.passed).length;

  return `Conditions: ${countFailedConditions.toString()} Failed, ${countPassedConditions.toString()} Passed`;
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
    const rows: SummaryTableRow[] = [
      [
        {
          data: capitalize(itemType),
          header: true,
          rowspan: '2'
        },
        {
          data: 'Issues',
          header: true,
          colspan: String(1 + (details.dataKeys.absValue ? 1 : 0) + (details.dataKeys.blockingAfter ? 1 : 0))
        }
      ]
    ];
    const titleRow: SummaryTableRow = [];
    if (details.dataKeys.absValue) {
      titleRow.push({
        data: `:beetle: ${details.dataKeys.absValue.title}`,
        header: true
      });
    }
    titleRow.push({
      data: `:x: ${details.dataKeys.actualValue.title}`,
      header: true
    });
    if (details.dataKeys.blockingAfter) {
      titleRow.push({
        data: `:warning: ${details.dataKeys.blockingAfter.title}`,
        header: true
      });
    }
    rows.push(titleRow);

    details.items
      .filter(item => item.itemType === itemType)
      .forEach(item => {
        const dataRow: SummaryTableRow = [`${EOL}${EOL}<a href="${joinUrl(ticsConfig.displayUrl, item.link)}">${item.name}</a>${EOL}${EOL}`];

        if (item.data.absValue) {
          dataRow.push(`<a href="${joinUrl(ticsConfig.displayUrl, item.data.absValue.link)}">${item.data.absValue.formattedValue}</a>`);
        } else if (details.dataKeys.absValue) {
          dataRow.push('-');
        }

        dataRow.push(`<a href="${joinUrl(ticsConfig.displayUrl, item.data.actualValue.link)}">${item.data.actualValue.formattedValue}</a>`);

        if (item.data.blockingAfter) {
          dataRow.push(`<a href="${joinUrl(ticsConfig.displayUrl, item.data.blockingAfter.link)}">${item.data.blockingAfter.formattedValue}</a>`);
        } else if (details.dataKeys.blockingAfter) {
          dataRow.push('-');
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
    const path = reviewComment.path;
    const displayCount = reviewComment.displayCount ?? '';

    let icon = '';
    let blocking = '';
    switch (reviewComment.blocking?.state) {
      case 'no':
        icon = ':beetle:';
        blocking = 'Non-Blocking';
        break;
      case 'after':
        icon = ':warning:';
        blocking = `Blocking after${reviewComment.blocking.after ? ` ${format(reviewComment.blocking.after, 'yyyy-MM-dd')}` : ''}`;
        break;
      case 'yes':
      default:
        icon = ':x:';
        blocking = 'Blocking';
        break;
    }

    if (previousPath === '') {
      body += `<table><tr><th colspan='4'>${path}</th></tr>`;
    } else if (previousPath !== path) {
      body += `</table><table><tr><th colspan='4'>${path}</th></tr>`;
    }
    body += `<tr><td>${icon}</td><td>${blocking}</td><td><b>Line:</b> ${reviewComment.line.toString()}`;
    body += reviewComment.level ? `<br><b>Level:</b> ${reviewComment.level.toString()}` : '';
    body += reviewComment.category ? `<br><b>Category:</b> ${reviewComment.category}` : '';
    body += `</td><td><b>${reviewComment.type} violation:</b> ${reviewComment.rule ?? ''} <b>${displayCount}</b><br>${reviewComment.msg}</td></tr>`;
    previousPath = reviewComment.path;
  });
  body += '</table>';
  return generateExpandableAreaMarkdown(label, body);
}
