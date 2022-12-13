export interface Analysis {
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrl?: string;
}

export interface QualityGate {
  passed: boolean;
  message: string;
  url: string;
  gates: any[];
  annotationsApiV1Links: any[];
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
