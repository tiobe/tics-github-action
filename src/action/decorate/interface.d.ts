import { AbstractCondition, Condition } from '../../viewer/interfaces.js';

export interface GroupedConditions extends AbstractCondition {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
  conditions: Condition[];
  blockingIssueCount: number;
  deferredIssueCount: number;
}

export type SummaryTableRow = (SummaryTableCell | string)[];
export interface SummaryTableCell {
  /**
   * Cell content
   */
  data: string;
  /**
   * Render cell as header
   * (optional) default: false
   */
  header?: boolean;
  /**
   * Number of columns the cell extends
   * (optional) default: '1'
   */
  colspan?: string;
  /**
   * Number of rows the cell extends
   * (optional) default: '1'
   */
  rowspan?: string;
}
