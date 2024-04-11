import * as core from '@actions/core';
import { ActionConfiguration } from '../../../src/action/action_configuration';
import { Mode, TrustStrategy } from '../../../src/helper/enums';
import { logger } from '../../../src/helper/logger';

describe('Action Configuration', () => {
  let actionConfig: ActionConfiguration;
  let warningSpy: jest.SpyInstance;

  let values: Record<string, string>;

  beforeEach(() => {
    values = {
      ticsConfiguration: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
      mode: 'client',
      trustStrategy: 'strict',
      hostnameVerification: 'true'
    };

    warningSpy = jest.spyOn(logger, 'warning');
    jest.spyOn(core, 'getInput').mockImplementation((name, _options): string => {
      for (const value in values) {
        if (value === name) {
          return values[value];
        }
      }

      return '';
    });
    jest.spyOn(core, 'getBooleanInput').mockImplementation((name, _options): boolean => {
      for (const value in values) {
        if (value === name) {
          return values[value] === 'true';
        }
      }

      return false;
    });

    actionConfig = new ActionConfiguration();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('Should pass with zero warnings if nothing other then defaults are given', () => {
      const config = new ActionConfiguration();

      expect(warningSpy).toHaveBeenCalledTimes(0);
      expect(config.excludeMovedFiles).toEqual(false);
      expect(config.filelist).toEqual('');
      expect(config.githubToken).toEqual('');
      expect(config.hostnameVerification).toEqual(true);
      expect(config.installTics).toEqual(false);
      expect(config.mode).toEqual(Mode.CLIENT);
      expect(config.postAnnotations).toEqual(false);
      expect(config.postToConversation).toEqual(false);
      expect(config.pullRequestApproval).toEqual(false);
      expect(config.retryCodes).toEqual([419, 500, 501, 502, 503, 504]);
      expect(config.ticsAuthToken).toEqual('');
      expect(config.ticsConfiguration).toEqual('http://localhost/tiobeweb/TICS/api/cfg?name=default');
      expect(config.trustStrategy).toEqual(TrustStrategy.STRICT);
      expect(config.secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization']);
      expect(config.showBlockingAfter).toEqual(false);
      expect(config.viewerUrl).toEqual(undefined);
    });

    test('Should pass with zero warnings if a correct client config is given', () => {
      values = {
        ...values,
        filelist: './filelist',
        excludeMovedFiles: 'true',
        installTics: 'true'
      };

      const config = new ActionConfiguration();

      expect(warningSpy).toHaveBeenCalledTimes(0);
      expect(config.excludeMovedFiles).toEqual(true);
      expect(config.filelist).toEqual('./filelist');
      expect(config.githubToken).toEqual('');
      expect(config.hostnameVerification).toEqual(true);
      expect(config.installTics).toEqual(true);
      expect(config.mode).toEqual(Mode.CLIENT);
      expect(config.postAnnotations).toEqual(false);
      expect(config.postToConversation).toEqual(false);
      expect(config.pullRequestApproval).toEqual(false);
      expect(config.retryCodes).toEqual([419, 500, 501, 502, 503, 504]);
      expect(config.ticsAuthToken).toEqual('');
      expect(config.ticsConfiguration).toEqual('http://localhost/tiobeweb/TICS/api/cfg?name=default');
      expect(config.trustStrategy).toEqual(TrustStrategy.STRICT);
      expect(config.secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization']);
      expect(config.showBlockingAfter).toEqual(false);
      expect(config.viewerUrl).toEqual(undefined);
    });
  });

  describe('validateAndGetConfigUrl', () => {
    test('Should throw error on Should throw error on incorrect URL', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('tiobeweb/TICS/api/cfg?name=asdf');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is not a valid url");
    });

    test('Should throw error on incorrect URL missing http(s)', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('htt://test.com/tiobeweb/TICS/api/cfg?name=asdf');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is missing the protocol (http(s)://)");
    });

    test('Should throw error on http URL missing /api/', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('http://test.com/tiobeweb/TICS/cfg?name=');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is missing path /api/cfg");
    });

    test('Should throw error on https URL missing /api/', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('https://test.com/tiobeweb/TICS/cfg?name=');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is missing path /api/cfg");
    });

    test('Should throw error on http URL missing configuration name', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('http://test.com/tiobeweb/TICS/api/cfg?name');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is missing the configuration. (eg: /cfg?name=default)");
    });

    test('Should throw error on https URL missing configuration name', () => {
      let error: any;
      try {
        actionConfig.validateAndGetConfigUrl('https://test.com/tiobeweb/TICS/api/cfg?name=');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'ticsConfiguration' is missing the configuration. (eg: /cfg?name=default)");
    });

    test('Should return correct http URL', () => {
      const url = actionConfig.validateAndGetConfigUrl('http://test.com/tiobeweb/TICS/api/cfg?name=asdf');

      expect(url).toEqual('http://test.com/tiobeweb/TICS/api/cfg?name=asdf');
    });

    test('Should return correct https URL', () => {
      const url = actionConfig.validateAndGetConfigUrl('https://test.com/tiobeweb/TICS/api/cfg?name=asdf');

      expect(url).toEqual('https://test.com/tiobeweb/TICS/api/cfg?name=asdf');
    });
  });

  describe('validateAndGetMode', () => {
    test('Should return if mode given is correct', () => {
      const modeClient = actionConfig.validateAndGetMode('client');
      const modeQServer = actionConfig.validateAndGetMode('QServer');
      const modeDiagnostic = actionConfig.validateAndGetMode('diagNostic');

      expect(modeClient).toEqual(Mode.CLIENT);
      expect(modeQServer).toEqual(Mode.QSERVER);
      expect(modeDiagnostic).toEqual(Mode.DIAGNOSTIC);
    });

    test('Should throw error if mode given is incorrect', () => {
      let error: any;
      try {
        actionConfig.validateAndGetMode('server');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'mode' should be one of 'client', 'qserver' or 'diagnostic'. Input given is 'server'");
    });
  });

  describe('getSecretsFilter', () => {
    test('Should set default secretsFilter if none are given', async () => {
      const secretsFilter = actionConfig.getSecretsFilter('');

      expect(secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization']);
    });

    test('Should add custom secretsFilter when given correctly', async () => {
      const secretsFilter = actionConfig.getSecretsFilter(',TOKEN,AUTH;STEM');

      expect(secretsFilter).toEqual(['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token', 'Authorization', 'TOKEN', 'AUTH;STEM']);
    });
  });

  describe('validateAndGetRetryCodes', () => {
    test('Should set default retryCodes if none are given', async () => {
      const retryCodes = actionConfig.validateAndGetRetryCodes(undefined);

      expect(retryCodes).toEqual([419, 500, 501, 502, 503, 504]);
    });

    test('Should set custom retryCodes when given correctly', async () => {
      const retryCodes = actionConfig.validateAndGetRetryCodes('500,502');

      expect(retryCodes).toEqual([500, 502]);
    });

    test('Should throw Error for retryCode when input is Should throw error on incorrect', async () => {
      let error: any;
      try {
        actionConfig.validateAndGetRetryCodes('404,500;502');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("'500;502'");
    });
  });

  describe('validateAndGetTrustStrategy', () => {
    test('Should return if trust strategy given is correct', () => {
      const strategyStrict = actionConfig.validateAndGetTrustStrategy('strict');
      const strategySelf = actionConfig.validateAndGetTrustStrategy('self-signed');
      const strategyAll = actionConfig.validateAndGetTrustStrategy('all');

      expect(strategyStrict).toEqual(TrustStrategy.STRICT);
      expect(strategySelf).toEqual(TrustStrategy.SELFSIGNED);
      expect(strategyAll).toEqual(TrustStrategy.ALL);
    });

    test('Should throw error if trust strategy given is incorrect', () => {
      let error: any;
      try {
        actionConfig.validateAndGetTrustStrategy('self');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'trustStrategy' should be one of 'strict', 'self-signed' or 'all'. Input given is 'self'");
    });
  });

  describe('validateAndGetHostnameVerification', () => {
    test('Should return if the hostname verification not given', () => {
      const host = actionConfig.validateAndGetHostnameVerification('');

      expect(host).toBeTruthy();
    });

    test('Should return if the hostname verification given is correct', () => {
      const hostOne = actionConfig.validateAndGetHostnameVerification('1');
      const hostTrue = actionConfig.validateAndGetHostnameVerification('true');
      const hostZero = actionConfig.validateAndGetHostnameVerification('0');
      const hostFalse = actionConfig.validateAndGetHostnameVerification('FALSE');

      expect(hostOne).toBeTruthy();
      expect(hostTrue).toBeTruthy();
      expect(hostZero).toBeFalsy();
      expect(hostFalse).toBeFalsy();
    });

    test('Should throw error if the hostname verification given is incorrect', () => {
      let error: any;
      try {
        actionConfig.validateAndGetHostnameVerification('2');
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'hostnameVerification' should be '1'/'true' or '0'/'false'. Input given is '2'");
    });
  });

  describe('validateCliOptions', () => {
    test('Should pass when mode is client or diagnostic and project is auto', () => {
      values = {
        ...values,
        projectName: 'auto'
      };

      const cliOptions = new ActionConfiguration();

      actionConfig.validateCliOptions(cliOptions, Mode.CLIENT);
      actionConfig.validateCliOptions(cliOptions, Mode.DIAGNOSTIC);
    });

    test('Should pass when mode is client or diagnostic and project is given', () => {
      values = {
        ...values,
        projectName: 'project'
      };

      const cliOptions = new ActionConfiguration();

      actionConfig.validateCliOptions(cliOptions, Mode.CLIENT);
      actionConfig.validateCliOptions(cliOptions, Mode.DIAGNOSTIC);
    });

    test('Should pass when mode is qserver and project is given', () => {
      values = {
        ...values,
        projectName: 'project'
      };

      const cliOptions = new ActionConfiguration();

      actionConfig.validateCliOptions(cliOptions, Mode.QSERVER);
    });

    test('Should throw error if mode is qserver and project is auto', () => {
      values = {
        ...values,
        projectName: 'auto'
      };

      const cliOptions = new ActionConfiguration();

      let error: any;
      try {
        actionConfig.validateCliOptions(cliOptions, Mode.QSERVER);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Running TICS with project 'auto' is not possible with QServer");
    });

    test('Should throw warnings on Client-only cli options if used in mode QServer', () => {
      values = {
        ...values,
        mode: 'QServer',
        projectName: 'project',
        branchName: 'string',
        branchDir: 'string',
        clientData: 'string',
        codetype: 'string',
        calc: 'string',
        nocalc: 'string',
        norecalc: 'string',
        recalc: 'string',
        tmpDir: 'string',
        additionalFlags: 'string'
      };

      new ActionConfiguration();

      expect(warningSpy).toHaveBeenCalledTimes(2);
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('clientData'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('codetype'));
    });

    test('Should throw warnings on QServer-only cli options if used in mode Client', () => {
      values = {
        ...values,
        mode: 'Client',
        projectName: 'project',
        branchName: 'string',
        branchDir: 'string',
        clientData: 'string',
        codetype: 'string',
        calc: 'string',
        nocalc: 'string',
        norecalc: 'string',
        recalc: 'string',
        tmpDir: 'string',
        additionalFlags: 'string'
      };

      new ActionConfiguration();

      expect(warningSpy).toHaveBeenCalledTimes(1);
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchDir'));
    });

    test('Should throw warnings on Client- and QServer-only cli options if used in mode Diagnostic', () => {
      values = {
        ...values,
        mode: 'Diagnostic',
        projectName: 'project',
        branchName: 'string',
        branchDir: 'string',
        clientData: 'string',
        codetype: 'string',
        calc: 'string',
        nocalc: 'string',
        norecalc: 'string',
        recalc: 'string',
        tmpDir: 'string',
        additionalFlags: 'string'
      };

      new ActionConfiguration();

      expect(warningSpy).toHaveBeenCalledTimes(9);
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('projectName'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchDir'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('branchName'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('clientData'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('codetype'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('calc'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('nocalc'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('norecalc'));
      expect(warningSpy).toHaveBeenCalledWith(expect.stringContaining('recalc'));
    });
  });
});
