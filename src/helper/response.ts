import { RequestError as OctokitError } from '@octokit/request-error';
import { ClientResponse } from '@tiobe/http-client';
import { RequestError as TicsError } from '@tiobe/http-client/lib/retry';

export function handleOctokitError(error: unknown): string {
  let message = 'reason unkown';
  if (error instanceof Error) {
    message = '';
    const retryCount = error instanceof OctokitError ? (error.request.request?.retryCount as number) : undefined;
    if (retryCount) {
      message = `Retried ${retryCount.toString()} time(s), but got: `;
    }
    message += error.message;
  }
  return message;
}

export function getRetryErrorMessage(error: unknown): string {
  let message = error as string;
  if (error instanceof Error) {
    message = error.message;

    if (error instanceof TicsError) {
      if (error.retryCount > 0) {
        message += ` (retried ${error.retryCount.toString()} times)`;
      }
    }
  }

  return message;
}

export function getRetryMessage<T>(response: ClientResponse<T>, message: string): string {
  if (response.retryCount > 0) {
    message += ` (retried ${response.retryCount.toString()} times)`;
  }
  return message;
}
