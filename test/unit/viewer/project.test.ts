import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { createProject } from '../../../src/viewer/project';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { SpiedFunction } from 'jest-mock';

describe('createProject', () => {
  let putSpy: SpiedFunction<any>;

  beforeAll(() => {
    ticsConfigMock.baseUrl = 'http://base.url';
  });

  beforeEach(() => {
    putSpy = jest.spyOn(httpClient, 'put');
    jest.clearAllMocks();
  });

  it('should pass creating a project using default branchdir', async () => {
    putSpy.mockResolvedValue('');

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: '',
        branchName: 'main',
        branchDir: '',
        calculate: true,
        visible: true,
        renameTo: { branchName: 'main' }
      })
    );
  });

  it('should pass creating a project using branchname given by input', async () => {
    ticsCliMock.branchname = 'branch';
    putSpy.mockResolvedValue('');

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: '',
        branchName: 'branch',
        branchDir: '',
        calculate: true,
        visible: true,
        renameTo: { branchName: 'branch' }
      })
    );
    ticsCliMock.branchname = '';
  });

  it('should pass creating a project using branchname given by environment GITHUB_BASE_REF', async () => {
    const GITHUB_BASE_REF = process.env.GITHUB_BASE_REF;
    process.env.GITHUB_BASE_REF = 'branch';
    putSpy.mockResolvedValue('');

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: '',
        branchName: 'branch',
        branchDir: '',
        calculate: true,
        visible: true,
        renameTo: { branchName: 'branch' }
      })
    );
    process.env.GITHUB_BASE_REF = GITHUB_BASE_REF;
  });

  it('should pass creating a project using branchname given by environment GITHUB_REF_NAME', async () => {
    const GITHUB_BASE_REF = process.env.GITHUB_BASE_REF;
    process.env.GITHUB_BASE_REF = '';
    const GITHUB_REF_NAME = process.env.GITHUB_REF_NAME;
    process.env.GITHUB_REF_NAME = 'branch';
    putSpy.mockResolvedValue('');

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: '',
        branchName: 'branch',
        branchDir: '',
        calculate: true,
        visible: true,
        renameTo: { branchName: 'branch' }
      })
    );
    process.env.GITHUB_BASE_REF = GITHUB_BASE_REF;
    process.env.GITHUB_BASE_REF = GITHUB_REF_NAME;
  });

  it('should throw error when viewer returns error', async () => {
    putSpy.mockRejectedValue(Error());

    let error: any;
    try {
      await createProject();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(Error);
  });
});
