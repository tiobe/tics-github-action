import { getItemFromUrl, getProjectFromUrl } from '../../../src/tics/url';
import { ticsCliMock } from '../../.setup/mock';

describe('getItemFromUrl', () => {
  test('Should return item with with spaces if + is in the url.', async () => {
    const project = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Item');
    expect(project).toEqual('hello world');
  });

  test('Should not return item if not found in url.', async () => {
    const project = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Project');
    expect(project).toEqual('');
  });
});

describe('getProjectName', () => {
  test('Should return project name from url if project auto', async () => {
    ticsCliMock.project = 'auto';

    const project = getProjectFromUrl('https://test.com/Project%28project%29');
    expect(project).toEqual('project');
  });

  test('Should return default project name from url if project is given', async () => {
    ticsCliMock.project = 'project';

    const project = getProjectFromUrl('https://test.com/Project%28auto%29');
    expect(project).toEqual(ticsCliMock.project);
  });
});
