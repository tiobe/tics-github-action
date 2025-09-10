import { setOutput } from '@actions/core';
import { ExtendedAnnotation, ProjectResult } from '../helper/interfaces';
import { logger } from '../helper/logger';

export function createAndSetOutput(projectResults: ProjectResult[]) {
  logger.header('Setting output variable "annotations"');
  const output: {
    conditions: string[];
    annotations: ExtendedAnnotation[];
  } = {
    conditions: [],
    annotations: []
  };

  projectResults.forEach(p => {
    p.qualityGate?.gates.forEach(g => {
      g.conditions.forEach(c => {
        output.conditions.push(c.message);
      });
    });

    if (p.reviewComments) {
      output.annotations.push(...p.reviewComments.postable);
      output.annotations.push(...p.reviewComments.unpostable);
    }
  });

  setOutput('annotations', output);
}
