/**
 * Used to identify a run in TICS api calls.
 */
export interface TicsRunIdentifier {
  project: string;
  date?: number;
  cdtoken?: string;
}

// Action defined interfaces
export interface FetchedAnnotation extends Annotation {
  path: string;
  line: number;
  count: number;
  gateId?: number;
  instanceName: string;
}

export interface ExtendedAnnotation extends FetchedAnnotation {
  displayCount?: string;
  postable: boolean;
}

// Viewer defined interfaces
export interface QualityGate {
  passed: boolean;
  passedWithWarning?: boolean;
  message: string;
  url: string;
  gates: Gate[];
  annotationsApiV1Links?: AnnotationApiLink[];
}

export interface Gate {
  passed: boolean;
  passedWithWarning?: boolean;
  name: string;
  conditions: Condition[];
}

export interface AbstractCondition {
  metricGroup?: string;
  passed: boolean;
  passedWithWarning?: boolean;
}

export interface Condition extends AbstractCondition {
  skipped?: boolean;
  error: boolean;
  message: string;
  details?: ConditionDetails;
  annotationsApiV1Links?: AnnotationApiLink[];
}

export interface Condition {
  passed: boolean;
  passedWithWarning?: boolean;
  skipped?: boolean;
  error: boolean;
  message: string;
  metricGroup?: string;
  details?: ConditionDetails;
  annotationsApiV1Links?: AnnotationApiLink[];
}

export interface ConditionDetails {
  itemTypes: string[];
  dataKeys: {
    absValue?: {
      title: string;
      order: number;
      itemType: string;
    };
    actualValue: {
      title: string;
      order: number;
      itemType: string;
    };
    blockingAfter?: {
      title: string;
      order: number;
      itemType: string;
    };
  };
  itemCount: number;
  itemLimit: number;
  items: ConditionItem[];
}

export interface ConditionItem {
  itemType: string;
  name: string;
  link: string;
  data: {
    absValue?: {
      formattedValue: string;
      value: number;
      classes: string[];
      link: string;
    };
    actualValue: {
      formattedValue: string;
      value: number;
      classes: string[];
      link: string;
    };
    blockingAfter?: {
      formattedValue: string;
      value: number;
      classes: string[];
      link: string;
    };
  };
}

export interface AnnotationApiLink {
  url: string;
}

export interface AnalyzedFile {
  formattedValue: string;
  letter?: string;
  messages: unknown[];
  coverage: number;
  status: string;
  value: string | number;
}

export interface AnalyzedFiles {
  data: AnalyzedFile[];
}

export interface AnnotationResponse {
  header: {
    title: string;
  };
  annotationTypes?: Record<string, AnnotationType>;
  data: Annotation[];
}

export interface AnnotationType {
  metricName: string;
  instanceName: string;
}

export interface Annotation {
  fullPath: string;
  line?: number;
  level?: number;
  category?: string;
  rule?: string;
  msg: string;
  supp: boolean;
  type: string;
  count?: number;
  path?: string;
  ruleHelp?: string;
  synopsis?: string;
  ruleset?: string;
  blocking?: {
    state: 'yes' | 'no' | 'after';
    after?: number;
  };
  complexity?: number;
  functionName?: string;
}

export interface VersionResponse {
  buildTime?: string;
  revision?: string;
  version: string;
  fullVersion?: string;
  project?: string;
  dbversion?: string;
}

export interface RunDateResponse {
  data: {
    formattedValue: string;
    letter: string | undefined;
    messages: string[];
    coverage: number;
    status: string;
    value: number;
  }[];
  dates: string;
  metrics: {
    expression: string;
    fullName: string;
  }[];
  nodes: {
    name: string;
    fullPath: string;
  }[];
}
