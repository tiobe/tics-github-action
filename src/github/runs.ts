import { logger } from '../helper/logger.js';
import { handleOctokitError } from '../helper/response.js';
import { githubConfig } from '../configuration/config.js';
import { octokit } from './octokit.js';

/**
 * Create review on the pull request from the analysis given.
 * @param body Body containing the summary of the review
 * @param event Either approve or request changes in the review.
 */
export async function getCurrentStepPath(): Promise<string> {
  const params = {
    owner: githubConfig.owner,
    repo: githubConfig.reponame,
    run_id: githubConfig.runId,
    attempt_number: githubConfig.runAttempt
  };

  const stepname = [githubConfig.workflow, githubConfig.job, githubConfig.action];
  try {
    logger.debug('Retrieving step name for current step...');
    const response = await octokit.rest.actions.listJobsForWorkflowRunAttempt(params);
    logger.debug(JSON.stringify(response.data));
    const jobs = response.data.jobs.filter(j => j.status === 'in_progress' && j.runner_name === githubConfig.runnerName);

    if (jobs.length === 1) {
      const job = jobs[0];
      stepname[1] = job.name;
      const steps = job.steps?.filter(s => s.status === 'in_progress');
      if (steps?.length === 1) {
        stepname[2] = steps[0].name;
      }
    }
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.notice(`Retrieving the step name failed: ${message}`);
  }
  return stepname.join(' / ');
}
