import { isDebug } from '@actions/core';
import { context } from '@actions/github';
import { logger } from '../helper/logger';

export class GithubConfig {
  readonly apiUrl: string;
  readonly owner: string;
  readonly reponame: string;
  readonly commitSha: string;
  readonly eventName: string;
  readonly id: string;
  readonly pullRequestNumber: number;
  readonly debugger: boolean;

  constructor() {
    this.apiUrl = context.apiUrl;
    this.owner = context.repo.owner;
    this.reponame = context.repo.repo;
    this.commitSha = context.sha;
    this.eventName = context.eventName;
    this.id = `${context.runId.toString()}-${context.runNumber.toString()}`;
    this.pullRequestNumber = this.getPullRequestNumber();
    this.debugger = isDebug();

    this.removeWarningListener();
  }

  private getPullRequestNumber() {
    if (context.payload.pull_request) {
      return context.payload.pull_request.number;
    } else if (process.env.PULL_REQUEST_NUMBER) {
      return parseInt(process.env.PULL_REQUEST_NUMBER);
    } else {
      return 0;
    }
  }

  removeWarningListener(): void {
    process.removeAllListeners('warning');
    process.on('warning', warning => {
      logger.debug(warning.message.toString());
    });
  }
}
