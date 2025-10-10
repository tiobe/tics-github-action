import { describe, expect, it, jest } from '@jest/globals';
import { logger } from '../../../src/helper/logger';
import { httpClient } from '../../../src/viewer/http-client';
import { getAnalyzedFiles, getAnalyzedFilesUrl } from '../../../src/viewer/analyzed-files';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';

describe('getAnalyzedFiles', () => {
  it('should return one analyzed file from viewer', async () => {
    jest.spyOn(httpClient, 'get').mockResolvedValueOnce({ data: { data: [{ formattedValue: 'file.js' }] }, status: 200, retryCount: 0 });

    const spy = jest.spyOn(logger, 'debug');

    const response = await getAnalyzedFiles('url');

    expect(response).toEqual(['file.js']);
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should return two analyzed files from viewer', async () => {
    jest
      .spyOn(httpClient, 'get')
      .mockResolvedValueOnce({ data: { data: [{ formattedValue: 'file.js' }, { formattedValue: 'files.js' }] }, status: 200, retryCount: 0 });

    const spy = jest.spyOn(logger, 'debug');

    const response = await getAnalyzedFiles('url');

    expect(spy).toHaveBeenCalledTimes(3);
    expect(response).toEqual(['file.js', 'files.js']);
  });

  it('should throw error on faulty get in getAnalyzedFiles', async () => {
    jest.spyOn(httpClient, 'get').mockRejectedValueOnce(new Error());

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

  it('should return url containing date if given', async () => {
    ticsCliMock.branchname = 'branch';

    const url = getAnalyzedFilesUrl({ project: 'project', date: 1714577689 });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CBranch%28branch%29%2CDate%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  it('should return url containing cdtoken if given', async () => {
    ticsCliMock.branchname = '';

    const url = getAnalyzedFilesUrl({ project: 'project', cdtoken: '1714577689' });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CClientData%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  it('should return url containing both if both are given', async () => {
    const url = getAnalyzedFilesUrl({ project: 'project', date: 1714577689, cdtoken: '1714577689' });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CDate%281714577689%29%2CClientData%281714577689%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });

  it('should return url containing none if none are given', async () => {
    const url = getAnalyzedFilesUrl({ project: 'project' });

    expect(url).toBe(
      'http://viewer.url/api/public/v1/Measure?metrics=filePath&filters=Project%28project%29%2CCodeType%28Set%28production%2Ctest%2Cexternal%2Cgenerated%29%29%2CWindow%28-1%29%2CFile%28%29'
    );
  });
});
