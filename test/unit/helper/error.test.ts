import { RequestError } from '@octokit/request-error';
import { getRetryErrorMessage, getRetryMessage, handleOctokitError } from '../../../src/helper/error';
import { RequestError as TicsError } from '@tiobe/http-client/lib/retry';
import { ClientResponse } from '@tiobe/http-client';

describe('handleOctokitError', () => {
  test('Should return error unknown on invalid error.', () => {
    const message = handleOctokitError('Error message here');

    expect(message).toEqual('reason unkown');
  });

  test('Should return error message on valid error and no retries.', () => {
    const message = handleOctokitError(Error('Error message here'));

    expect(message).toEqual('Error message here');
  });

  test('Should return error message on valid error and no retries.', () => {
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

    expect(message).toEqual('Retried 5 time(s), but got: Error message here');
  });
});

describe('getRetryErrorMessage', () => {
  test('Should return error if error given is string.', () => {
    const message = getRetryErrorMessage('Error message here');

    expect(message).toEqual('Error message here');
  });

  test('Should return error message if an error is given.', () => {
    const message = getRetryErrorMessage(Error('Error message here'));

    expect(message).toEqual('Error message here');
  });

  test('Should return Error on RequestError of @tiobe/http-client with retry.', () => {
    const message = getRetryErrorMessage(new TicsError('Error message here', 2));

    expect(message).toEqual('Error message here (retried 2 times)');
  });

  test('Should return Error on RequestError of @tiobe/http-client without retry.', () => {
    const message = getRetryErrorMessage(new TicsError('Error message here', 0));

    expect(message).toEqual('Error message here');
  });
});

describe('getRetryMessage', () => {
  test('Should return not add if not an error.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 0,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toEqual('Error message here');
  });

  test('Should return with retries added if there are some.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 2,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toEqual('Error message here (retried 2 times)');
  });

  test('Should return message without retries added if there are none.', () => {
    const response: ClientResponse<string> = {
      status: 0,
      retryCount: 0,
      data: ''
    };

    const message = getRetryMessage(response, 'Error message here');

    expect(message).toEqual('Error message here');
  });
});
