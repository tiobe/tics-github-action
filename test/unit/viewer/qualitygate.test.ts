import { httpClient } from '../../../src/viewer/_http-client';
import { getQualityGate, getQualityGateUrl } from '../../../src/viewer/qualitygate';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';

describe('getQualityGate', () => {
  test('Should return quality gates from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: 'data' } }));

    const response = await getQualityGate('url');

    expect(response).toEqual({ data: 'data' });
  });

  test('Should throw error on faulty get in getQualityGate', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

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
  test('Should return url containing date if given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';
    ticsCliMock.branchname = 'branch';

    const url = getQualityGateUrl({ date: 1714577689 });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=&branch=branch&fields=details%2CannotationsApiV1Links&includeFields=blockingAfter&date=1714577689'
    );
  });

  test('Should return url containing cdtoken if given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';
    ticsCliMock.branchname = '';

    const url = getQualityGateUrl({ cdtoken: '1714577689' });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=&fields=details%2CannotationsApiV1Links&includeFields=blockingAfter&cdt=1714577689'
    );
  });

  test('Should return url containing both if both are given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';

    const url = getQualityGateUrl({ date: 1714577689, cdtoken: '1714577689' });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=&fields=details%2CannotationsApiV1Links&includeFields=blockingAfter&date=1714577689&cdt=1714577689'
    );
  });

  test('Should return url containing none if none are given', async () => {
    ticsConfigMock.baseUrl = 'http://viewer.url';

    const url = getQualityGateUrl({});

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/QualityGateStatus?project=&fields=details%2CannotationsApiV1Links&includeFields=blockingAfter'
    );
  });
});
