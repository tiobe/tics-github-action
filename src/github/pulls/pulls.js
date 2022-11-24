import github from '@actions/github';
import core from '@actions/core';
import { githubConfig } from '../configuration.js';
import fs from 'fs';
import path from 'path';

//Octokit client is authenticated
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

/* Parameters needed for getting the changed files */
function getChangedFilesParameters(pageNr) {
  return {
    accept: 'application/vnd.github.v3+json',
    branch: githubConfig.branchname,
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    pull_number: githubConfig.pullRequestNumber,
    per_page: 100,
    page: pageNr
  };
}

export const getPRChangedFiles = async () => {
  try {
    let changedFiles = '';
    var noMoreFiles;
    core.info('\u001b[35mRetrieving changed files to analyse');
    for (var i = 1; i <= 30; i++) {
      await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', getChangedFilesParameters(i)).then((response) => {
        if (response.data.length > 0) {
          response.data.map((item) => {
            changedFiles += item.filename + ',';
          });
        } else {
          noMoreFiles = true;
        }
      });
      if (noMoreFiles) {
        break;
      }
    }
    return changedFiles.slice(0, -1); // remove the last comma
  } catch (e) {
    core.error(`We cannot retrieve the files that changed in this PR: ${e}`);
  }
};

export function changeSetToFileList(changeSet) {
  core.info('\u001b[35mCreation of file list based on PR changeSet');
  let filesChanged = changeSet.split(',');
  let contents = '';

  filesChanged && filesChanged.map((item) => {
    contents += item + '\n';
  });

  var stream = fs.createWriteStream('changeSet.txt', { mode: 0o777 });
  stream.write(contents);
  stream.end();

  return path.resolve('changeSet.txt');
}
