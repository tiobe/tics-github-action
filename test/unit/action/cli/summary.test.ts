import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../../src/helper/logger';
import { postCliSummary } from '../../../../src/action/cli/summary';
import { Verdict } from '../../../../src/helper/interfaces';
import { githubConfigMock } from '../../../.setup/mock';

describe('cliSummary', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should post errors and warnings on logLevel debug, cliSummary.', async () => {
    const error = vi.spyOn(logger, 'error');
    const warning = vi.spyOn(logger, 'warning');

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

  it('should post errors and no warnings on logLevel default, cliSummary.', async () => {
    const error = vi.spyOn(logger, 'error');
    const warning = vi.spyOn(logger, 'warning');

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
