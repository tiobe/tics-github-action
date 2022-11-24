import github from '@actions/github'; //GitHub API client for GitHub Actions
import core from '@actions/core';
import { githubConfig } from '../configuration.js';

//Octokit client is authenticated
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

/* Helper functions to construct a checkrun */
const getParams = (inputparams) => {
  let parameters = {};

  parameters = {
    accept: 'application/vnd.github.v3+json',
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    issue_number: githubConfig.pullRequestNumber,
    body: inputparams.body ? inputparams.body : ''
  };

  return parameters;
};

export const createIssueComment = async (params) => {
  try {
    core.info('\u001b[35mPosting review in pull request');
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', getParams(params));
  } catch (e) {
    core.error('Create issue comment failed: ', e);
  }
};
