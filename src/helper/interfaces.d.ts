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
