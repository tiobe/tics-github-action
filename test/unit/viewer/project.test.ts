import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { createProject } from '../../../src/viewer/project';
import { ticsCliMock, ticsConfigMock } from '../../.setup/mock';
import { SpiedFunction } from 'jest-mock';
import { logger } from '../../../src/helper/logger';

describe('createProject', () => {
  let putSpy: SpiedFunction<any>;
  let infoSpy: SpiedFunction<typeof logger.info>;

  beforeAll(() => {
    ticsConfigMock.baseUrl = 'http://base.url';
  });

  beforeEach(() => {
    putSpy = jest.spyOn(httpClient, 'put');
    infoSpy = jest.spyOn(logger, 'info');
    jest.clearAllMocks();
  });

  it('should pass creating a project and log message if returned', async () => {
    ticsCliMock.project = 'create-project';
    ticsCliMock.branchdir = '.';
    putSpy.mockResolvedValue({
      data: {
        alertMessages: [
          {
            header: `Created database created (took 4s, dbversion: 143), Added project 'PROJECTS => created' to configuration"`
          }
        ]
      }
    });

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: 'create-project',
        branchDir: '.',
        calculate: true,
        visible: true
      })
    );
    expect(infoSpy).toHaveBeenCalledWith(`Created database created (took 4s, dbversion: 143), Added project 'PROJECTS => created' to configuration"`);
  });

  it('should pass creating a project and not log message if not returned', async () => {
    ticsCliMock.project = 'create-project';
    ticsCliMock.branchdir = '.';
    putSpy.mockResolvedValue({ data: { alertMessages: [] } });

    await createProject();

    expect(putSpy).toHaveBeenCalledWith(
      'http://base.url/api/public/v1/fapi/Project',
      JSON.stringify({
        projectName: 'create-project',
        branchDir: '.',
        calculate: true,
        visible: true
      })
    );
    expect(infoSpy).toHaveBeenCalledTimes(0);
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
