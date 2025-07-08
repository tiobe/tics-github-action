import { writeFileSync } from 'fs';
import { normalize, resolve } from 'canonical-path';

import { ChangedFile, ChangedFilesQueryResponse } from './interfaces';
import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig, actionConfig } from '../configuration/config';
import { octokit } from './octokit';
import { ChangeType } from './enums';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfPullRequestQL(): Promise<ChangedFile[]> {
  if (!githubConfig.pullRequestNumber) {
    throw Error('This function can only be run on a pull request.');
  }
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    per_page: 100,
    cursor: undefined
  };

  let response: ChangedFilesQueryResponse;
  try {
    response = await octokit.graphql.paginate<ChangedFilesQueryResponse>(
      `query changedFiles($owner: String!, $repo: String!, $pull_number: Int!, $per_page: Int!, $cursor: String) {
        rateLimit {
          remaining
        }
        repository(owner: $owner, name: $repo) {
          pullRequest(number: $pull_number) {
            files(first: $per_page, after: $cursor) {
              totalCount
              nodes {
                path
                changeType
                additions
                deletions
                viewerViewedState
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }`,
      params
    );
    logger.debug(JSON.stringify(response));
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    throw Error(`Could not retrieve the changed files: ${message}`);
  }

  if (!response.repository?.pullRequest?.files?.nodes) {
    throw new Error('Missing data in GraphQL (changed files) response.');
  }

  return (
    response.repository.pullRequest.files.nodes
      .map(n => {
        return {
          filename: n.path,
          additions: n.additions,
          deletions: n.deletions,
          changes: n.additions + n.deletions,
          status: ChangeType[n.changeType]
        };
      })
      // If excludeMovedFiles, filter out moved files (a file is moved if the status is 'renamed')
      .filter(f => f.changes > 0 && !(actionConfig.excludeMovedFiles && f.status === ChangeType.RENAMED))
  );
}

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfPullRequestRest(): Promise<ChangedFile[]> {
  if (!githubConfig.pullRequestNumber) {
    throw Error('This function can only be run on a pull request.');
  }

  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber
  };
  let response: ChangedFile[] = [];
  try {
    logger.header('Retrieving changed files.');
    response = await octokit.paginate(octokit.rest.pulls.listFiles, params, response => {
      return (
        response.data
          // If excludeMovedFiles, filter out moved files (a file is moved if the status is 'renamed')
          .filter(f => f.changes > 0 && !(actionConfig.excludeMovedFiles && f.status === ChangeType.RENAMED))
          .map(item => {
            item.filename = normalize(item.filename);
            logger.debug(item.filename);
            return item;
          })
      );
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
