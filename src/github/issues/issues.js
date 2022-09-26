import { Octokit } from "@octokit/action"; //GitHub API client for GitHub Actions
import core from '@actions/core';
import { githubConfig } from '../configuration.js';
import fs from 'fs';

//Octokit client is authenticated
const octokit = new Octokit();
const payload = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const pullRequestNum = payload.pull_request ? payload.pull_request.number : "";

/* Helper functions to construct a checkrun */
const getParams = (inputparams) => {
    let parameters = {};

    parameters = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        issue_number: pullRequestNum,
        comment_id: inputparams.comment_id ?  inputparams.comment_id : '',
        body: inputparams.body ? inputparams.body : ''
    }
    
    return parameters;
}

export const createIssueComment =  async(params) => {
    try {
        core.info(`\u001b[35m > Posting pull request decoration`);
        console.log(pullRequestNum);
        await octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', getParams(params))
    } catch(e) {
        console.log("Create issue comment failed: ", e)
    }
};
