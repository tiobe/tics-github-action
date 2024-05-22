import { logger } from '../../../../src/helper/logger';
import { postCliSummary } from '../../../../src/action/cli/summary';
import { Verdict } from '../../../../src/helper/interfaces';
import { githubConfigMock } from '../../../.setup/mock';

describe('cliSummary', () => {
  test('Should post errors and warnings on logLevel debug, cliSummary.', async () => {
    const error = jest.spyOn(logger, 'error');
    const warning = jest.spyOn(logger, 'warning');

    githubConfigMock.debugger = true;

    const verdict: Verdict = {
      passed: false,
      message: '',
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning']
    };
    postCliSummary(verdict);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(2);
  });

  test('Should post errors and no warnings on logLevel default, cliSummary.', async () => {
    const error = jest.spyOn(logger, 'error');
    const warning = jest.spyOn(logger, 'warning');

    githubConfigMock.debugger = false;

    const verdict: Verdict = {
      passed: false,
      message: '',
      errorList: ['error', 'error', 'warning'],
      warningList: ['warning', 'warning']
    };
    postCliSummary(verdict);

    expect(error).toHaveBeenCalledTimes(3);
    expect(warning).toHaveBeenCalledTimes(0);
  });
});
