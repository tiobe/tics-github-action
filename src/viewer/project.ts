import { HttpBadRequestResponse } from '@tiobe/http-client';
import { ticsCli, ticsConfig } from '../configuration/config';
import { logger } from '../helper/logger';
import { getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';

/**
 * Gets the date of the last QServer run the viewer knows of.
 * @throws Error if project cannot be created or does not exist.
 */
export async function createProject(): Promise<void> {
  const createProjectUrl = joinUrl(ticsConfig.baseUrl, `api/public/v1/fapi/Project?cfg=${ticsConfig.configuration}`);
  const body = {
    projectName: ticsCli.project,
    branchDir: ticsCli.branchdir,
    calculate: true,
    visible: true
  };
  try {
    logger.header('Creating/updating the TICS project');
    logger.debug(`With ${createProjectUrl}`);
    const response = await httpClient.put<HttpBadRequestResponse>(createProjectUrl, JSON.stringify(body));
    if (response.data.alertMessages.length > 0) {
      logger.info(response.data.alertMessages[0].header);
    }
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error creating the project: ${message}`);
  }
}
