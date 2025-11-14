import { EOL } from 'os';
import { getBooleanInput, getInput } from '@actions/core';

import { RetryConfig } from './interfaces';
import { logger } from '../helper/logger';
import { ExtendedAnnotation } from '../viewer/interfaces';

export class ShowAnnotationSeverity {
  static readonly BLOCKING = new ShowAnnotationSeverity('blocking', ['blocking'], ['yes']);
  static readonly AFTER = new ShowAnnotationSeverity('blocking-after', ['blocking', 'after'], ['yes', 'after']);
  static readonly ISSUE = new ShowAnnotationSeverity('issue', ['blocking', 'after', 'issue'], ['yes', 'after', 'no']);

  private constructor(
    readonly param: string,
    readonly severities: string[],
    readonly blockingStates: string[]
  ) {}

  static parse(input: string): ShowAnnotationSeverity {
    const severity = input.toLowerCase();
    switch (severity) {
      case this.BLOCKING.param:
        return this.BLOCKING;
      case this.AFTER.param:
        return this.AFTER;
      case this.ISSUE.param:
        return this.ISSUE;
    }
    throw Error(`Parameter 'showAnnotationSeverity' should be one of 'blocking', 'blocking-after' or 'issue'. Input given is '${input}'`);
  }

  getAnnotationSeverityFilter(): string {
    if (this.severities.length > 1) {
      return `AnnotationSeverity(Set(${this.severities.join(',')}))`;
    } else {
      return `AnnotationSeverity(${this.severities[0]})`;
    }
  }

  shouldPostAnnotation(annotation: ExtendedAnnotation): boolean {
    return annotation.postable && (annotation.blocking?.state === undefined || this.blockingStates.includes(annotation.blocking.state));
  }
}

export class ActionConfiguration {
  readonly excludeMovedFiles: boolean;
  readonly postAnnotations: boolean;
  readonly postToConversation: boolean;
  readonly pullRequestApproval: boolean;
  readonly retryConfig: RetryConfig;
  readonly secretsFilter: string[];
  readonly showAnnotationSeverity: ShowAnnotationSeverity;

  constructor() {
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles');
    this.postAnnotations = getBooleanInput('postAnnotations');
    this.postToConversation = getBooleanInput('postToConversation');
    this.pullRequestApproval = getBooleanInput('pullRequestApproval');
    this.retryConfig = this.validateAndGetRetryConfig(getInput('retryCodes'));
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showAnnotationSeverity = this.getAnnotationSeverity(getInput('showAnnotationSeverity'), getBooleanInput('showBlockingAfter'));
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

  private getAnnotationSeverity(input: string, blockingAfter: boolean): ShowAnnotationSeverity {
    // `showAnnotationSeverity` takes precedent over `blockingAfter`, which is deprecated.
    if (input !== '') {
      return ShowAnnotationSeverity.parse(input);
    } else {
      // if `showAnnotationSeverity` is not set use the value of `blockingAfter` to set a level.
      if (!blockingAfter) {
        return ShowAnnotationSeverity.BLOCKING;
      }
      return ShowAnnotationSeverity.AFTER;
    }
  }
}
