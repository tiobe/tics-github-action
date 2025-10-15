import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { ViewerFeature, viewerVersion } from '../../../src/viewer/version';

describe('getViewerVersion', () => {
  beforeEach(() => {
    viewerVersion['viewerVersion'] = undefined;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw error on faulty get in getViewerVersion', async () => {
    jest.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error());

    let error: any;
    try {
      await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  it('should return no github action support if version < 2022.4.0', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: '2022.0.0' }, retryCount: 0, status: 200 });

    const response1 = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    // check if response is cached
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: '2023.1.0' }, retryCount: 0, status: 200 });
    const response2 = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response1).toBeFalsy();
    expect(response2).toBeFalsy();
  });

  it('should return github action support if version >= 2022.4.0', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: '2023.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeTruthy();
  });

  it('should return false if viewer version is too low with prefix character', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: 'r2022.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeFalsy();
  });

  it('should return true if viewer version is sufficient with prefix character', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { version: 'r2025.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeTruthy();
  });
});
