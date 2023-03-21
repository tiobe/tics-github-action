import { Http2ServerResponse } from 'http2';

export interface Analysis {
  completed: boolean;
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrl?: string;
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

export interface ReviewComment {
  body: string;
  path: any;
  line: any;
}

export interface ReviewComments {
  postable: ReviewComment[];
  unpostable: any[];
}

export interface ChangedFile {
  sha: string;
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied' | 'changed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string | undefined;
  previous_filename?: string | undefined;
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
