import { writeFileSync } from 'fs';
import { resolve } from 'path';
import logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFiles() {
  logger.Instance.header('Retrieving changed files of this pull request.');
  try {
    const params = {
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      pull_number: githubConfig.pullRequestNumber
    };
    return await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      return response.data.map(data => {
        logger.Instance.info(data.filename);
        return data.filename;
      });
    });
  } catch (error: any) {
    logger.Instance.exit(`Could not retrieve the changed files: ${error}`);
  }
}

/**
 * Creates a file containing all the changed files based on the given changeSet.
 * @param changeSet List of changed files.
 * @returns Location of the written file.
 */
export function changeSetToFile(changeSet: string[]): string {
  logger.Instance.header('Writing changeSet to file');

  let contents = '';
  changeSet.forEach(item => {
    contents += item + '\n';
  });

  const fileListPath = resolve('changeSet.txt');
  writeFileSync(fileListPath, contents);

  logger.Instance.info(`Content written to: ${fileListPath}`);

  return fileListPath;
}
