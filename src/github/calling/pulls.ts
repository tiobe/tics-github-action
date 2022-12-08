import { writeFileSync } from 'fs';
import { resolve } from 'canonical-path';
import Logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFiles() {
  Logger.Instance.header('Retrieving changed files.');
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    const response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      return response.data.map(data => {
        Logger.Instance.debug(data.filename);
        return data;
      });
    });
    Logger.Instance.info('Retrieved changed files.');
    return response;
  } catch (error: any) {
    Logger.Instance.exit(`Could not retrieve the changed files: ${error}`);
  }
}

/**
 * Creates a file containing all the changed files based on the given changedFiles.
 * @param changedFiles List of changed files.
 * @returns Location of the written file.
 */
export function changedFilesToFile(changedFiles: any[]): string {
  Logger.Instance.header('Writing changedFiles to file');

  let contents = '';
  changedFiles.forEach(item => {
    contents += item.filename + '\n';
  });

  const fileListPath = resolve('changedFiles.txt');
  writeFileSync(fileListPath, contents);

  Logger.Instance.info(`Content written to: ${fileListPath}`);

  return fileListPath;
}
