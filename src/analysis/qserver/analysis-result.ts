import { ticsCli, ticsConfig } from '../../configuration/config.js';
import { AnalysisResult } from '../../helper/interfaces.js';
import { joinUrl } from '../../helper/url.js';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../viewer/analyzed-files.js';
import { getAnnotations } from '../../viewer/annotations.js';
import { TicsRunIdentifier } from '../../viewer/interfaces.js';
import { getQualityGate, getQualityGateUrl } from '../../viewer/qualitygate.js';
import { getChangedFiles } from '../helper/changed-files.js';

export async function getAnalysisResult(date: number): Promise<AnalysisResult> {
  const identifier: TicsRunIdentifier = { project: ticsCli.project, date };
  const qualityGate = await getQualityGate(await getQualityGateUrl(identifier));
  const analyzedFiles = await getAnalyzedFiles(getAnalyzedFilesUrl(identifier));

  const changedFiles = await getChangedFiles();
  const annotations = await getAnnotations(qualityGate, changedFiles.files, identifier);

  return {
    passed: qualityGate.passed,
    message: qualityGate.passed ? '' : 'Project failed quality gate',
    passedWithWarning: qualityGate.passedWithWarning ?? false,
    projectResults: [
      {
        project: ticsCli.project,
        explorerUrl: joinUrl(ticsConfig.baseUrl, qualityGate.url),
        analyzedFiles: analyzedFiles,
        qualityGate: qualityGate,
        annotations: annotations
      }
    ]
  };
}
