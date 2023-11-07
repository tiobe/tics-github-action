import { writeFileSync } from 'fs';
import { normalize, resolve } from 'canonical-path';
import { logger } from '../helper/logger';
import { githubConfig, octokit, ticsConfig } from '../configuration';
import { ChangedFile, ChangedFileResData, GraphQlResponse, GraphQlChangedFile, GraphQlParams } from './interfaces';
import { handleOctokitError as getMessageFromOctokitError } from '../helper/error';
import { ChangeType } from '../helper/enums';

/**
 * Sends a request to retrieve the changed files for a given pull request to the GitHub API.
 * @returns List of changed files within the GitHub Pull request.
 */
export async function getChangedFilesOfPullRequest(): Promise<ChangedFile[]> {
  const params: GraphQlParams = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    per_page: 100,
    after: undefined
  };
  let files: ChangedFile[] = [];
  try {
    logger.header('Retrieving changed files.');
    let response: GraphQlResponse<ChangedFileResData>;
    do {
      response = await octokit.graphql<GraphQlResponse<ChangedFileResData>>(
        `query($owner: String!, $repo: String!, $pull_number: Int!, $per_page: Int!, $after: String) {
          rateLimit {
            remaining
          }
          repository(owner: $owner, name: $repo) {
            pullRequest(number: $pull_number) {
              files(first: $per_page, after: $after) {
                totalCount
                pageInfo {
                  endCursor
                  hasNextPage
                }
                nodes {
                  path
                  changeType
                  additions
                  deletions
                }
              }
            }
          }
        }`,
        params
      );
      files = files.concat(
        response.repository.pullRequest.files.nodes
          .map((item: GraphQlChangedFile) => {
            const changedFile: ChangedFile = {
              filename: normalize(item.path),
              additions: item.additions,
              deletions: item.deletions,
              changes: item.additions + item.deletions,
              status: ChangeType[item.changeType]
            };
            return changedFile;
          })
          .filter((item: ChangedFile) => {
            if (item.status === 'renamed') {
              // If a files has been moved without changes or if moved files are excluded, exclude them.
              if ((ticsConfig.excludeMovedFiles && item.changes === 0) || item.changes === 0) {
                return false;
              }
            }
            logger.debug(item.filename);
            return true;
          })
      );
      params.after = response.repository.pullRequest.files.pageInfo.endCursor;
    } while (response.repository.pullRequest.files.pageInfo.hasNextPage);
    logger.info('Retrieved changed files from pull request.');
  } catch (error: unknown) {
    const message = getMessageFromOctokitError(error);
    throw Error(`Could not retrieve the changed files: ${message}`);
  }
  return files;
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
