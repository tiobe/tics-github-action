import { isOneOf } from '../../../src/helper/utils';

describe('isOneOf', () => {
  test('Should pass if value is one of the given options', () => {
    isOneOf('mayo', 'mayo', 'curry', 'ketchup');
  });

  test('Should fail if value is one of the given options', () => {
    isOneOf('joppie', 'mayo', 'curry', 'ketchup');
  });
});
