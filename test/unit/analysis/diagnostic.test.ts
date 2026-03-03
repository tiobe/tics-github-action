import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import * as analyzer from '../../../src/tics/analyzer';
import * as diagnostic from '../../../src/github/diagnostic';

import { Mode } from '../../../src/configuration/tics';
import { ticsConfigMock } from '../../.setup/mock';
import { analysisFailed, analysisPassed } from './objects/diagnostic';
import { diagnosticAnalysis } from '../../../src/analysis/diagnostic';

describe('diagnostic mode checks', () => {
  let spyAnalyzer: Mock<typeof analyzer.runTicsAnalyzer>;

  beforeEach(() => {
    spyAnalyzer = vi.spyOn(analyzer, 'runTicsAnalyzer');
    vi.spyOn(diagnostic, 'getRateLimit').mockResolvedValue({
      rate: {
        limit: 5000,
        used: 1,
        remaining: 4999,
        reset: 1372700873
      }
    });

    ticsConfigMock.mode = Mode.DIAGNOSTIC;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('diagnostic mode succeeds', async () => {
    spyAnalyzer.mockResolvedValueOnce(analysisPassed);

    const verdict = await diagnosticAnalysis();

    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
    expect(verdict).toMatchObject({
      passed: true,
      message: '',
      errorList: analysisPassed.errorList,
      warningList: analysisPassed.warningList
    });
  });

  it('diagnostic mode fails', async () => {
    spyAnalyzer.mockResolvedValueOnce(analysisFailed);

    const verdict = await diagnosticAnalysis();

    expect(spyAnalyzer).toHaveBeenCalledTimes(1);
    expect(verdict).toMatchObject({
      passed: false,
      message: 'Diagnostic run has failed.',
      errorList: analysisFailed.errorList,
      warningList: analysisFailed.warningList
    });
  });
});
