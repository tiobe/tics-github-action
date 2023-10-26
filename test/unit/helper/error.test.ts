import { RequestError } from '@octokit/request-error';
import { handleOctokitError } from '../../../src/helper/error';

describe('error', () => {
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
