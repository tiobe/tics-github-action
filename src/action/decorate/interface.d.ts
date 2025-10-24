import { Condition } from '../../viewer/interfaces';

export interface GroupedConditions {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
  conditions: Condition[];
  blockingIssueCount: number;
  deferredIssueCount: number;
}
