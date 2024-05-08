import { createReviewComments } from '../../action/decorate/summary';
import { actionConfig, ticsCli, ticsConfig } from '../../configuration/_config';
import { AnalysisResult, TicsReviewComments } from '../../helper/interfaces';
import { joinUrl } from '../../helper/url';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../viewer/analyzed-files';
import { getAnnotations } from '../../viewer/annotations';
import { getQualityGate, getQualityGateUrl } from '../../viewer/qualitygate';
import { getChangedFiles } from '../helper/changed-files';

export async function getAnalysisResult(date: number): Promise<AnalysisResult> {
  const qualityGate = await getQualityGate(getQualityGateUrl({ date }));
  const analyzedFiles = await getAnalyzedFiles(getAnalyzedFilesUrl({ date }));

  let reviewComments: TicsReviewComments | undefined;
  if (actionConfig.postAnnotations) {
    let changedFiles = await getChangedFiles();

    const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
    if (annotations.length > 0) {
      reviewComments = createReviewComments(annotations, changedFiles.files);
    }
  }

  return {
    passed: qualityGate.passed,
    passedWithWarning: qualityGate.passedWithWarning ?? false,
    missesQualityGate: false,
    projectResults: [
      {
        project: ticsCli.project,
        explorerUrl: joinUrl(ticsConfig.baseUrl, qualityGate.url),
        analyzedFiles: analyzedFiles,
        qualityGate: qualityGate,
        reviewComments: reviewComments
      }
    ]
  };
}
