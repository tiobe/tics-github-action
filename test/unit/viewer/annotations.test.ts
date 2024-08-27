import { httpClient } from '../../../src/viewer/http-client';
import { getAnnotations } from '../../../src/viewer/annotations';
import { ticsConfigMock } from '../../.setup/mock';

describe('getAnnotations', () => {
  ticsConfigMock.baseUrl = 'http://base.url';

  test('Should return analyzed files from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: [{ type: 'CS' }] } }));
    jest
      .spyOn(httpClient, 'get')
      .mockImplementationOnce(
        (): Promise<any> =>
          Promise.resolve({ data: { data: [{ type: 'CS' }], annotationTypes: { CS: { instanceName: 'Coding Standard Violations' } } } })
      );

    const response = await getAnnotations([{ url: 'url?fields=default,blocking' }, { url: 'url' }]);

    expect(response).toEqual([
      { type: 'CS', gateId: 0, count: 1, instanceName: 'CS' },
      { type: 'CS', gateId: 1, count: 1, instanceName: 'Coding Standard Violations' }
    ]);
  });

  test('Should return no analyzed files when no urls are given', async () => {
    const response = await getAnnotations([]);

    expect(response).toEqual([]);
  });

  test('Should throw error on faulty get in getAnnotations', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await getAnnotations([{ url: 'url' }]);
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
