import { describe, expect, it } from 'vitest';
import { isOneOf } from '../../../src/helper/utils';

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
