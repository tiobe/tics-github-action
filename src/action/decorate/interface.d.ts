import { Condition } from '../../helper/interfaces';

export interface GroupedConditions {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
  conditions: Condition[];
}
