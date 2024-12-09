import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig } from '../configuration/config';
import { octokit } from './octokit';

/**
 * Create review on the pull request from the analysis given.
 * @param body Body containing the summary of the review
 * @param event Either approve or request changes in the review.
 */
export async function getCurrentStepName(): Promise<string> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    run_id: githubConfig.runId,
    attempt_number: githubConfig.runAttempt
  };

  let stepname = githubConfig.action;
  try {
    logger.debug('Retrieving step name for current step...');
    const response = await octokit.rest.actions.listJobsForWorkflowRunAttempt(params);
    logger.debug(JSON.stringify(response.data));
    const jobs = response.data.jobs.filter(j => j.status === 'in_progress' && j.runner_name === githubConfig.runnerName);

    if (jobs.length === 1) {
      const steps = jobs[0].steps?.filter(s => s.status === 'in_progress');
      if (steps?.length === 1) {
        stepname = steps[0].name;
      }
    }
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Retrieving the step name failed: ${message}`);
  }
  return stepname;
}
