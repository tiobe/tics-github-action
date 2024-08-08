import { isDebug } from '@actions/core';
import { context } from '@actions/github';
import { logger } from '../helper/logger';
import { GithubEvent } from './github-event';

export class GithubConfig {
  readonly apiUrl: string;
  readonly owner: string;
  readonly reponame: string;
  readonly commitSha: string;
  readonly event: GithubEvent;
  readonly id: string;
  readonly pullRequestNumber: number | undefined;
  readonly debugger: boolean;

  constructor() {
    this.apiUrl = context.apiUrl;
    this.owner = context.repo.owner;
    this.reponame = context.repo.repo;
    this.commitSha = context.sha;
    this.event = this.getGithubEvent();
    this.id = `${context.runId.toString()}-${context.runNumber.toString()}`;
    this.pullRequestNumber = this.getPullRequestNumber();
    this.debugger = isDebug();

    this.removeWarningListener();
  }

  private getPullRequestNumber(): number | undefined {
    if (context.payload.pull_request) {
      return context.payload.pull_request.number;
    } else if (process.env.PULL_REQUEST_NUMBER) {
      return parseInt(process.env.PULL_REQUEST_NUMBER);
    } else {
      return undefined;
    }
  }

  private getGithubEvent() {
    switch (context.eventName) {
      case GithubEvent.PULL_REQUEST.name:
        return GithubEvent.PULL_REQUEST;
      case GithubEvent.PULL_REQUEST_TARGET.name:
        return GithubEvent.PULL_REQUEST_TARGET;
      case GithubEvent.PUSH.name:
        return GithubEvent.PUSH;
      case GithubEvent.WORKFLOW_CALL.name:
        return GithubEvent.WORKFLOW_CALL;
      case GithubEvent.WORKFLOW_DISPATCH.name:
        return GithubEvent.WORKFLOW_DISPATCH;
      case GithubEvent.WORKFLOW_RUN.name:
        return GithubEvent.WORKFLOW_RUN;
      default:
        return GithubEvent.PUSH;
    }
  }

  removeWarningListener(): void {
    process.removeAllListeners('warning');
    process.on('warning', warning => {
      logger.debug(warning.message.toString());
    });
  }
}
