import { existsSync } from 'fs';
import { postErrorComment } from './github/posting/comment';
import { githubConfig, ticsConfig } from './configuration';
import { changedFilesToFile, getChangedFiles } from './github/calling/pulls';
import Logger from './helper/logger';
import { runTicsAnalyzer } from './tics/analyzer';
import { cliSummary } from './tics/api_helper';
import { getAnalyzedFiles, getAnnotations, getQualityGate } from './tics/fetcher';
import { postNothingAnalyzedReview, postReview } from './github/posting/review';
import { createReviewComments } from './helper/summary';
import { deletePreviousReviewComments } from './github/posting/annotations';
import { getPostedReviewComments } from './github/calling/annotations';
import { Events } from './helper/enums';

run();

// exported for testing purposes
export async function run() {
  if (githubConfig.eventName !== 'pull_request') return Logger.Instance.exit('This action can only run on pull requests.');

  if (!isCheckedOut()) return Logger.Instance.exit('No checkout found to analyze. Please perform a checkout before running the TiCS Action.');

  await main();
}

async function main() {
  try {
    const changedFiles = await getChangedFiles();
    if (!changedFiles || changedFiles.length <= 0) return Logger.Instance.setFailed('No changed files found to analyze.');

    const changedFilesFilePath = changedFilesToFile(changedFiles);
    const analysis = await runTicsAnalyzer(changedFilesFilePath);

    if (!analysis.explorerUrl) {
      if (!analysis.completed) {
        postErrorComment(analysis);
        Logger.Instance.setFailed('Failed to run TiCS Github Action.');
      } else if (analysis.warningList.find(w => w.includes('[WARNING 5057]'))) {
        postNothingAnalyzedReview('No changed files applicable for TiCS analysis quality gating.', Events.APPROVE);
      } else {
        Logger.Instance.setFailed('Failed to run TiCS Github Action.');
        analysis.errorList.push('Explorer URL not returned from TiCS analysis.');
      }
      cliSummary(analysis);
      return;
    }

    const analyzedFiles = await getAnalyzedFiles(analysis.explorerUrl);
    const qualityGate = await getQualityGate(analysis.explorerUrl);
    let reviewComments;

    if (ticsConfig.postAnnotations) {
      const annotations = await getAnnotations(qualityGate.annotationsApiV1Links);
      if (annotations && annotations.length > 0) {
        reviewComments = await createReviewComments(annotations, changedFiles);
      }
      const previousReviewComments = await getPostedReviewComments();
      if (previousReviewComments && previousReviewComments.length > 0) {
        await deletePreviousReviewComments(previousReviewComments);
      }
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
