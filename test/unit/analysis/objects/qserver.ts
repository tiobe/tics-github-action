import { Analysis, AnalysisResult } from '../../../../src/helper/interfaces';

export const analysisNotCompleted: Analysis = {
  completed: false,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisFailed: Analysis = {
  completed: true,
  statusCode: 1,
  explorerUrls: [],
  errorList: ['Error'],
  warningList: []
};

export const analysisWarning5057: Analysis = {
  completed: true,
  statusCode: 0,
  explorerUrls: ['url'],
  errorList: [],
  warningList: ['[WARNING 5057]']
};

export const analysisPassed: Analysis = {
  completed: true,
  statusCode: 0,
  explorerUrls: ['url'],
  errorList: [],
  warningList: ['Warning']
};

export const analysisResult: AnalysisResult = {
  passed: true,
  passedWithWarning: false,
  missesQualityGate: false,
  projectResults: []
};
