import { httpClient } from '../../../src/viewer/http-client';
import { getAnnotations } from '../../../src/viewer/annotations';
import { ticsConfigMock } from '../../.setup/mock';

describe('getAnnotations', () => {
  ticsConfigMock.baseUrl = 'http://base.url';

  test('Should return annotations from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: [{ type: 'CS' }] } }));
    jest.spyOn(httpClient, 'get').mockImplementationOnce(
      (): Promise<any> =>
        Promise.resolve({
          data: {
            data: [{ type: 'CS', line: 10, count: 2 }],
            annotationTypes: { CS: { instanceName: 'Coding Standard Violations' } }
          }
        })
    );

    const response = await getAnnotations([{ url: 'url?fields=default,blocking' }, { url: 'url' }]);

    expect(response).toEqual([
      { type: 'CS', gateId: 0, line: 1, count: 1, instanceName: 'CS' },
      { type: 'CS', gateId: 1, line: 10, count: 2, instanceName: 'Coding Standard Violations' }
    ]);
  });

  test('Should return complexity annotations from the viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce(
      (): Promise<any> =>
        Promise.resolve({
          data: {
            data: [
              { type: 'COMPLEXITY', line: 10, complexity: 3, functionName: 'main' },
              { type: 'COMPLEXITY', line: 2, complexity: 2, functionName: 'test', msg: 'testing' }
            ]
          }
        })
    );

    const response = await getAnnotations([{ url: 'url' }]);

    expect(response).toEqual([
      {
        type: 'COMPLEXITY',
        complexity: 3,
        functionName: 'main',
        gateId: 0,
        line: 10,
        count: 1,
        instanceName: 'COMPLEXITY',
        msg: 'Function main has a complexity of 3'
      },
      {
        type: 'COMPLEXITY',
        complexity: 2,
        functionName: 'test',
        gateId: 0,
        line: 2,
        count: 1,
        instanceName: 'COMPLEXITY',
        msg: 'testing'
      }
    ]);
  });

  test('Should return no annotations when no urls are given', async () => {
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
