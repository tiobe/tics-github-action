import github from '@actions/github'; //GitHub API client for GitHub Actions
import core from '@actions/core';
import ProxyAgent from 'proxy-agent';
import { githubConfig } from '../configuration.js';

//Octokit client is authenticated
const octokit = github.getOctokit(process.env.GITHUB_TOKEN, { request: { agent: new ProxyAgent() } });

export const createIssueComment = async (params) => {
  try {
    const parameters = {
      accept: 'application/vnd.github.v3+json',
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber,
      body: params.body ? params.body : ''
    };

    core.info('\u001b[35mPosting review in pull request');
    await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', parameters);
  } catch (e) {
    core.error('Create issue comment failed: ', e);
  }
};
