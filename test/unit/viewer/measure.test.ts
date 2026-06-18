import { afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { getMeasureApiData } from '../../../src/viewer/measure';
import { SpiedFunction } from 'jest-mock';

describe('getMeasureApiData', () => {
  let getSpy: SpiedFunction<any>;

  beforeAll(() => {
    ticsConfigMock.baseUrl = 'http://base.url';
    ticsCliMock.project = 'project';
  });

  beforeEach(() => {
    getSpy = jest.spyOn(httpClient, 'get');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return data passed back and call with client data token', async () => {
    getSpy.mockResolvedValue({ data: { data: [{ value: undefined }] } });

    const response = await getMeasureApiData(['loc', 'tqi'], { cdtoken: 'token' });

    expect(response.data).toStrictEqual([{ value: undefined }]);
    expect(getSpy).toHaveBeenCalledWith('http://base.url/api/public/v1/Measure?filters=Project(project),ClientData(token)&metrics=loc,tqi');
  });

  it('should return data passed back and call with Delta()', async () => {
    ticsCliMock.branchname = 'main';
    getSpy.mockResolvedValue({ data: { data: [{ value: undefined }] } });

    const response = await getMeasureApiData(['loc', 'tqi'], { deltaPrevious: true });

    expect(response.data).toStrictEqual([{ value: undefined }]);
    expect(getSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/Measure?filters=Project(project),Branch(main)&metrics=Delta(loc,Run(-2)),Delta(tqi,Run(-2))'
    );
  });

  it('should throw error on faulty get and call with Delta()', async () => {
    getSpy.mockRejectedValue(Error());

    let error: any;
    try {
      await getMeasureApiData(['loc', 'tqi'], { deltaDate: 1781777589 });
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
    expect(getSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/Measure?filters=Project(project),Branch(main)&metrics=Delta(loc,1781777589),Delta(tqi,1781777589)'
    );
  });
});
