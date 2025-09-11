import { createReviewComments } from '../../action/decorate/summary';
import { actionConfig } from '../../configuration/config';
import { ChangedFile } from '../../github/interfaces';
import { AnalysisResult, ProjectResult } from '../../helper/interfaces';
import { getItemFromUrl, getProjectFromUrl } from '../../tics/url';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../viewer/analyzed-files';
import { getAnnotations } from '../../viewer/annotations';
import { getQualityGate, getQualityGateUrl } from '../../viewer/qualitygate';

/**
 * Retrieve all analysis results from the viewer in one convenient object.
 * @param explorerUrls All the explorer urls gotten from the TICS analysis.
 * @param changedFiles The changed files gotten from GitHub.
 * @returns Object containing the results of the analysis.
 */
export async function getClientAnalysisResults(explorerUrls: string[], changedFiles: ChangedFile[]): Promise<AnalysisResult> {
  const hasExplorerUrl = explorerUrls.length !== 0;
  const analysisResult: AnalysisResult = {
    passed: hasExplorerUrl,
    passedWithWarning: false,
    missesQualityGate: !hasExplorerUrl,
    projectResults: [],
    message: ''
  };

  for (const url of explorerUrls) {
    const cdtoken = getItemFromUrl(url, 'ClientData');
    const project = getProjectFromUrl(url);

    const projectResult: ProjectResult = {
      project: project,
      explorerUrl: url,
      analyzedFiles: await getAnalyzedFiles(getAnalyzedFilesUrl(project, { cdtoken }))
    };

    projectResult.qualityGate = await getQualityGate(getQualityGateUrl(project, { cdtoken }));

    if (!projectResult.qualityGate.passed) {
      analysisResult.passed = false;
    }

    if (actionConfig.postAnnotations) {
      const annotations = await getAnnotations(projectResult.qualityGate.annotationsApiV1Links);
      if (annotations.length > 0) {
        projectResult.reviewComments = createReviewComments(annotations, changedFiles);
      }
    }

    analysisResult.projectResults.push(projectResult);
  }

  // construct message after all ProjectResults have been collected
  analysisResult.message = parseFailedMessage(explorerUrls, analysisResult.projectResults);

  analysisResult.passedWithWarning =
    analysisResult.passed && analysisResult.projectResults.filter(p => p.qualityGate?.passed && p.qualityGate.passedWithWarning).length > 0;

  return analysisResult;
}

/**
 * Construct message on how many projects failed the quality gate (if at least one fails).
 */
function parseFailedMessage(explorerUrls: string[], projectResults: ProjectResult[]): string {
  let failedMessage = '';

  const failedProjectQualityGateCount = projectResults.filter(p => p.qualityGate && !p.qualityGate.passed).length;
  if (failedProjectQualityGateCount >= 1) {
    if (explorerUrls.length > 1) {
      failedMessage = `${failedProjectQualityGateCount.toString()} out of ${explorerUrls.length.toString()} projects`;
    } else {
      failedMessage = 'Project';
    }
    failedMessage += ` failed quality gate(s)`;
  }

  return failedMessage;
}
