import { readFileSync, writeFileSync } from 'fs';
import { normalize, resolve } from 'canonical-path';
import Logger from '../../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../../configuration';
import { ChangedFile } from '../../helper/interfaces';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFiles(): Promise<ChangedFile[]> {
  Logger.Instance.header('Retrieving changed files.');
  let response;
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      return response.data.map(data => {
        // If a file is moved or renamed the status is 'renamed'.
        if (data.status === 'renamed') {
          if (ticsConfig.excludeMovedFiles) {
            return { filename: '' };
          }
          if (data.changes === 0) {
            // If nothing has changed in the file skip it.
            return { filename: '' };
          }
        }
        data.filename = normalize(data.filename);
        Logger.Instance.debug(data.filename);
        return data;
      });
    });
  } catch (error: any) {
    Logger.Instance.exit(`Could not retrieve the changed files: ${error}`);
  }

  Logger.Instance.info('Retrieved changed files.');
  return response ? response.filter(x => x.filename !== '') : [];
}

/**
 * Creates a file containing all the changed files based on the given changedFiles.
 * @param changedFiles List of changed files.
 * @returns Location of the written file.
 */
export function changedFilesToFile(changedFiles: any[]): string {
  Logger.Instance.header('Writing changedFiles to file');

  let content = '';
  changedFiles.forEach(item => {
    content += item.filename + '\n';
  });

  const fileListPath = resolve('changedFiles.txt');
  writeFileSync(fileListPath, content);

  Logger.Instance.info(`Content written to: ${fileListPath}`);

  return fileListPath;
}

export function changedFilesPathToVariable(changedFilesPath: string): ChangedFile[] {
  const fileListPath = resolve(changedFilesPath);

  Logger.Instance.header(`Reading file at ${fileListPath}`);

  const content = readFileSync(fileListPath).toString();
  return content.split(/\r?\n/).map(fileName => {
    return {
      filename: fileName
    };
  });
}
