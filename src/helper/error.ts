import { RequestError as OctokitError } from '@octokit/request-error';
import { RequestError as TicsError } from '@tiobe/http-client/lib/retry';

export function handleOctokitError(error: unknown): string {
  let message = 'reason unkown';
  if (error instanceof Error) {
    message = '';
    const retryCount = <number | undefined>(error as OctokitError).request?.request?.retryCount;
    if (retryCount) {
      message = `Retried ${retryCount} time(s), but got: `;
    }
    message += error.message;
  }
  return message;
}

export function getRetryErrorMessage(error: unknown): string {
  let message = error as string;
  if (error instanceof TicsError) {
    message = error.message;
    if (error.retryCount > 0) {
      message += ` (retried ${error.retryCount} times)`;
    }
  }
  return message;
}
