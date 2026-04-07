import { HttpBadRequestResponse } from '@tiobe/http-client';
import { githubConfig, ticsCli, ticsConfig } from '../configuration/config';
import { logger } from '../helper/logger';
import { getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';

/**
 * Creates a project in the viewer if it does not exist.
 * @throws Error if project cannot be created.
 */
export async function createProject(): Promise<void> {
  const createProjectUrl = joinUrl(ticsConfig.baseUrl, `api/public/v1/fapi/Project?cfg=${ticsConfig.configuration}`);
  const body = {
    projectName: ticsCli.project,
    branchDir: ticsCli.branchdir,
    branchName: getBranchName(),
    calculate: true,
    visible: true,
    scmTool: {
      name: 'Git',
      db: githubConfig.reponame
    }
  };
  try {
    logger.header('Creating/updating the TICS project');
    logger.debug(`With ${createProjectUrl}`);
    const response = await httpClient.put<HttpBadRequestResponse>(createProjectUrl, JSON.stringify(body));
    for (const message of response.data.alertMessages) {
      logger.info(message.header);
    }
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error creating the project: ${message}`);
  }
}

function getBranchName() {
  if (ticsCli.branchname) {
    return ticsCli.branchname;
  }
  return 'main';
}
