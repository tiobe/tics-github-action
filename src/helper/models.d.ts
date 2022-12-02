export interface Analysis {
  statusCode: number;
  errorList: string[];
  warningList: string[];
  explorerUrl?: string;
  filesAnalyzed?: string[];
}
