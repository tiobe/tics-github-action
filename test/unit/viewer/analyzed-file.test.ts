import { logger } from '../../../src/helper/logger';
import { httpClient } from '../../../src/viewer/http-client';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../../src/viewer/analyzed-files';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';

describe('getAnalyzedFiles', () => {
  test('Should return one analyzed file from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.resolve({ data: { data: [{ formattedValue: 'file.js' }] } }));

    const spy = jest.spyOn(logger, 'debug');

    const response = await getAnalyzedFiles('url');

    expect(response).toEqual(['file.js']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('Should return two analyzed files from viewer', async () => {
    jest
      .spyOn(httpClient, 'get')
      .mockImplementationOnce(
        (): Promise<any> => Promise.resolve({ data: { data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] } })
      );

    const spy = jest.spyOn(logger, 'debug');

    const response = await getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  test('Should throw error on faulty get in getAnalyzedFiles', async () => {
    jest.spyOn(httpClient, 'get').mockImplementationOnce((): Promise<any> => Promise.reject(new Error()));

    let error: any;
    try {
      await getAnalyzedFiles('url');
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});

describe('getAnalyzedFilesUrl', () => {
  ticsConfigMock.baseUrl = 'http://viewer.url';
  ticsCliMock.project = 'project';

  test('Should return url containing date if given', async () => {
    ticsCliMock.branchname = 'branch';

    const url = getAnalyzedFilesUrl({ date: 1714577689 });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CBranch%28branch%29%2CDate%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  test('Should return url containing cdtoken if given', async () => {
    ticsCliMock.branchname = '';

    const url = getAnalyzedFilesUrl({ cdtoken: '1714577689' });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CClientData%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  test('Should return url containing both if both are given', async () => {
    const url = getAnalyzedFilesUrl({ date: 1714577689, cdtoken: '1714577689' });

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CDate%281714577689%29%2CClientData%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  test('Should return url containing none if none are given', async () => {
    const url = getAnalyzedFilesUrl({});

    expect(url).toEqual(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });
});
