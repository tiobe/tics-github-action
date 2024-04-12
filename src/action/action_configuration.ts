import { getBooleanInput, getInput } from '@actions/core';
import { Mode, TrustStrategy } from '../helper/enums';
import { EOL } from 'os';
import { logger } from '../helper/logger';
import { isOneOf } from '../helper/compare';
import { CliOptions } from './cli_options';

export class ActionConfiguration {
  excludeMovedFiles: boolean;
  filelist: string;
  githubToken: string;
  hostnameVerification: boolean;
  installTics: boolean;
  mode: Mode;
  postAnnotations: boolean;
  postToConversation: boolean;
  pullRequestApproval: boolean;
  retryCodes: number[];
  ticsAuthToken: string;
  ticsConfiguration: string;
  trustStrategy: TrustStrategy;
  secretsFilter: string[];
  showBlockingAfter: boolean;
  viewerUrl: string | undefined;

  // cli options
  project: string;
  branchname: string;
  branchdir: string;
  cdtoken: string;
  codetype: string;
  calc: string;
  nocalc: string;
  norecalc: string;
  recalc: string;
  tmpdir: string;
  additionalFlags: string;

  constructor() {
    // TICS usage options
    this.ticsConfiguration = this.validateAndGetConfigUrl(getInput('ticsConfiguration', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.githubToken = getInput('githubToken');
    this.installTics = getBooleanInput('installTics') ?? false;
    this.hostnameVerification = this.validateAndGetHostnameVerification(getInput('hostnameVerification'));
    this.trustStrategy = this.validateAndGetTrustStrategy(getInput('trustStrategy'));
    this.filelist = getInput('filelist');
    this.ticsAuthToken = getInput('ticsAuthToken');

    // action options
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles') ?? false;
    this.postAnnotations = getBooleanInput('postAnnotations') ?? false;
    this.postToConversation = getBooleanInput('postToConversation') ?? false;
    this.pullRequestApproval = getBooleanInput('pullRequestApproval') ?? false;
    this.retryCodes = this.validateAndGetRetryCodes(getInput('retryCodes'));
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showBlockingAfter = getBooleanInput('showBlockingAfter') ?? false;
    this.viewerUrl = getInput('viewerUrl') ? this.validateAndGetUrl(getInput('viewerUrl')).href : undefined;

    this.project = getInput('projectName');
    this.branchname = getInput('branchName');
    this.branchdir = getInput('branchDir');
    this.cdtoken = getInput('clientData');
    this.codetype = getInput('codetype');
    this.calc = getInput('calc');
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');
    this.recalc = getInput('recalc');
    this.tmpdir = getInput('tmpDir');
    this.additionalFlags = getInput('additionalFlags');

    this.validateCliOptions(this, this.mode);
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

  getSecretsFilter(secretsFilter: string): string[] {
    const defaults = ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'];
    const keys = secretsFilter.split(',').filter(s => s !== '');

    const combinedFilters = defaults.concat(keys);

    process.stdout.write(`::debug::SecretsFilter: ${JSON.stringify(combinedFilters) + EOL}`);

    return combinedFilters;
  }

  /**
   * Validates if the given input are valid retry codes and returns them.
   * @returns the processed input if it is correct.
   * @throws error if the input is incorrect.
   */
  validateAndGetRetryCodes(retryCodes?: string): number[] {
    if (!retryCodes) {
      return [419, 500, 501, 502, 503, 504];
    }

    return retryCodes.split(',').map(r => {
      const code = Number(r);
      if (Number.isNaN(code)) {
        throw Error(`Parameter 'retryCodes' contains value '${r}' which is not a number`);
      } else {
        return code;
      }
    });
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
   * Validates if the given cli options are valid.
   * @throws error if project auto is used incorrectly.
   */
  validateCliOptions(action: ActionConfiguration, mode: Mode) {
    // validate project
    if (mode === Mode.QSERVER) {
      if (action.project === 'auto') {
        throw Error(`Running TICS with project 'auto' is not possible with QServer`);
      }
    }

    for (const option of CliOptions) {
      const key = option.cli as keyof ActionConfiguration;
      if (action[key] !== '' && !option.modes.includes(mode)) {
        logger.warning(`Parameter '${option.action}' is not applicable to mode '${mode}' and will therefore not be used`);
      }
    }
  }
}
