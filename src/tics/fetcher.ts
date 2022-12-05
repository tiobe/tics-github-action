import { baseUrl, ticsConfig } from '../github/configuration';
import Logger from '../helper/logger';
import { getItemFromUrl, httpRequest } from './api_helper';

/**
 * Retrieves the TiCS quality gate from the TiCS viewer.
 * @param url The TiCS explorer url.
 * @returns the quality gates
 */
export async function getQualityGate(url: string): Promise<any> {
  Logger.Instance.header('Retrieving the quality gates');
  const qualityGateUrl = getQualityGateUrl(url);
  Logger.Instance.debug(`From: ${qualityGateUrl}`);
  try {
    return await httpRequest(qualityGateUrl);
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
  let projectName = ticsConfig.projectName == 'auto' ? getItemFromUrl(url, 'Project') : ticsConfig.projectName;
  let clientDataTok = getItemFromUrl(url, 'ClientData');
  let qualityGateUrl = new URL(baseUrl + '/api/public/v1/QualityGateStatus');

  qualityGateUrl.searchParams.append('project', projectName);

  // Branchname is optional, to check if it is set
  if (ticsConfig.branchName) {
    qualityGateUrl.searchParams.append('branch', ticsConfig.branchName);
  }

  qualityGateUrl.searchParams.append('fields', 'details,annotationsApiV1Links');
  qualityGateUrl.searchParams.append('cdt', clientDataTok);

  return qualityGateUrl.href;
}

/**
 * Gets the annotations from the TiCS viewer.
 * @param apiLinks annotationsApiLinks url.
 * @returns TiCS annotations
 */
export async function getAnnotations(apiLinks: any[]) {
  Logger.Instance.header('Retrieving annotations');
  try {
    let annotations: any[] = [];
    await Promise.all(
      apiLinks.map(async link => {
        const annotationsUrl = `${baseUrl}/${link.url}`;
        Logger.Instance.debug(`From: ${annotationsUrl}`);
        const response = await httpRequest(annotationsUrl);
        response.data.map((annotation: any) => {
          annotations.push(annotation);
        });
      })
    );
    return annotations;
  } catch (error) {
    Logger.Instance.exit('An error occured when trying to retrieve annotations ' + error);
  }
}
