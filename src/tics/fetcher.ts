import { baseUrl, httpClient, ticsConfig } from '../configuration';
import { ChangedFile } from '../github/interfaces';
import {
  ProjectResult,
  AnalysisResults,
  AnalyzedFile,
  AnalyzedFiles,
  Annotation,
  AnnotationApiLink,
  AnnotationResonse,
  ExtendedAnnotation,
  QualityGate,
  VersionResponse
} from '../helper/interfaces';
import { logger } from '../helper/logger';
import { createReviewComments } from '../helper/summary';
import { getItemFromUrl, getProjectName } from './api_helper';
import * as fetcher from './fetcher';

/**
 * Retrieve all analysis results from the viewer in one convenient object.
 * @param explorerUrls All the explorer urls gotten from the TICS analysis.
 * @param changedFiles The changed files gotten from GitHub.
 * @returns Object containing the results of the analysis.
 */
export async function getAnalysisResults(explorerUrls: string[], changedFiles: ChangedFile[]): Promise<AnalysisResults> {
  let analysisResults: AnalysisResults = {
    passed: true,
    message: '',
    missesQualityGate: false,
    projectResults: []
  };

  if (explorerUrls.length === 0) {
    analysisResults.passed = false;
    analysisResults.message = 'No Explorer url found';
    analysisResults.missesQualityGate = true;
  }

  for (const url of explorerUrls) {
    let analysisResult: ProjectResult = {
      project: getProjectName(url),
      explorerUrl: url,
      // import of itself is used for mocking the function in the same file
      analyzedFiles: await fetcher.getAnalyzedFiles(url)
    };

    // import of itself is used for mocking the function in the same file
    const qualityGate = await fetcher.getQualityGate(url);

    if (!qualityGate) {
      analysisResults.passed = false;
      analysisResults.missesQualityGate = true;
    }

    if (qualityGate && !qualityGate.passed) {
      analysisResults.passed = false;
      analysisResults.message += qualityGate.message + '; ';
    }

    if (qualityGate && ticsConfig.postAnnotations) {
      // import of itself is used for mocking the function in the same file
      const annotations = await fetcher.getAnnotations(qualityGate.annotationsApiV1Links);
      if (annotations && annotations.length > 0) {
        analysisResult.reviewComments = createReviewComments(annotations, changedFiles);
      }
    }

    analysisResult.qualityGate = qualityGate;

    analysisResults.projectResults.push(analysisResult);
  }

  // Remove trailing space from the message
  analysisResults.message = analysisResults.message.trimEnd();

  return analysisResults;
}

/**
 * Retrieves the files TICS analyzed from the TICS viewer.
 * @param url The TICS explorer url.
 * @returns the analyzed files.
 */
export async function getAnalyzedFiles(url: string): Promise<string[]> {
  logger.header('Retrieving analyzed files.');
  const analyzedFilesUrl = getAnalyzedFilesUrl(url);
  let analyzedFiles: string[] = [];
  logger.debug(`From: ${analyzedFilesUrl}`);

  try {
    const response = await httpClient.get<AnalyzedFiles>(analyzedFilesUrl);
    if (response) {
      analyzedFiles = response.data.map((file: AnalyzedFile) => {
        logger.debug(file.formattedValue);
        return file.formattedValue;
      });
      logger.info('Retrieved the analyzed files.');
    }
  } catch (error: unknown) {
    let message = 'unknown error';
    if (error instanceof Error) message = error.message;
    throw Error(`There was an error retrieving the analyzed files: ${message}`);
  }
  return analyzedFiles;
}

/**
 * Returns the url to get the analyzed files with from the TICS.
 * @param url The TICS explorer url.
 * @returns url to get the analyzed files from.
 */
function getAnalyzedFilesUrl(url: string) {
  let getAnalyzedFilesUrl = new URL(baseUrl + '/api/public/v1/Measure?metrics=filePath');

  const clientData = getItemFromUrl(url, 'ClientData');
  const projectName = getProjectName(url);
  getAnalyzedFilesUrl.searchParams.append('filters', `ClientData(${clientData}),Project(${projectName}),Window(-1),File()`);

  return getAnalyzedFilesUrl.href;
}

/**
 * Retrieves the TICS quality gate from the TICS viewer.
 * @param url The TICS explorer url.
 * @returns the quality gates
 */
export async function getQualityGate(url: string): Promise<QualityGate | undefined> {
  logger.header('Retrieving the quality gates.');
  const qualityGateUrl = getQualityGateUrl(url);
  logger.debug(`From: ${qualityGateUrl}`);

  let response: QualityGate | undefined = undefined;

  try {
    response = await httpClient.get<QualityGate>(qualityGateUrl);
    logger.info('Retrieved the quality gates.');
    logger.debug(JSON.stringify(response));
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    throw Error(`There was an error retrieving the quality gates: ${message}`);
  }

  return response;
}

/**
 * Builds the quality gate url from the explorer url.
 * @param url The TICS Explorer url.
 * @returns The url to get the quality gate analysis.
 */
function getQualityGateUrl(url: string) {
  let qualityGateUrl = new URL(baseUrl + '/api/public/v1/QualityGateStatus');

  const projectName = getProjectName(url);
  qualityGateUrl.searchParams.append('project', projectName);

  // Branchname is optional, to check if it is set
  if (ticsConfig.branchName) {
    qualityGateUrl.searchParams.append('branch', ticsConfig.branchName);
  }

  qualityGateUrl.searchParams.append('fields', 'details,annotationsApiV1Links');

  const clientData = getItemFromUrl(url, 'ClientData');
  qualityGateUrl.searchParams.append('cdt', clientData);

  return qualityGateUrl.href;
}

/**
 * Gets the annotations from the TICS viewer.
 * @param apiLinks annotationsApiLinks url.
 * @returns TICS annotations.
 */
export async function getAnnotations(apiLinks: AnnotationApiLink[]): Promise<ExtendedAnnotation[]> {
  let annotations: ExtendedAnnotation[] = [];
  logger.header('Retrieving annotations.');

  try {
    await Promise.all(
      apiLinks.map(async (link, index) => {
        const annotationsUrl = new URL(`${baseUrl}/${link.url}`);
        annotationsUrl.searchParams.append('fields', 'default,ruleHelp,synopsis,annotationName');
        logger.debug(`From: ${annotationsUrl.href}`);
        const response = await httpClient.get<AnnotationResonse>(annotationsUrl.href);
        if (response) {
          response.data.forEach((annotation: Annotation) => {
            const extendedAnnotation: ExtendedAnnotation = {
              ...annotation,
              instanceName: response.annotationTypes ? response.annotationTypes[annotation.type].instanceName : annotation.type
            };
            extendedAnnotation.gateId = index;
            logger.debug(JSON.stringify(extendedAnnotation));
            annotations.push(extendedAnnotation);
          });
        }
      })
    );
    logger.info('Retrieved all annotations.');
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    throw Error(`An error occured when trying to retrieve annotations: ${message}`);
  }

  return annotations;
}

/**
 * Gets the version of the TICS viewer used.
 * @returns Version of the used TICS viewer.
 */
export async function getViewerVersion(): Promise<VersionResponse | undefined> {
  const getViewerVersionUrl = new URL(baseUrl + '/api/v1/version');
  let response;
  try {
    response = await httpClient.get<VersionResponse>(getViewerVersionUrl.href);
    logger.info('Retrieved the Viewer Version.');
    logger.debug(JSON.stringify(response));
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    throw Error(`There was an error retrieving the Viewer version: ${message}`);
  }
  return response;
}
