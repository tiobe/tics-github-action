import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { getLastQServerRunDate } from '../../../src/viewer/qserver';
import { ticsConfigMock } from '../../.setup/mock';

describe('getQualityGate', () => {
  it('should return quality gates from viewer', async () => {
    ticsConfigMock.baseUrl = 'http://base.url';
    (jest.spyOn(httpClient, 'get') as any).mockResolvedValue({ data: { data: [{ value: 1000000 }] } });

    const response = await getLastQServerRunDate();

    expect(response).toBe(1000);
  });

  it('should throw error on empty get in getQualityGate', async () => {
    (jest.spyOn(httpClient, 'get') as any).mockResolvedValue({ data: { data: [] } });

    let error: any;
    try {
      await getLastQServerRunDate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });

  it('should throw error on faulty get in getQualityGate', async () => {
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
