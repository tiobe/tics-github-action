export interface Analysis {
  completed: boolean;
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrls: string[];
}

export interface AnalysisResults {
  passed: boolean;
  message: string;
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
  message: string;
  url: string;
  gates: Gate[];
  annotationsApiV1Links: AnnotationApiLink[];
}

export interface Gate {
  passed: boolean;
  name: string;
  conditions: Condition[];
}

export interface Condition {
  passed: boolean;
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

export interface AnnotationResonse {
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
  line: number;
  level: number;
  category: string;
  rule: string;
  msg: string;
  supp: boolean;
  type: string;
  count: number;
  gateId?: number;
  displayCount?: string;
  path?: string;
  diffLines?: number[];
  ruleHelp?: string;
  synopsis?: string;
}

export interface ExtendedAnnotation extends Annotation {
  instanceName: string;
}

export interface VersionResponse {
  buildTime?: string;
  revision?: string;
  version: string;
  fullVersion?: string;
  projectName?: string;
  dbversion?: string;
}

export interface ArtifactsResponse {
  links: Links;
}

export interface Links {
  setPropPath: string;
  queryArtifact: string;
  uploadArtifact: string;
  installTics?: string;
}
