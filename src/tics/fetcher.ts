import { baseUrl, ticsConfig } from '../configuration';
import {
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
import { getItemFromUrl, getProjectName, httpRequest } from './api_helper';

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
    const response = await httpRequest<AnalyzedFiles>(analyzedFilesUrl);
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
    logger.exit(`There was an error retrieving the analyzed files: ${message}`);
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
    response = await httpRequest<QualityGate>(qualityGateUrl);
    logger.info('Retrieved the quality gates.');
    logger.debug(JSON.stringify(response));
    return response;
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    logger.exit(`There was an error retrieving the quality gates: ${message}`);
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
        logger.debug(`From: ${annotationsUrl}`);
        const response = await httpRequest<AnnotationResonse>(annotationsUrl.href);
        if (response) {
          response.data.forEach((annotation: Annotation) => {
            const extendedAnnotation: ExtendedAnnotation = {
              ...annotation,
              instanceName: response.annotationTypes ? response.annotationTypes[annotation.type].instanceName : annotation.type
            };
            annotation.gateId = index;
            logger.debug(JSON.stringify(annotation));
            annotations.push(extendedAnnotation);
          });
        }
      })
    );
    logger.info('Retrieved all annotations.');
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    logger.exit(`An error occured when trying to retrieve annotations: ${message}`);
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
    response = await httpRequest<VersionResponse>(getViewerVersionUrl.href);
    logger.info('Retrieved the Viewer Version.');
    logger.debug(JSON.stringify(response));
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    logger.exit(`There was an error retrieving the Viewer version: ${message}`);
  }
  return response;
}
