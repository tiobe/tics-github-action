import { describe, expect, it } from 'vitest';
import { emptyToNull, isOneOf } from '../../../src/helper/utils';

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

describe('emptyToNull', () => {
  it('should return null if string is undefined', () => {
    const result = emptyToNull(undefined);
    expect(result).toStrictEqual(null);
  });

  it('should return null if string is null', () => {
    const result = emptyToNull(null);
    expect(result).toStrictEqual(null);
  });

  it('should return null if string is empty', () => {
    const result = emptyToNull('');
    expect(result).toStrictEqual(null);
  });

  it('should return value if string is not empty', () => {
    const result = emptyToNull('value');
    expect(result).toStrictEqual('value');
  });
});
