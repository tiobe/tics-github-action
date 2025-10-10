import { ChangedFile } from '../../github/interfaces';
import { AnalysisResult, ProjectResult } from '../../helper/interfaces';
import { getItemFromUrl, getProjectFromUrl } from '../../tics/url';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../viewer/analyzed-files';
import { getAnnotations } from '../../viewer/annotations';
import { TicsRunIdentifier } from '../../viewer/interfaces';
import { getQualityGate, getQualityGateUrl } from '../../viewer/qualitygate';

/**
 * Retrieve all analysis results from the viewer in one convenient object.
 * @param explorerUrls All the explorer urls gotten from the TICS analysis.
 * @param changedFiles The changed files gotten from GitHub.
 * @returns Object containing the results of the analysis.
 */
export async function getClientAnalysisResults(explorerUrls: string[], changedFiles: ChangedFile[]): Promise<AnalysisResult> {
  const projectResults: ProjectResult[] = await Promise.all(
    explorerUrls.map(async url => {
      const identifier: TicsRunIdentifier = {
        project: getProjectFromUrl(url),
        cdtoken: getItemFromUrl(url, 'ClientData')
      };

      const analysedFiles = await getAnalyzedFiles(getAnalyzedFilesUrl(identifier));
      const qualityGate = await getQualityGate(await getQualityGateUrl(identifier));

      const annotations = await getAnnotations(qualityGate, changedFiles, identifier);

      return {
        project: identifier.project,
        explorerUrl: url,
        qualityGate: qualityGate,
        analyzedFiles: analysedFiles,
        annotations: annotations
      };
    })
  );

  const passed = projectResults.length !== 0 && projectResults.every(p => p.qualityGate.passed);
  return {
    passed: passed,
    passedWithWarning: passed && projectResults.filter(p => p.qualityGate.passed && p.qualityGate.passedWithWarning).length > 0,
    projectResults: projectResults,
    message: parseFailedMessage(explorerUrls, projectResults)
  };
}

/**
 * Construct message on how many projects failed the quality gate (if at least one fails).
 */
function parseFailedMessage(explorerUrls: string[], projectResults: ProjectResult[]): string {
  let failedMessage = '';
  const failedProjectQualityGateCount = projectResults.filter(p => !p.qualityGate.passed).length;
  if (failedProjectQualityGateCount >= 1) {
    if (explorerUrls.length > 1) {
      failedMessage = `${failedProjectQualityGateCount.toString()} out of ${explorerUrls.length.toString()} projects`;
    } else {
      failedMessage = 'Project';
    }
    failedMessage += ' failed quality gate(s)';
  }

  return failedMessage;
}
