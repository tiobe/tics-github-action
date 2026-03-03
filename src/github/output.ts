import { setOutput } from '@actions/core';
import { ProjectResult } from '../helper/interfaces.js';
import { logger } from '../helper/logger.js';
import { ActionOutput } from './interfaces.js';

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
