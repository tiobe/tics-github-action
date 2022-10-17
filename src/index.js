import github from '@actions/github';
import core from '@actions/core';
import { TicsAnalyzer } from './tics/TicsAnalyzer.js';
import { ticsConfig, githubConfig } from './github/configuration.js';
import { createIssueComment } from './github/issues/issues.js';
import { getPRChangedFiles, changeSetToFileList } from './github/pulls/pulls.js';
import { getErrorSummary, getQualityGateSummary, getLinkSummary, getFilesSummary } from './github/summary/index.js';


if (githubConfig.eventName == 'pull_request') {
    run();
} else {
    core.setFailed("This action is running only on pull request events.");
}

export async function run() {
    try {
        getPRChangedFiles().then((changeSet) => {
            core.info(`\u001b[35m > Retrieving changed files to analyse`);
            core.info(`Changed files list retrieved: ${changeSet}`);
            return changeSet;
        }).then((changeSet) => {
            let fileListPath = changeSetToFileList(changeSet);
            
            core.info(`\u001b[35m > Analysing new pull request for project ${ticsConfig.projectName}.`);
            const ticsAnalyzer = new TicsAnalyzer();
            ticsAnalyzer.run(changeSet, fileListPath);
        });

    } catch (error) {
       core.error("Failed to run TiCS Github Action");
       core.error(error);
       core.setFailed(error.message);
    }
}

export async function postSummary(summary, isError) {
    let commentBody = {};

    if (isError) {
        commentBody.body = getErrorSummary(summary);
        createIssueComment(commentBody)
    } else {
        commentBody.body = getQualityGateSummary(summary.qualitygates) + getLinkSummary(summary.explorerUrl) + getFilesSummary(summary.changeSet);
        createIssueComment(commentBody);
    }
}