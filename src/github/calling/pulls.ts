import { readFileSync, writeFileSync } from 'fs';
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
  let response;
  try {
    logger.header('Retrieving changed files.');
    response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
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
  } catch (error: unknown) {
    let message = 'error unknown';
    if (error instanceof Error) message = error.message;
    logger.exit(`Could not retrieve the changed files: ${message}`);
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

/**
 * Takes a filelist file and turns it into an array of files.
 * @param filelist Path of the file containing the filelist.
 * @returns Filelist as an array.
 */
export function filelistToList(filelist: string): ChangedFile[] {
  try {
    let files = readFileSync(filelist).toString().split(/\r?\n/);
    return files.map((file: string) => {
      return { filename: file };
    });
  } catch (error: unknown) {
    throw error;
  }
}
