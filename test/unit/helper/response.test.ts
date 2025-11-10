import { describe, expect, it } from '@jest/globals';
import { RequestError } from '@octokit/request-error';
import { RequestError as TicsError } from '@tiobe/http-client/lib/retry';
import { ClientResponse } from '@tiobe/http-client';
import { getRetryErrorMessage, getRetryMessage, handleOctokitError } from '../../../src/helper/response';

describe('handleOctokitError', () => {
  it('should return error unknown on invalid error.', () => {
    const message = handleOctokitError('Error message here');

    expect(message).toBe('reason unkown');
  });

  it('should return error message on valid error and no retries.', () => {
    const message = handleOctokitError(Error('Error message here'));

    expect(message).toBe('Error message here');
  });

  it('should return error message on valid request error and no retries.', () => {
    const error = new RequestError('Error message here', 502, {
      request: {
        method: 'GET',
        url: 'url',
        headers: {},
        request: {
          retryCount: 5
        }
      },
      headers: {}
    });

    const message = handleOctokitError(error);

    expect(message).toBe('Retried 5 time(s), but got: Error message here');
  });
});

describe('getRetryErrorMessage', () => {
  it('should return error if error given is string.', () => {
    const message = getRetryErrorMessage('Error message here');

    expect(message).toBe('Error message here');
  });

  it('should return error message if an error is given.', () => {
    const message = getRetryErrorMessage(Error('Error message here'));

    expect(message).toBe('Error message here');
  });

  it('should return Error on RequestError of @tiobe/http-client with retry.', () => {
    const message = getRetryErrorMessage(new TicsError('Error message here', 400, 2));

    expect(message).toBe('Error message here (retried 2 times)');
  });

  it('should return Error on RequestError of @tiobe/http-client without retry.', () => {
    const message = getRetryErrorMessage(new TicsError('Error message here', 400, 0));

    expect(message).toBe('Error message here');
  });
});

describe('getRetryMessage', () => {
  it('should return not add if not an error.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 0,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toBe('Error message here');
  });

  it('should return with retries added if there are some.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 2,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toBe('Error message here (retried 2 times)');
  });

  it('should return message without retries added if there are none.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 0,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toBe('Error message here');
  });
});
