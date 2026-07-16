import { describe, expect, it } from 'vitest';
import { getItemFromUrl, getProjectFromUrl } from '../../../src/tics/url';
import { ticsCliMock } from '../../.setup/mock';

describe('getItemFromUrl', () => {
  it('should return item with with spaces if + is in the url.', () => {
    const project = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Item');

    expect(project).toBe('hello world');
  });

  it('should not return item if not found in url.', () => {
    const project = getItemFromUrl('https://test.com/Item%28hello+world%29', 'Project');

    expect(project).toBe('');
  });
});

describe('getProjectFromUrl', () => {
  it('should return project name from url if project auto', () => {
    ticsCliMock.project = 'auto';

    const project = getProjectFromUrl('https://test.com/Project%28project%29');

    expect(project).toBe('project');
  });

  it('should return default project name from url if project is given', () => {
    ticsCliMock.project = 'project';

    const project = getProjectFromUrl('https://test.com/Project%28auto%29');

    expect(project).toEqual(ticsCliMock.project);
  });
});
