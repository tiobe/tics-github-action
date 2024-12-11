import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as analyzer from '../../../src/tics/analyzer';

import { Mode } from '../../../src/configuration/tics';
import { ticsConfigMock } from '../../.setup/mock';
import { analysisFailed, analysisPassed } from './objects/diagnostic';
import { diagnosticAnalysis } from '../../../src/analysis/diagnostic';

describe('diagnostic mode checks', () => {
  let spyAnalyzer: jest.SpiedFunction<typeof analyzer.runTicsAnalyzer>;

  beforeEach(() => {
    spyAnalyzer = jest.spyOn(analyzer, 'runTicsAnalyzer');

    ticsConfigMock.mode = Mode.DIAGNOSTIC;
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
