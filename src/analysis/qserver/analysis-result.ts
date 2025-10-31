import { ticsCli, ticsConfig } from '../../configuration/config';
import { AnalysisResult } from '../../helper/interfaces';
import { joinUrl } from '../../helper/url';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../viewer/analyzed-files';
import { getAnnotations } from '../../viewer/annotations';
import { TicsRunIdentifier } from '../../viewer/interfaces';
import { getQualityGate, getQualityGateUrl } from '../../viewer/qualitygate';
import { getChangedFiles } from '../helper/changed-files';

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
