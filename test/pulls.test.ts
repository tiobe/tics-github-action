import { expect, test, jest } from '@jest/globals';
import { getChangedFiles } from '../src/github/calling/pulls';

test('Should return retrieved files', async () => {
  console.log(await getChangedFiles());
});
