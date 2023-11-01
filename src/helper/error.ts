import { RequestError } from '@octokit/request-error';

export function handleOctokitError(error: unknown): string {
  let message = 'reason unkown';
  if (error instanceof Error) {
    message = '';
    const retryCount = <number | undefined>(error as RequestError).request?.request?.retryCount;
    if (retryCount) {
      message = `Retried ${retryCount} time(s), but got: `;
    }
    message += error.message;
  }
  return message;
}
