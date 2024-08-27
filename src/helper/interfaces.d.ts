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
  passedWithWarning: boolean;
  missesQualityGate: boolean;
  projectResults: ProjectResult[];
}

export interface ProjectResult {
  project: string;
  explorerUrl: string;
  qualityGate?: QualityGate;
  analyzedFiles: string[];
  reviewComments?: TicsReviewComments;
}

export interface QualityGate {
  passed: boolean;
  passedWithWarning?: boolean;
  message: string;
  url: string;
  gates: Gate[];
  annotationsApiV1Links: AnnotationApiLink[];
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
  details?: ConditionDetails;
  annotationsApiV1Links?: AnnotationApiLink[];
}

export interface ConditionDetails {
  itemTypes: string[];
  dataKeys: {
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

export interface TicsReviewComments {
  postable: TicsReviewComment[];
  unpostable: ExtendedAnnotation[];
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
  rule: string;
  msg: string;
  supp: boolean;
  type: string;
  count?: number;
  gateId?: number;
  path?: string;
  diffLines?: number[];
  ruleHelp?: string;
  synopsis?: string;
  blocking?: {
    state: 'yes' | 'no' | 'after';
    after?: number;
  };
}

export interface ExtendedAnnotation extends Annotation {
  line: number;
  count: number;
  displayCount?: string;
  instanceName: string;
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
