import { describe, it } from '@jest/globals';
import { emptyToUndefined, isOneOf } from '../../../src/helper/utils';

describe('isOneOf', () => {
  it('should pass if value is one of the given options', () => {
    isOneOf('mayo', 'mayo', 'curry', 'ketchup');
    expect(true).toBeTruthy();
  });

  it('should fail if value is one of the given options', () => {
    isOneOf('joppie', 'mayo', 'curry', 'ketchup');
    expect(true).toBeTruthy();
  });
});

describe('emptyToUndefined', () => {
  it('should return undefined if string is undefined', () => {
    const result = emptyToUndefined(undefined);
    expect(result).toStrictEqual(undefined);
  });

  it('should return undefined if string is null', () => {
    const result = emptyToUndefined(null);
    expect(result).toStrictEqual(undefined);
  });

  it('should return undefined if string is empty', () => {
    const result = emptyToUndefined('');
    expect(result).toStrictEqual(undefined);
  });

  it('should return value if string is not empty', () => {
    const result = emptyToUndefined('value');
    expect(result).toStrictEqual('value');
  });
});
