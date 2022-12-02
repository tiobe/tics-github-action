import { existsSync } from 'fs';
import { createErrorComment } from './github/posting/comment';
import { githubConfig, ticsConfig } from './github/configuration';
import { changeSetToFile, getChangedFiles } from './github/pulls/pulls';
import Logger from './helper/logger';
import { Analysis } from './helper/models';
import { runTiCSAnalyzer } from './tics/tics_analyzer';
import { createErrorSummary } from './github/posting/summary';
import { warning } from '@actions/core';
import { cliSummary } from './tics/api_helper';

if (githubConfig.eventName !== 'pull_request') Logger.Instance.exit('This action can only run on pull requests.');

if (!isCheckedOut()) Logger.Instance.exit('No checkout found to analyze. Please perform a checkout before running the TiCS Action.');

run();

async function run() {
  try {
    const changeSet = await getChangedFiles();
    if (changeSet.length <= 0) Logger.Instance.exit('No changed files found to analyze.');

    const changeSetFilePath = changeSetToFile(changeSet);
    const analysis = await runTiCSAnalyzer(changeSetFilePath);

    if (analysis.statusCode === -1) {
      postError(analysis);
      Logger.Instance.setFailed('Failed to run TiCS Github Action');
      cliSummary(analysis);
    }

    cliSummary(analysis);
  } catch (error: any) {
    Logger.Instance.error('Failed to run TiCS Github Action');
    Logger.Instance.exit(error.message);
  }
}

/**
 * Creates a comment on the pull request to show what errors were given.
 * @param analysis output from the runTiCSAnalyzer.
 */
function postError(analysis: Analysis) {
  createErrorComment(createErrorSummary(analysis.errorList, analysis.warningList));
}

/**
 * Checks if a .git directory exists to see if a checkout has been performed.
 * @returns boolean
 */
function isCheckedOut() {
  if (!existsSync('.git')) {
    Logger.Instance.error('No git checkout found');
    return false;
  }
  return true;
}
