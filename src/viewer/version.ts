import { getRetryErrorMessage, getRetryMessage } from '../helper/response';
import { VersionResponse } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { joinUrl } from '../helper/url';
import { httpClient } from './_http-client';
import { ticsConfig } from '../configuration/_config';

/**
 * Gets the version of the TICS viewer used.
 * @returns Version of the used TICS viewer.
 */
export async function getViewerVersion(): Promise<VersionResponse> {
  const getViewerVersionUrl = joinUrl(ticsConfig.baseUrl, '/api/v1/version');

  try {
    logger.header('Retrieving the viewer version');
    logger.debug(`From ${getViewerVersionUrl}`);
    const response = await httpClient.get<VersionResponse>(getViewerVersionUrl);
    logger.info(getRetryMessage(response, 'Retrieved the Viewer Version.'));
    logger.debug(JSON.stringify(response));
    return response.data;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving the Viewer version: ${message}`);
  }
}
