import { normalize } from 'canonical-path';
import { logger } from '../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';
import { ChangedFile } from './interfaces';

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
        return response.data.files
          .filter(item => {
            // If a file is moved or renamed the status is 'renamed'.
            if (item.status === 'renamed') {
              // If a files has been moved without changes or if moved files are excluded, exclude them.
              if (ticsConfig.excludeMovedFiles || item.changes === 0) {
                return false;
              }
            }
            return true;
          })
          .map(item => {
            item.filename = normalize(item.filename);
            logger.debug(item.filename);
            return item;
          });
      }
      return [];
    });
    logger.info('Retrieved changed files from commit.');
  } catch (error: unknown) {
    let message = 'error unknown';
    if (error instanceof Error) message = error.message;
    logger.exit(`Could not retrieve the changed files: ${message}`);
  }
  return response;
}
