import { Condition } from '../../viewer/interfaces';

export interface GroupedConditions {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
  conditions: Condition[];
  amountOfBlockingIssues: number;
  amountOfDeferredIssues: number;
}
