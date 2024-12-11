import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { getViewerVersion } from '../../../src/viewer/version';

describe('getViewerVersion', () => {
  it('should version of the viewer', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: '2022.0.0' }, retryCount: 0, status: 200 });

    const response = await getViewerVersion();

    expect(response?.version).toBe('2022.0.0');
  });

  it('should throw error on faulty get in getViewerVersion', async () => {
    jest.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error());

    let error: any;
    try {
      await getViewerVersion();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
