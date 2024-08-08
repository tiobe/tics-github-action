import { getInput, getBooleanInput } from '@actions/core';

import { isOneOf } from '../helper/utils';
import { logger } from '../helper/logger';
import { getBaseUrl } from '@tiobe/install-tics';
import { setVariable, unsetVariable } from '../helper/environment';

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
  readonly trustStrategy: TrustStrategy;

  /**
   * The URL pointing to the "cfg" API endpoint of the TICS Viewer. Is used for running TICS.
   */
  readonly viewerUrl: string;
  /**
   * Derived of the viewerUrl. Is used for performing API calls.
   */
  readonly baseUrl: string;
  /**
   * The publicly available Viewer URL of TICS viewer to link the links in the review to.
   * If not set, this will be set to the baseUrl.
   */
  readonly displayUrl: string;

  constructor() {
    this.viewerUrl = this.validateAndGetViewerUrl(getInput('viewerUrl', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.githubToken = getInput('githubToken');
    this.installTics = getBooleanInput('installTics');
    this.hostnameVerification = this.validateAndGetHostnameVerification(getInput('hostnameVerification'));
    this.trustStrategy = this.validateAndGetTrustStrategy(getInput('trustStrategy'));
    this.filelist = getInput('filelist');
    this.ticsAuthToken = getInput('ticsAuthToken');
    this.baseUrl = getBaseUrl(this.viewerUrl).href;
    this.displayUrl = this.validateAndGetDisplayUrl(getInput('displayUrl'));

    this.setVariables();
  }

  /**
   * Validates if the given input is a valid TICS url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetViewerUrl(url: string): string {
    const uri = this.validateAndGetUrl(url, 'viewerUrl');

    if (uri.protocol !== 'http:' && uri.protocol !== 'https:') {
      throw Error(`Parameter 'viewerUrl' is missing the protocol (http(s)://)`);
    } else if (!uri.pathname.endsWith('/api/cfg')) {
      throw Error(`Parameter 'viewerUrl' is missing path /api/cfg`);
    } else if (!uri.searchParams.has('name') || uri.searchParams.get('name') === '') {
      throw Error(`Parameter 'viewerUrl' is missing the configuration. (eg: /cfg?name=default)`);
    }

    return uri.href;
  }

  /**
   * Validates if the given input is a valid url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetDisplayUrl(url: string): string {
    if (url) {
      return this.validateAndGetUrl(url, 'displayUrl').href;
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
    // variable set to replace the loading bar with synchronising... in the install script
    setVariable('TICSCI', '1');

    if (this.mode === Mode.CLIENT || this.mode === Mode.DIAGNOSTIC) {
      setVariable('TICSIDE', 'GITHUB');
    } else if (process.env.TICSIDE) {
      unsetVariable('TICSIDE');
    }

    // set ticsAuthToken
    if (this.ticsAuthToken) {
      setVariable('TICSAUTHTOKEN', this.ticsAuthToken);
    }

    // set hostnameVerification
    setVariable('TICSHOSTNAMEVERIFICATION', this.hostnameVerification.toString());

    if (!this.hostnameVerification) {
      setVariable('NODE_TLS_REJECT_UNAUTHORIZED', '0');
      logger.debug('Hostname Verification disabled');
    }

    // set trustStrategy
    setVariable('TICSTRUSTSTRATEGY', this.trustStrategy);

    if (isOneOf(this.trustStrategy, TrustStrategy.SELFSIGNED, TrustStrategy.ALL)) {
      setVariable('NODE_TLS_REJECT_UNAUTHORIZED', '0');
      logger.debug(`Trust strategy set to ${this.trustStrategy}`);
    }
  }
}
