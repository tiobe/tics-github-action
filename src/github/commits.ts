import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { actionConfig, githubConfig } from '../configuration/config.js';
import { logger } from '../helper/logger.js';
import { handleOctokitError } from '../helper/response.js';
import { ChangedFile } from './interfaces.js';
import { octokit } from './octokit.js';
import { ChangeType } from './enums.js';
import { normalize } from 'canonical-path';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfCommit(): Promise<ChangedFile[]> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    ref: githubConfig.sha,
    per_page: githubConfig.paginatePerPage
  };
  try {
    logger.header('Retrieving changed files.');
    const changedFiles = await octokit.paginate(octokit.rest.repos.getCommit, params, resp => {
      const data = resp.data as RestEndpointMethodTypes['repos']['getCommit']['response']['data'];
      const files = data.files ?? [];
      return (
        files
          // If excludeMovedFiles, filter out moved files (a file is moved if the status is 'renamed')
          .filter(item => item.changes > 0 && !(actionConfig.excludeMovedFiles && item.status === ChangeType.RENAMED))
          .map(item => {
            const filename = normalize(item.filename);
            logger.debug(item.filename);
            return {
              ...item,
              filename: filename
            };
          })
      );
    });
    logger.info('Retrieved changed files from commit.');
    return changedFiles;
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    throw Error(`Could not retrieve the changed files: ${message}`, { cause: error });
  }
}
