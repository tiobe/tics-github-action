import { EOL } from 'os';
import { getBooleanInput, getInput } from '@actions/core';
import { getBaseUrl } from '@tiobe/install-tics';

import { RetryConfig } from './interfaces';

export class ActionConfiguration {
  readonly excludeMovedFiles: boolean;
  readonly postAnnotations: boolean;
  readonly postToConversation: boolean;
  readonly pullRequestApproval: boolean;
  readonly retryConfig: RetryConfig;
  readonly secretsFilter: string[];
  readonly showBlockingAfter: boolean;
  readonly baseUrl: string;
  readonly viewerUrl: string;

  constructor(ticsConfiguration: string) {
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles') ?? false;
    this.postAnnotations = getBooleanInput('postAnnotations') ?? false;
    this.postToConversation = getBooleanInput('postToConversation') ?? false;
    this.pullRequestApproval = getBooleanInput('pullRequestApproval') ?? false;
    this.retryConfig = this.validateAndGetRetryConfig(getInput('retryCodes'));
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showBlockingAfter = getBooleanInput('showBlockingAfter') ?? false;

    this.baseUrl = getBaseUrl(ticsConfiguration).href;
    this.viewerUrl = this.validateAndGetUrl(getInput('viewerUrl'));
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
  getSecretsFilter(secretsFilter: string): string[] {
    const defaults = ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'];
    const keys = secretsFilter.split(',').filter(s => s !== '');

    const combinedFilters = defaults.concat(keys);

    process.stdout.write(`::debug::SecretsFilter: ${JSON.stringify(combinedFilters) + EOL}`);

    return combinedFilters;
  }

  /**
   * Validates if the given input is a valid url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetUrl(url: string): string {
    if (url) {
      try {
        return new URL(url).href;
      } catch {
        throw Error(`Parameter 'ticsConfiguration' is not a valid url`);
      }
    } else {
      return this.baseUrl;
    }
  }
}
