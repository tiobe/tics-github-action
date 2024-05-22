import { getInput, getBooleanInput, exportVariable } from '@actions/core';

import { isOneOf } from '../helper/compare';
import { logger } from '../helper/logger';
import { getBaseUrl } from '@tiobe/install-tics';

export enum Mode {
  CLIENT = 'client',
  QSERVER = 'qserver',
  DIAGNOSTIC = 'diagnostic'
}

export enum TrustStrategy {
  NONE = '',
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
  readonly baseUrl: string;
  readonly viewerUrl: string;

  constructor() {
    this.ticsConfiguration = this.validateAndGetConfigUrl(getInput('ticsConfiguration', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.githubToken = getInput('githubToken');
    this.installTics = getBooleanInput('installTics');
    this.hostnameVerification = this.validateAndGetHostnameVerification(getInput('hostnameVerification'));
    this.trustStrategy = this.validateAndGetTrustStrategy(getInput('trustStrategy'));
    this.filelist = getInput('filelist');
    this.ticsAuthToken = getInput('ticsAuthToken');
    this.baseUrl = getBaseUrl(this.ticsConfiguration).href;
    this.viewerUrl = this.validateAndGetViewerUrl(getInput('viewerUrl'));

    this.setVariables();
  }

  /**
   * Validates if the given input is a valid TICS url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetConfigUrl(url: string): string {
    const uri = this.validateAndGetUrl(url, 'ticsConfiguration');

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
  private validateAndGetViewerUrl(url: string): string {
    if (url) {
      return this.validateAndGetUrl(url, 'viewerUrl').href;
    } else {
      return this.baseUrl;
    }
  }

  /**
   * Validates if the given input is a valid url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetUrl(url: string, param: string): URL {
    try {
      return new URL(url);
    } catch {
      throw Error(`Parameter '${param}' with value '${url}' is not a valid url`);
    }
  }

  /**
   * Validates if the given input is a valid mode and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetMode(input: string): Mode {
    const mode = input.toLowerCase() as Mode;

    if (Object.values(Mode).includes(mode)) {
      return mode;
    } else {
      throw Error(`Parameter 'mode' should be one of 'client', 'qserver' or 'diagnostic'. Input given is '${input}'`);
    }
  }

  /**
   * Validates if the given input is a valid trust strategy and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetTrustStrategy(input: string): TrustStrategy {
    const trustStrategy = input.toLowerCase() as TrustStrategy;

    if (trustStrategy === TrustStrategy.NONE) {
      return TrustStrategy.STRICT;
    } else if (Object.values(TrustStrategy).includes(trustStrategy)) {
      return trustStrategy;
    } else {
      throw Error(`Parameter 'trustStrategy' should be one of 'strict', 'self-signed' or 'all'. Input given is '${input}'`);
    }
  }

  /**
   * Validates if the given input is valid hostname verification and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetHostnameVerification(input: string): boolean {
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
  private setVariables() {
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
