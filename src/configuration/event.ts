export class GithubEvent {
  static readonly PULL_REQUEST = new GithubEvent('pull_request', true);
  static readonly PULL_REQUEST_TARGET = new GithubEvent('pull_request_target', true);
  static readonly PUSH = new GithubEvent('push', false);
  static readonly WORKFLOW_CALL = new GithubEvent('workflow_call', false);
  static readonly WORKFLOW_DISPATCH = new GithubEvent('workflow_dispatch', false);
  static readonly WORKFLOW_RUN = new GithubEvent('workflow_run', false);

  constructor(
    readonly name: string,
    readonly isPullRequest: boolean
  ) {}
}
