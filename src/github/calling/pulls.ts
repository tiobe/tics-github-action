import { writeFileSync } from 'fs';
import { normalize, resolve } from 'canonical-path';
import { logger } from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../../configuration';
import { ChangedFile } from '../../helper/interfaces';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFiles(): Promise<ChangedFile[] | undefined> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber
  };
  try {
    logger.header('Retrieving changed files.');
    const response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      return response.data
        .filter(item => {
          if (item.status === 'renamed') {
            // If a files has been moved without changes or if moved files are excluded, exclude them.
            if (ticsConfig.excludeMovedFiles || item.changes === 0) {
              return false;
            }
          }
          return true;
        })
        .map(item => {
          // If a file is moved or renamed the status is 'renamed'.
          item.filename = normalize(item.filename);
          logger.debug(item.filename);
          return item;
        });
    });
    logger.info('Retrieved changed files.');
    return response;
  } catch (error: any) {
    logger.exit(`Could not retrieve the changed files: ${error}`);
  }
}

/**
 * Creates a file containing all the changed files based on the given changedFiles.
 * @param changedFiles List of changed files.
 * @returns Location of the written file.
 */
export function changedFilesToFile(changedFiles: any[]): string {
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
