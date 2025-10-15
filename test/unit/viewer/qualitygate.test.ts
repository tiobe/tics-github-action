import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { getQualityGate, getQualityGateUrl } from '../../../src/viewer/qualitygate';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { viewerVersion } from '../../../src/viewer/version';

describe('getQualityGate', () => {
  it('should return quality gates from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { data: 'data' }, retryCount: 0, status: 200 });

    const response = await getQualityGate('url');

    expect(response).toEqual({ data: 'data' });
  });

  it('should throw error on faulty get in getQualityGate', async () => {
    jest.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error());

    let error: any;
    try {
      await getQualityGate('url');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getQualityGateUrl', () => {
  let supportNewAnnotations = false;

  beforeAll(() => {
    jest.spyOn(viewerVersion, 'viewerSupports').mockImplementation(async () => {
      return supportNewAnnotations;
    });
  });

  it('should return url containing date if given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';
    ticsCliMock.branchname = 'branch';

    supportNewAnnotations = false;
    const url = await getQualityGateUrl({ project: 'project', date: 1714577689 });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=project&branch=branch&fields=details%2CblockingAfter&includeFields=annotationsApiV1Links&date=1714577689'
    );
  });

  it('should return url containing cdtoken if given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';
    ticsCliMock.branchname = '';

    supportNewAnnotations = false;
    const url = await getQualityGateUrl({ project: 'project', cdtoken: '1714577689' });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=project&fields=details%2CblockingAfter&includeFields=annotationsApiV1Links&cdt=1714577689'
    );
  });

  it('should return url containing both if both are given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';

    supportNewAnnotations = false;
    const url = await getQualityGateUrl({ project: 'project', date: 1714577689, cdtoken: '1714577689' });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=project&fields=details%2CblockingAfter&includeFields=annotationsApiV1Links&date=1714577689&cdt=1714577689'
    );
  });

  it('should return url containing none if none are given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';

    supportNewAnnotations = true;
    const url = await getQualityGateUrl({ project: 'project' });

    expect(url).toBe('http://viewer.url/api/public/v1/QualityGateStatus?project=project&fields=details%2CblockingAfter&includeFields=absValue');
  });
});
