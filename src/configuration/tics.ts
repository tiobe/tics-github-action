import { getInput, getBooleanInput, exportVariable } from '@actions/core';

import { isOneOf } from '../helper/compare';
import { logger } from '../helper/logger';

export enum Mode {
  CLIENT = 'client',
  QSERVER = 'qserver',
  DIAGNOSTIC = 'diagnostic'
}

export enum TrustStrategy {
  STRICT = 'strict',
  SELFSIGNED = 'self-signed',
  ALL = 'all'
}

export class TicsConfiguration {
  readonly filelist: string;
  readonly githubToken: string;
  readonly hostnameVerification: boolean;
  readonly installTics: boolean;
  readonly mode: Mode;
  readonly ticsAuthToken: string;
  readonly ticsConfiguration: string;
  readonly trustStrategy: TrustStrategy;

  constructor() {
    this.ticsConfiguration = this.validateAndGetConfigUrl(getInput('ticsConfiguration', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.githubToken = getInput('githubToken');
    this.installTics = getBooleanInput('installTics') ?? false;
    this.hostnameVerification = this.validateAndGetHostnameVerification(getInput('hostnameVerification'));
    this.trustStrategy = this.validateAndGetTrustStrategy(getInput('trustStrategy'));
    this.filelist = getInput('filelist');
    this.ticsAuthToken = getInput('ticsAuthToken');

    this.setVariables();
  }

  /**
   * Validates if the given input is a valid TICS url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetConfigUrl(url: string): string {
    const uri = this.validateAndGetUrl(url);

    if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
      throw Error(`Parameter 'ticsConfiguration' is missing the protocol (http(s)://)`);
    } else if (!uri.pathname.endsWith('/api/cfg')) {
      throw Error(`Parameter 'ticsConfiguration' is missing path /api/cfg`);
    } else if (!uri.searchParams.has('name') || uri.searchParams.get('name') === '') {
      throw Error(`Parameter 'ticsConfiguration' is missing the configuration. (eg: /cfg?name=default)`);
    }

    return uri.href;
  }

  /**
   * Validates if the given input is a valid url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetUrl(url: string): URL {
    try {
      return new URL(url);
    } catch {
      throw Error(`Parameter 'ticsConfiguration' is not a valid url`);
    }
  }

  /**
   * Validates if the given input is a valid mode and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetMode(input: string): Mode {
    switch (input.toLowerCase()) {
      case Mode.CLIENT:
        return Mode.CLIENT;
      case Mode.QSERVER:
        return Mode.QSERVER;
      case Mode.DIAGNOSTIC:
        return Mode.DIAGNOSTIC;
      default:
        throw Error(`Parameter 'mode' should be one of 'client', 'qserver' or 'diagnostic'. Input given is '${input}'`);
    }
  }

  /**
   * Validates if the given input is a valid trust strategy and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetTrustStrategy(input: string): TrustStrategy {
    switch (input.toLowerCase()) {
      case TrustStrategy.STRICT:
        return TrustStrategy.STRICT;
      case TrustStrategy.SELFSIGNED:
        return TrustStrategy.SELFSIGNED;
      case TrustStrategy.ALL:
        return TrustStrategy.ALL;
      default:
        throw Error(`Parameter 'trustStrategy' should be one of 'strict', 'self-signed' or 'all'. Input given is '${input}'`);
    }
  }

  /**
   * Validates if the given input is valid hostname verification and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetHostnameVerification(input: string): boolean {
    if (input === '') {
      return true;
    }
    if (isOneOf(input.toLowerCase(), '1', 'true')) {
      return true;
    }
    if (isOneOf(input.toLowerCase(), '0', 'false')) {
      return false;
    }
    throw Error(`Parameter 'hostnameVerification' should be '1'/'true' or '0'/'false'. Input given is '${input}'`);
  }

  /**
   * Set all environment variables TICS needs to run in the GitHub setting.
   */
  setVariables() {
    if (this.mode !== Mode.QSERVER) {
      exportVariable('TICSIDE', 'GITHUB');
    }

    // set ticsAuthToken
    if (this.ticsAuthToken) {
      exportVariable('TICSAUTHTOKEN', this.ticsAuthToken);
    }

    // set hostnameVerification
    exportVariable('TICSHOSTNAMEVERIFICATION', this.hostnameVerification);

    if (!this.hostnameVerification) {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      logger.debug('Hostname Verification disabled');
    }

    // set trustStrategy
    exportVariable('TICSTRUSTSTRATEGY', this.trustStrategy);

    if (isOneOf(this.trustStrategy, TrustStrategy.SELFSIGNED, TrustStrategy.ALL)) {
      exportVariable('NODE_TLS_REJECT_UNAUTHORIZED', 0);
      logger.debug(`Trust strategy set to ${this.trustStrategy}`);
    }
  }
}
