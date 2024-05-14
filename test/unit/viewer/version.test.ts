import { httpClient } from '../../../src/viewer/http-client';
import { getViewerVersion } from '../../../src/viewer/version';

describe('getViewerVersion', () => {
  test('Should version of the viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { version: '2022.0.0' } }));

    const response = await getViewerVersion();

    expect(response?.version).toEqual('2022.0.0');
  });

  test('Should throw error on faulty get in getViewerVersion', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await getViewerVersion();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
