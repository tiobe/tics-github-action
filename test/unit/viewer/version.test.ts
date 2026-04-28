import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../../src/viewer/http-client';
import { ViewerFeature, viewerVersion } from '../../../src/viewer/version';

describe('getViewerVersion', () => {
  beforeEach(() => {
    viewerVersion['viewerVersion'] = undefined;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw error on faulty get in getViewerVersion', async () => {
    vi.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error());

    let error: any;
    try {
      await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  it('should return no github action support if version < 2022.4.0', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2022.0.0' }, retryCount: 0, status: 200 });

    const response1 = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    // check if response is cached
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2023.1.0' }, retryCount: 0, status: 200 });
    const response2 = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response1).toBeFalsy();
    expect(response2).toBeFalsy();
  });

  it('should return github action support if version >= 2022.4.0', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2023.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeTruthy();
  });

  it('should return false if viewer version is too low with prefix character', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: 'r2022.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeFalsy();
  });

  it('should return true if viewer version is sufficient with prefix character', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: 'r2025.1.0' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);

    expect(response).toBeTruthy();
  });

  it('should return false if viewer version is insufficient with reversion', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2026.1.2.54220' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.PROJECT_CREATION);

    expect(response).toBeFalsy();
  });

  it('should return true if viewer version is sufficient with reversion', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2026.1.2.54222' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.PROJECT_CREATION);

    expect(response).toBeTruthy();
  });

  it('should return true if viewer version is sufficient with no reversion', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: '2026.1.3' }, retryCount: 0, status: 200 });

    const response = await viewerVersion.viewerSupports(ViewerFeature.PROJECT_CREATION);

    expect(response).toBeTruthy();
  });

  it('should throw viewer returns unparsable version', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { fullVersion: null }, retryCount: 0, status: 200 });

    let error: any;
    try {
      await viewerVersion.viewerSupports(ViewerFeature.GITHUB_ACTION);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toStrictEqual('Viewer returned empty version.');
  });
});
