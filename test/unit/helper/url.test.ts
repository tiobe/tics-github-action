import { joinUrl } from '../../../src/helper/url';

describe('isOneOf', () => {
  test('Should return url with trailing slash', () => {
    const url = joinUrl('http://localhost/', 'mayo', '/curry', 'ketchup');

    expect(url).toEqual('http://localhost/mayo/curry/ketchup');
  });

  test('Should return url without trailing slash', () => {
    const url = joinUrl('http://localhost', 'mayo/', 'curry', '/ketchup');

    expect(url).toEqual('http://localhost/mayo/curry/ketchup');
  });
});
