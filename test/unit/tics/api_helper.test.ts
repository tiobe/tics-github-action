import { githubConfig, ticsConfig } from '../../../src/configuration';
import { Analysis } from '../../../src/helper/interfaces';
import { logger } from '../../../src/helper/logger';
import { cliSummary, getItemFromUrl, getProjectName } from '../../../src/tics/api_helper';

describe('cliSummary', () => {
  test('Should post errors and warnings on logLevel debug, cliSummary.', async () => {
    const error = jest.spyOn(logger, 'error');
    const warning = jest.spyOn(logger, 'warning');

    githubConfig.debugger = true;

    const analysis: Analysis = {
      completed: false,
      statusCode: -1,
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning'],
      explorerUrls: []
    };
    cliSummary(analysis);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(2);
  });

  test('Should post errors and no warnings on logLevel default, cliSummary.', async () => {
    const error = jest.spyOn(logger, 'error');
    const warning = jest.spyOn(logger, 'warning');

    githubConfig.debugger = false;

    const analysis: Analysis = {
      completed: false,
      statusCode: -1,
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning'],
      explorerUrls: []
    };
    cliSummary(analysis);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(0);
  });
});

describe('getItemFromUrl', () => {
  test('Should return item with with spaces if + is in the url.', async () => {
    const projectName = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Item');
    expect(projectName).toEqual('hello world');
  });

  test('Should not return item if not found in url.', async () => {
    const projectName = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Project');
    expect(projectName).toEqual('');
  });
});

describe('getProjectName', () => {
  test('Should return project name from url if project auto', async () => {
    ticsConfig.project = 'auto';

    const projectName = getProjectName('https://test.com/Project%28project%29');
    expect(projectName).toEqual('project');
  });

  test('Should return default project name from url if projectName is given', async () => {
    ticsConfig.project = 'project';

    const projectName = getProjectName('https://test.com/Project%28auto%29');
    expect(projectName).toEqual(ticsConfig.project);
  });
});
