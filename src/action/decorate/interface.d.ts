import { AbstractCondition, Condition } from '../../viewer/interfaces';

export interface GroupedConditions extends AbstractCondition {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
  conditions: Condition[];
  blockingIssueCount: number;
  deferredIssueCount: number;
}
