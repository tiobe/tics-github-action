import { getBooleanInput, getInput } from '@actions/core';
import { Mode } from '../helper/enums';
import { githubConfig } from '../configuration';
import { EOL } from 'os';

export class ActionConfiguration {
  ticsConfiguration: string;
  mode: Mode;
  projectName: string;
  githubToken: string;
  additionalFlags: string;
  branchName: string;
  clientData: string;
  codetype: string;
  calc: string;
  excludeMovedFiles: boolean;
  filelist: string;
  hostnameVerification: string;
  installTics: boolean;
  nocalc: string;
  norecalc: string;
  postAnnotations: boolean;
  postToConversation: boolean;
  pullRequestApproval: boolean;
  recalc: string;
  retryCodes: number[];
  ticsAuthToken: string;
  tmpDir: string;
  trustStrategy: string;
  secretsFilter: string[];
  showBlockingAfter: boolean;
  viewerUrl: string;

  constructor() {
    this.ticsConfiguration = this.validateAndGetConfigUrl(getInput('ticsConfiguration', { required: true }));
    this.mode = this.validateAndGetMode(getInput('mode'));
    this.projectName = this.validateAndGetProject(getInput('projectName'));

    this.githubToken = getInput('githubToken');
    this.additionalFlags = getInput('additionalFlags');
    this.branchName = getInput('branchName');
    this.clientData = getInput('clientData');
    this.codetype = getInput('codetype');
    this.calc = getInput('calc');
    this.excludeMovedFiles = getBooleanInput('excludeMovedFiles');
    this.filelist = getInput('filelist');
    this.hostnameVerification = getInput('hostnameVerification');
    this.installTics = getBooleanInput('installTics');
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');
    this.postAnnotations = getBooleanInput('postAnnotations');
    this.postToConversation = getBooleanInput('postToConversation');
    this.pullRequestApproval = getBooleanInput('pullRequestApproval');
    this.recalc = getInput('recalc');
    this.retryCodes = this.getRetryCodes(getInput('retryCodes'));
    this.ticsAuthToken = getInput('ticsAuthToken');
    this.tmpDir = getInput('tmpDir');
    this.trustStrategy = getInput('trustStrategy');
    this.secretsFilter = this.getSecretsFilter(getInput('secretsFilter'));
    this.showBlockingAfter = getBooleanInput('showBlockingAfter');
    this.viewerUrl = getInput('viewerUrl');
  }

  /**
   * Validates if the given input is a valid TICS url and returns it.
   * @returns the input if it is correct.
   * @throws error if the input is incorrect.
   */
  private validateAndGetConfigUrl(url: string): string {
    try {
      var uri = new URL(url);
    } catch {
      throw Error(`Parameter 'ticsConfiguration' is not a valid url.`);
    }

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
    return retryCodes.split(',').map(r => Number(r));
  }
}
