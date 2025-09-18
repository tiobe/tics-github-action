import { setOutput } from '@actions/core';
import { ProjectResult } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { ActionOutput } from './interfaces';

export function createAndSetOutput(projectResults: ProjectResult[]): void {
  logger.header('Setting output variable "annotations"');
  const output: ActionOutput = {
    conditions: [],
    annotations: []
  };

  projectResults.forEach(p => {
    p.qualityGate.gates.forEach(g => {
      g.conditions.forEach(c => {
        if (!output.conditions.includes(c.message)) {
          output.conditions.push(c.message);
        }
      });
    });

    output.annotations.push(...p.annotations);
  });

  setOutput('annotations', output);
}
