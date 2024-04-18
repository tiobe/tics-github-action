import { writeFileSync } from 'fs';
import { normalize, resolve } from 'canonical-path';
import { logger } from '../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';
import { ChangedFile } from './interfaces';
import { handleOctokitError } from '../helper/error';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfPullRequest(): Promise<ChangedFile[]> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber
  };
  let response: ChangedFile[] = [];
  try {
    logger.header('Retrieving changed files.');
    response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      if (response.data) {
        return response.data
          .filter(item => {
            // If a file is moved or renamed the status is 'renamed'.
            if (item.status === 'renamed') {
              // If a file has been moved without changes or if moved files are excluded, exclude them.
              if ((ticsConfig.excludeMovedFiles && item.changes === 0) || item.changes === 0) {
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
    logger.info('Retrieved changed files from pull request.');
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    throw Error(`Could not retrieve the changed files: ${message}`);
  }
  return response;
}

/**
 * Creates a file containing all the changed files based on the given changedFiles.
 * @param changedFiles List of changed files.
 * @returns Location of the written file.
 */
export function changedFilesToFile(changedFiles: ChangedFile[]): string {
  logger.header('Writing changedFiles to file');

  let contents = '';
  changedFiles.forEach(item => {
    contents += item.filename + '\n';
  });

  const fileListPath = resolve('changedFiles.txt');
  writeFileSync(fileListPath, contents);

  logger.info(`Content written to: ${fileListPath}`);

  return fileListPath;
}
