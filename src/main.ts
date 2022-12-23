import { existsSync } from 'fs';
import { postErrorComment } from './github/posting/comment';
import { githubConfig, ticsConfig } from './configuration';
import { changedFilesToFile, getChangedFiles } from './github/calling/pulls';
import Logger from './helper/logger';
import { runTicsAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate } from './tics/fetcher';
import { postReview } from './github/posting/review';
import { createReviewComments } from './github/posting/summary';
import { deletePreviousReviewComments } from './github/posting/annotations';
import { getPostedReviewComments } from './github/calling/annotations';

if (githubConfig.eventName !== 'pull_request') Logger.Instance.exit('This action can only run on pull requests.');

if (!isCheckedOut()) Logger.Instance.exit('No checkout found to analyze. Please perform a checkout before running the TiCS Action.');

main();

async function main() {
  try {
    const changedFiles = await getChangedFiles();
    if (!changedFiles || changedFiles.length <= 0) return Logger.Instance.exit('No changed files found to analyze.');

    const changedFilesFilePath = changedFilesToFile(changedFiles);
    const analysis = await runTicsAnalyzer(changedFilesFilePath);

    if (!analysis.completed) {
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

    const analyzedFiles = await getAnalyzedFiles(analysis.explorerUrl);
    const qualityGate = await getQualityGate(analysis.explorerUrl);
    let reviewComments;

    if (ticsConfig.postAnnotations) {
      const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
      if (annotations) {
        reviewComments = await createReviewComments(annotations, changedFiles);
      }
      const previousReviewComments = await getPostedReviewComments();
      if (previousReviewComments) await deletePreviousReviewComments(previousReviewComments);
    }

    await postReview(analysis, analyzedFiles, qualityGate, reviewComments);

    if (!qualityGate.passed) Logger.Instance.setFailed(qualityGate.message);
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
