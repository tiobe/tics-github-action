import { getBooleanInput, getInput } from '@actions/core';
import { Mode } from '../helper/enums';
import { githubConfig } from '../configuration';
import { EOL } from 'os';

export class ActionConfiguration {
  projectName: string;
  additionalFlags: string;
  branchDir: string;
  branchName: string;
  calc: string;
  clientData: string;
  codetype: string;
  excludeMovedFiles: boolean;
  filelist: string;
  githubToken: string;
  hostnameVerification: string;
  installTics: boolean;
  mode: Mode;
  nocalc: string;
  norecalc: string;
  postAnnotations: boolean;
  postToConversation: boolean;
  pullRequestApproval: boolean;
  recalc: string;
  retryCodes: number[];
  ticsAuthToken: string;
  ticsConfiguration: string;
  tmpDir: string;
  trustStrategy: string;
  secretsFilter: string[];
  showBlockingAfter: boolean;
  viewerUrl: string | undefined;

  constructor() {
    // TICS usage options
    this.ticsConfiguration = this.validateAndGetConfigUrl(getInput('ticsConfiguration', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.githubToken = getInput('githubToken');
    this.installTics = getBooleanInput('installTics');
    this.hostnameVerification = getInput('hostnameVerification');
    this.trustStrategy = getInput('trustStrategy');
    this.filelist = getInput('filelist');

    // action options
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles');
    this.postAnnotations = getBooleanInput('postAnnotations');
    this.postToConversation = getBooleanInput('postToConversation');
    this.pullRequestApproval = getBooleanInput('pullRequestApproval');
    this.retryCodes = this.getRetryCodes(getInput('retryCodes'));
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showBlockingAfter = getBooleanInput('showBlockingAfter');
    this.viewerUrl = getInput('viewerUrl') ? this.validateAndGetUrl(getInput('viewerUrl')).href : undefined;

    // TICS cli
    this.additionalFlags = getInput('additionalFlags');
    this.projectName = this.validateAndGetProject(getInput('projectName'));
    this.branchName = getInput('branchName');
    this.branchDir = getInput('branchDir');
    this.clientData = getInput('clientData');
    this.codetype = getInput('codetype');
    this.calc = getInput('calc');
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');
    this.recalc = getInput('recalc');
    this.ticsAuthToken = getInput('ticsAuthToken');
    this.tmpDir = getInput('tmpDir');
  }

  /**
   * Validates if the given input is a valid TICS url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetConfigUrl(url: string): string {
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
  private validateAndGetUrl(url: string): URL {
    try {
      return new URL(url);
    } catch {
      throw Error(`Parameter 'ticsConfiguration' is not a valid url.`);
    }
  }

  /**
   * Validates if the given input is a valid mode and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetMode(input: string): Mode {
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
   * Validates if the given input is a valid project and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetProject(input: string): string {
    if (this.mode === Mode.QSERVER) {
      if (input === 'auto') {
        throw Error(`Running TICS with project 'auto' is not possible with QServer.`);
      }
    }
    return input;
  }

  getSecretsFilter(secretsFilter: string | undefined) {
    const defaults = ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization'];
    const keys = secretsFilter ? secretsFilter.split(',').filter(s => s !== '') : [];

    const combinedFilters = defaults.concat(keys);
    if (githubConfig.debugger) {
      process.stdout.write(`::debug::SecretsFilter: ${JSON.stringify(combinedFilters) + EOL}`);
    }

    return combinedFilters;
  }

  getRetryCodes(retryCodes?: string): number[] {
    if (!retryCodes) {
      return [419, 500, 501, 502, 503, 504];
    }

    return retryCodes.split(',').map(r => {
      if (Number.isNaN(r)) {
        throw Error(`Parameter 'retryCodes' contains value '${r}' which is not a number.`);
      } else {
        return Number(r);
      }
    });
  }
}
