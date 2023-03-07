import { baseUrl, ticsConfig } from '../configuration';
import { AnalyzedFile, AnalyzedFiles, ChangedFile } from '../helper/interfaces';
import Logger from '../helper/logger';
import { getItemFromUrl, getProjectName, httpRequest } from './api_helper';

/**
 * Retrieves the files TiCS analyzed from the TiCS viewer.
 * @param url The TiCS explorer url.
 * @returns the analyzed files.
 */
export async function getAnalyzedFiles(url: string, changedFiles: ChangedFile[]): Promise<string[]> {
  Logger.Instance.header('Retrieving analyzed files.');
  const analyzedFilesUrl = getAnalyzedFilesUrl(url);
  let analyzedFiles: string[] = [];
  Logger.Instance.debug(`From: ${analyzedFilesUrl}`);

  try {
    const response = await httpRequest<AnalyzedFiles>(analyzedFilesUrl);
    if (response) {
      analyzedFiles = response.data
        .filter((file: AnalyzedFile) => {
          return changedFiles.find(cf => cf.filename === file.formattedValue) ? true : false;
        })
        .map((file: AnalyzedFile) => {
          Logger.Instance.debug(file.formattedValue);
          return file.formattedValue;
        });
      Logger.Instance.info('Retrieved the analyzed files.');
    }
  } catch (error: unknown) {
    let message = 'unknown error';
    if (error instanceof Error) message = error.message;
    Logger.Instance.exit(`There was an error retrieving the analyzed files: ${message}`);
  }
  return analyzedFiles;
}

/**
 * Returns the url to get the analyzed files with from the TiCS.
 * @param url The TiCS explorer url.
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
 * Retrieves the TiCS quality gate from the TiCS viewer.
 * @param url The TiCS explorer url.
 * @returns the quality gates
 */
export async function getQualityGate(url: string): Promise<any> {
  Logger.Instance.header('Retrieving the quality gates.');
  const qualityGateUrl = getQualityGateUrl(url);
  Logger.Instance.debug(`From: ${qualityGateUrl}`);

  try {
    const response = await httpRequest(qualityGateUrl);
    Logger.Instance.info('Retrieved the quality gates.');
    Logger.Instance.debug(JSON.stringify(response));
    return response;
  } catch (error: any) {
    Logger.Instance.exit(`There was an error retrieving the quality gates: ${error.message}`);
  }
}

/**
 * Builds the quality gate url from the explorer url.
 * @param url The TiCS Explorer url.
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
 * Gets the annotations from the TiCS viewer.
 * @param apiLinks annotationsApiLinks url.
 * @returns TiCS annotations.
 */
export async function getAnnotations(apiLinks: any[]) {
  Logger.Instance.header('Retrieving annotations.');
  try {
    let annotations: any[] = [];
    await Promise.all(
      apiLinks.map(async (link, index) => {
        const annotationsUrl = `${baseUrl}/${link.url}`;
        Logger.Instance.debug(`From: ${annotationsUrl}`);
        const response = await httpRequest<any>(annotationsUrl);
        response.data.forEach((annotation: any) => {
          annotation.gateId = index;
          Logger.Instance.debug(JSON.stringify(annotation));
          annotations.push(annotation);
        });
      })
    );
    Logger.Instance.info('Retrieved all annotations.');
    return annotations;
  } catch (error: any) {
    Logger.Instance.exit(`An error occured when trying to retrieve annotations: ${error.message}`);
  }
}

/**
 * Gets the version of the TiCS viewer used.
 * @returns Version of the used TiCS viewer.
 */
export async function getViewerVersion(): Promise<any> {
  let getViewerVersionUrl = new URL(baseUrl + '/api/v1/version');
  try {
    const response = await httpRequest(getViewerVersionUrl.href);
    Logger.Instance.info('Retrieved the Viewer Version.');
    Logger.Instance.debug(JSON.stringify(response));
    return response;
  } catch (error: any) {
    Logger.Instance.exit(`There was an error retrieving the Viewer version: ${error.message}`);
  }
}
