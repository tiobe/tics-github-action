import { getItemFromUrl, getProjectName } from '../../../src/tics/url';
import { ticsCliMock } from '../../.setup/mock';

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
    ticsCliMock.project = 'auto';

    const projectName = getProjectName('https://test.com/Project%28project%29');
    expect(projectName).toEqual('project');
  });

  test('Should return default project name from url if projectName is given', async () => {
    ticsCliMock.project = 'project';

    const projectName = getProjectName('https://test.com/Project%28auto%29');
    expect(projectName).toEqual(ticsCliMock.project);
  });
});
