export interface Analysis {
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrl?: string;
  filesAnalyzed?: string[];
}

export interface QualityGate {
  passed: boolean;
  message: string;
  url: string;
  gates: any[];
  annotationsApiV1Links: any[];
}

export enum Events {
  'APPROVE',
  'REQUEST_CHANGES',
  'COMMENT',
  undefined
}

export enum Status {
  'FAILED' = 0,
  'PASSED' = 1,
  'WARNING' = 2,
  'SKIPPED' = 2
}
