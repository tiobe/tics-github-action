import { describe, expect, it } from '@jest/globals';
import { joinUrl } from '../../../src/helper/url';

describe('isOneOf', () => {
  it('should return url with trailing slash', () => {
    const url = joinUrl('http://localhost/', 'mayo', '/curry', 'ketchup');

    expect(url).toBe('http://localhost/mayo/curry/ketchup');
  });

  it('should return url without trailing slash', () => {
    const url = joinUrl('http://localhost', 'mayo/', 'curry', '/ketchup');

    expect(url).toBe('http://localhost/mayo/curry/ketchup');
  });
});
