import { existsSync } from 'fs';
import { postErrorComment } from './github/posting/comment';
import { githubConfig } from './github/configuration';
import { changeSetToFile, getChangedFiles } from './github/calling/pulls';
import Logger from './helper/logger';
import { runTiCSAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getAnnotations, getQualityGate } from './tics/fetcher';
import { postReview } from './github/posting/review';

if (githubConfig.eventName !== 'pull_request') Logger.Instance.exit('This action can only run on pull requests.');

if (!isCheckedOut()) Logger.Instance.exit('No checkout found to analyze. Please perform a checkout before running the TiCS Action.');

main();

async function main() {
  try {
    const changeSet = await getChangedFiles();
    if (changeSet.length <= 0) Logger.Instance.exit('No changed files found to analyze.');

    const changeSetFilePath = changeSetToFile(changeSet);
    const analysis = await runTiCSAnalyzer(changeSetFilePath);

    if (analysis.statusCode === -1) {
      postErrorComment(analysis);
      Logger.Instance.setFailed('Failed to run TiCS Github Action.');
      cliSummary(analysis);
      return;
    }
    if (!analysis.explorerUrl) {
      Logger.Instance.setFailed('Failed to run TiCS Github Action.');
      analysis.errorList.push('Explorer URL not returned from TiCS analysis.');
      cliSummary(analysis);
      return;
    }

    const qualityGate = await getQualityGate(analysis.explorerUrl);
    console.log(qualityGate);
    if (!qualityGate.passed) {
      Logger.Instance.setFailed(qualityGate.message);
    }
    postReview(analysis, qualityGate);
    console.log(getAnnotations(qualityGate.annotationsApiV1Links));

    cliSummary(analysis);
  } catch (error: any) {
    Logger.Instance.error('Failed to run TiCS Github Action');
    Logger.Instance.exit(error.message);
  }
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
