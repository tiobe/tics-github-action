import { httpClient } from '../../../src/viewer/http-client';
import { getLastQServerRunDate } from '../../../src/viewer/qserver';
import { ticsConfigMock } from '../../.setup/mock';

describe('getQualityGate', () => {
  test('Should return quality gates from viewer', async () => {
    ticsConfigMock.baseUrl = 'http://base.url';
    (jest.spyOn(httpClient, 'get') as any).mockResolvedValue({ data: { data: [{ value: 1000000 }] } });

    const response = await getLastQServerRunDate();

    expect(response).toEqual(1000);
  });

  test('Should throw error on faulty get in getQualityGate', async () => {
    (jest.spyOn(httpClient, 'get') as any).mockResolvedValue({ data: { data: [] } });

    let error: any;
    try {
      await getLastQServerRunDate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  test('Should throw error on faulty get in getQualityGate', async () => {
    jest.spyOn(httpClient, 'get').mockRejectedValue(Error());

    let error: any;
    try {
      await getLastQServerRunDate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
