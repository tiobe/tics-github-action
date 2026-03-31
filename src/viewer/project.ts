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
  const createProjectUrl = joinUrl(ticsConfig.baseUrl, 'api/public/v1/fapi/Project');
  const branchName = getBranchName();
  const body = {
    projectName: ticsCli.project,
    branchName: branchName,
    branchDir: ticsCli.branchdir,
    calculate: true,
    visible: true,
    renameTo: {
      branchName: branchName
    }
  };
  try {
    logger.header('Creating/updating the TICS project');
    logger.debug(`With ${createProjectUrl}`);
    await httpClient.put<string>(createProjectUrl, JSON.stringify(body));
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error creating the project: ${message}`);
  }
}

/**
 * Get the branchname of the project to create.
 * If branchdir is not set, it will try to get the default branch or else 'main'.
 */
function getBranchName(): string {
  if (ticsCli.branchname) {
    return ticsCli.branchname;
  }

  if (process.env.GITHUB_BASE_REF) {
    return process.env.GITHUB_BASE_REF;
  }

  if (process.env.GITHUB_REF_NAME) {
    return process.env.GITHUB_REF_NAME;
  }

  return 'main';
}
