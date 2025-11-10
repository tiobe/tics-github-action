import { EOL } from 'os';
import { getBooleanInput, getInput } from '@actions/core';

import { RetryConfig } from './interfaces';
import { logger } from '../helper/logger';

export class ActionConfiguration {
  readonly excludeMovedFiles: boolean;
  readonly postAnnotations: boolean;
  readonly postToConversation: boolean;
  readonly pullRequestApproval: boolean;
  readonly retryConfig: RetryConfig;
  readonly secretsFilter: string[];
  readonly showBlockingAfter: boolean;
  readonly showNonBlocking: boolean;

  constructor() {
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles');
    this.postAnnotations = getBooleanInput('postAnnotations');
    this.postToConversation = getBooleanInput('postToConversation');
    this.pullRequestApproval = getBooleanInput('pullRequestApproval');
    this.retryConfig = this.validateAndGetRetryConfig(getInput('retryCodes'));
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showBlockingAfter = getBooleanInput('showBlockingAfter');
    this.showNonBlocking = getBooleanInput('showNonBlocking');
  }

  /**
   * Validates if the given input are valid retry codes and returns them.
   * @returns the processed input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetRetryConfig(retryCodes?: string): RetryConfig {
    let codes: number[];

    if (!retryCodes) {
      codes = [419, 500, 501, 502, 503, 504];
    } else {
      codes = retryCodes.split(',').map(r => {
        const code = Number(r);
        if (Number.isNaN(code)) {
          throw Error(`Parameter 'retryCodes' contains value '${r}' which is not a number`);
        } else {
          return code;
        }
      });
    }

    return {
      delay: 5,
      maxRetries: 10,
      codes: codes
    };
  }

  /**
   * Set the secrets that should be redacted from the GitHub output (used in logger).
   * @param secretsFilter optional additional secrets that need filtering.
   * @returns Default filters plus optional set by the user.
   */
  private getSecretsFilter(secretsFilter: string): string[] {
    const defaults = ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'];
    const keys = secretsFilter
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    const combinedFilters = defaults.concat(keys);

    logger.debug(`SecretsFilter: ${JSON.stringify(combinedFilters) + EOL}`);
    logger.setSecretsFilter(combinedFilters);

    return combinedFilters;
  }
}
