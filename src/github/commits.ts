import { normalize } from 'canonical-path';

import { ChangedFile } from './interfaces';
import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig, actionConfig } from '../configuration/config';
import { octokit } from './octokit';
import { ChangeType } from './enums';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfCommit(): Promise<ChangedFile[]> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    ref: githubConfig.commitSha
  };
  let response: ChangedFile[] = [];
  try {
    logger.header('Retrieving changed files.');
    response = await octokit.paginate(octokit.rest.repos.getCommit, params, response => {
      if (response.data.files) {
        return (
          response.data.files
            // If excludeMovedFiles, filter out moved files (a file is moved if the status is 'renamed')
            .filter(f => f.changes > 0 && !(actionConfig.excludeMovedFiles && f.status === ChangeType.RENAMED))
            .map(item => {
              item.filename = normalize(item.filename);
              logger.debug(item.filename);
              return item;
            })
        );
      }
      return [];
    });
    logger.info('Retrieved changed files from commit.');
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    throw Error(`Could not retrieve the changed files: ${message}`);
  }
  return response;
}
