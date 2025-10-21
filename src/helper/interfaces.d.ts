import { ChangedFile } from '../github/interfaces';
import { ExtendedAnnotation, QualityGate } from '../viewer/interfaces';

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

export interface ProjectResult {
  project: string;
  explorerUrl: string;
  qualityGate: QualityGate;
  analyzedFiles: string[];
  annotations: ExtendedAnnotation[];
}

export interface AnalysisResult {
  passed: boolean;
  message: string;
  passedWithWarning: boolean;
  projectResults: ProjectResult[];
}
