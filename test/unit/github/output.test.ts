import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { createAndSetOutput } from '../../../src/github/output';
import { ActionOutput } from '../../../src/github/interfaces';
import { ProjectResult } from '../../../src/helper/interfaces';
import { annotationsMock, failedQualityGate, passedQualityGate, allAnnotations } from './objects/output';

describe('createAndSetOutput', () => {
  let setOutputSpy: jest.SpiedFunction<typeof core.setOutput>;
  let expectedOutput: ActionOutput;
  let projectResult: ProjectResult;

  beforeEach(() => {
    setOutputSpy = jest.spyOn(core, 'setOutput');
    expectedOutput = {
      conditions: [],
      annotations: []
    };
    projectResult = {
      project: 'project',
      explorerUrl: 'http://random/url',
      qualityGate: {
        passed: false,
        message: '',
        url: '',
        gates: [],
        annotationsApiV1Links: []
      },
      analyzedFiles: [],
      annotations: []
    };
  });

  it('output should be empty when no projectResults', async () => {
    createAndSetOutput([]);

    expect(setOutputSpy).toHaveBeenCalledWith('annotations', expectedOutput);
  });

  it('output should be empty when projectResults has no qualityGates', async () => {
    createAndSetOutput([projectResult]);

    expect(setOutputSpy).toHaveBeenCalledWith('annotations', expectedOutput);
  });

  it('output should have conditions when projectResults has qualityGate with no annotations', async () => {
    createAndSetOutput([{ ...projectResult, qualityGate: passedQualityGate }]);

    expectedOutput.conditions.push(
      'No new Coding Standard Violations for levels 1, 2, 3 with respect to previous analysis',
      'No new Security Violations for levels 1, 2, 3 with respect to previous analysis'
    );

    expect(setOutputSpy).toHaveBeenCalledWith('annotations', expectedOutput);
  });

  it('output should have conditions when projectResults has two qualityGates with no annotations', async () => {
    createAndSetOutput([
      { ...projectResult, qualityGate: passedQualityGate },
      { ...projectResult, qualityGate: failedQualityGate }
    ]);

    expectedOutput.conditions.push(
      'No new Coding Standard Violations for levels 1, 2, 3 with respect to previous analysis',
      'No new Security Violations for levels 1, 2, 3 with respect to previous analysis'
    );

    expect(setOutputSpy).toHaveBeenCalledWith('annotations', expectedOutput);
  });

  it('output should have conditions and annotations when projectResults has qualityGate with annotations', async () => {
    createAndSetOutput([
      { ...projectResult, qualityGate: passedQualityGate },
      { ...projectResult, qualityGate: failedQualityGate, annotations: allAnnotations }
    ]);

    expectedOutput.conditions.push(
      'No new Coding Standard Violations for levels 1, 2, 3 with respect to previous analysis',
      'No new Security Violations for levels 1, 2, 3 with respect to previous analysis'
    );
    expectedOutput.annotations.push(...annotationsMock, ...annotationsMock);

    expect(setOutputSpy).toHaveBeenCalledWith('annotations', expectedOutput);
  });
});
