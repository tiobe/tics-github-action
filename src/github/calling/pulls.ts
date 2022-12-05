import { writeFileSync } from 'fs';
import { resolve } from 'path';
import logger from '../../helper/logger';
import { githubConfig, octokit } from '../configuration';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFiles(): Promise<string[]> {
  logger.Instance.header('Retrieving changed files to analyse');
  let changedFiles: string[] = [];
  let noMoreFiles: boolean = false;
  try {
    for (let i = 1; i <= 30; i++) {
      const params = {
        accept: 'application/vnd.github.v3+json',
        branch: githubConfig.branchname,
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: githubConfig.pullRequestNumber,
        per_page: 100,
        page: i
      };
      await octokit.rest.pulls.listFiles(params).then(response => {
        if (response.data.length > 0) {
          response.data.map(item => {
            changedFiles.push(item.filename);
            logger.Instance.info(item.filename);
          });
        } else {
          noMoreFiles = true;
        }
      });
      if (noMoreFiles) {
        break;
      }
    }
  } catch (error: any) {
    logger.Instance.exit(`Could not retrieve the changed files: ${error}`);
  }
  return changedFiles;
}

/**
 * Creates a file containing all the changed files based on the given changeSet.
 * @param changeSet List of changed files.
 * @returns Location of the written file.
 */
export function changeSetToFile(changeSet: string[]): string {
  logger.Instance.header('Writing changeSet to file');

  let contents = '';
  changeSet &&
    changeSet.map(item => {
      contents += item + '\n';
    });

  const fileListPath = resolve('changeSet.txt');
  writeFileSync(fileListPath, contents);

  logger.Instance.info(`Content written to: ${fileListPath}`);

  return fileListPath;
}
