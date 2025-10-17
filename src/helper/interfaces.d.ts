import { ChangedFile } from '../github/interfaces';

export interface ChangedFiles {
  files: ChangedFile[];
  path: string;
}

export interface Verdict {
  passed: boolean;
  message: string;
  errorList: string[];
  warningList: string[];
}

export interface Analysis {
  completed: boolean;
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrls: string[];
}

export interface AnalysisResult {
  passed: boolean;
  message: string;
  passedWithWarning: boolean;
  projectResults: ProjectResult[];
}

export interface ProjectResult {
  project: string;
  explorerUrl: string;
  qualityGate: QualityGate;
  analyzedFiles: string[];
  annotations: ExtendedAnnotation[];
}

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

export interface TicsReviewComment {
  title: string;
  body: string;
  path?: string;
  line: number;
  blocking: 'yes' | 'no' | 'after' | undefined;
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

export interface HttpResponse {
  data: string;
  alertMessages: { header: string }[];
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

export interface FetchedAnnotation extends Annotation {
  line: number;
  count: number;
  gateId?: number;
  instanceName: string;
}

export interface ExtendedAnnotation extends FetchedAnnotation {
  displayCount?: string;
  postable?: boolean;
}

export interface VersionResponse {
  buildTime?: string;
  revision?: string;
  version: string;
  fullVersion?: string;
  project?: string;
  dbversion?: string;
}

export interface Links {
  setPropPath: string;
  queryArtifact: string;
  uploadArtifact: string;
  installTics?: string;
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
