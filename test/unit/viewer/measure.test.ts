import { afterEach, beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { httpClient } from '../../../src/viewer/http-client';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { getMeasureApiData } from '../../../src/viewer/measure';

describe('getMeasureApiData', () => {
  let getSpy: Mock<typeof httpClient.get>;

  beforeAll(() => {
    ticsConfigMock.baseUrl = 'http://base.url';
  });

  beforeEach(() => {
    getSpy = vi.spyOn(httpClient, 'get');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return data passed back and call with client data token', async () => {
    getSpy.mockResolvedValue({
      data: { data: [{ value: undefined }] },
      status: 0,
      retryCount: 0
    });

    const response = await getMeasureApiData(['loc', 'tqi'], 'project', { cdtoken: 'token' });

    expect(response.data).toStrictEqual([{ value: undefined }]);
    expect(getSpy).toHaveBeenCalledWith('http://base.url/api/public/v1/Measure?filters=Project(project),ClientData(token)&metrics=loc,tqi');
  });

  it('should return data passed back and call with Delta()', async () => {
    ticsCliMock.branchname = 'main';
    getSpy.mockResolvedValue({
      data: { data: [{ value: undefined }] },
      status: 0,
      retryCount: 0
    });

    const response = await getMeasureApiData(['loc', 'tqi'], 'project', { deltaPrevious: true });

    expect(response.data).toStrictEqual([{ value: undefined }]);
    expect(getSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/Measure?filters=Project(project),Branch(main)&metrics=Delta(loc,Run(-2)),Delta(tqi,Run(-2))'
    );
  });

  it('should throw error on faulty get and call with Delta()', async () => {
    getSpy.mockRejectedValue(Error());

    let error: any;
    try {
      await getMeasureApiData(['loc', 'tqi'], 'project', { deltaDate: 1781777589 });
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect(getSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/Measure?filters=Project(project),Branch(main)&metrics=Delta(loc,1781777589),Delta(tqi,1781777589)'
    );
  });
});
