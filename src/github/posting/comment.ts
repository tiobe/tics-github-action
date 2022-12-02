import { githubConfig, octokit } from '../configuration';
import Logger from '../../helper/logger';

export async function createComment(body: string) {
  try {
    const parameters = {
      accept: 'application/vnd.github.v3+json',
      owner: githubConfig.owner,
      repo: githubConfig.reponame,
      issue_number: githubConfig.pullRequestNumber,
      body: body
    };

    Logger.Instance.info('\u001b[35mPosting comment in pull request.');
    await octokit.rest.issues.createComment(parameters);
  } catch (error: any) {
    Logger.Instance.error(`Create issue comment failed: ${error.message}`);
  }
}
