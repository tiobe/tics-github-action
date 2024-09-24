import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { Mode, TicsConfiguration, TrustStrategy } from '../../../src/configuration/tics';

describe('tICS Configuration', () => {
  let values: Record<string, string>;
  const environment = process.env;

  let expectDefault = {
    filelist: '',
    githubToken: '',
    hostnameVerification: true,
    installTics: false,
    mode: '',
    ticsAuthToken: '',
    viewerUrl: '',
    trustStrategy: 'strict',
    baseUrl: '',
    displayUrl: ''
  };

  beforeEach(() => {
    jest.resetModules();
    jest.spyOn(core, 'getInput').mockImplementation((name): string => {
      for (const value in values) {
        if (value === name) {
          return values[value];
        }
      }

      return '';
    });

    jest.spyOn(core, 'getBooleanInput').mockImplementation((name): boolean => {
      for (const value in values) {
        if (value === name) {
          return values[value] === 'true';
        }
      }

      return false;
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = { ...environment };
  });

  describe('validate URLs', () => {
    it('should throw error on Should throw error on incorrect URL', () => {
      values = {
        viewerUrl: 'tiobeweb/TICS/api/cfg?name=asdf'
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' with value 'tiobeweb/TICS/api/cfg?name=asdf' is not a valid url");
    });

    it('should throw error on incorrect URL missing http(s)', () => {
      values = {
        viewerUrl: 'htt://test.com/tiobeweb/TICS/api/cfg?name=asdf'
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' is missing the protocol (http(s)://)");
    });

    it('should throw error on http URL missing /api/', () => {
      values = {
        viewerUrl: 'http://test.com/tiobeweb/TICS/cfg?name='
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' is missing path /api/cfg");
    });

    it('should throw error on https URL missing /api/', () => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/cfg?name='
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' is missing path /api/cfg");
    });

    it('should throw error on http URL missing configuration name', () => {
      values = {
        viewerUrl: 'http://test.com/tiobeweb/TICS/api/cfg?name='
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' is missing the configuration. (eg: /cfg?name=default)");
    });

    it('should throw error on https URL missing configuration name', () => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name='
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'viewerUrl' is missing the configuration. (eg: /cfg?name=default)");
    });

    it('should return correct http URL and set base- and displayUrl', () => {
      values = {
        viewerUrl: 'http://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: 'client'
      };

      const ticsConfig = new TicsConfiguration();

      expect(ticsConfig).toMatchObject({
        ...expectDefault,
        viewerUrl: 'http://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: Mode.CLIENT,
        baseUrl: 'http://test.com/tiobeweb/TICS',
        displayUrl: 'http://test.com/tiobeweb/TICS'
      });
    });

    it('should return correct https URL and set base- and displayUrl', () => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: 'client'
      };

      const ticsConfig = new TicsConfiguration();

      expect(ticsConfig).toMatchObject({
        ...expectDefault,
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: Mode.CLIENT,
        baseUrl: 'https://test.com/tiobeweb/TICS',
        displayUrl: 'https://test.com/tiobeweb/TICS'
      });
    });

    it('should throw error if incorrect displayUrl', () => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: 'client',
        displayUrl: 'localhost'
      };

      let error: any;
      try {
        new TicsConfiguration();
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain("Parameter 'displayUrl' with value 'localhost' is not a valid url");
    });

    it('should return different displayUrl from baseUrl', () => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: 'client',
        displayUrl: 'http://viewer.url'
      };

      const ticsConfig = new TicsConfiguration();

      expect(ticsConfig).toMatchObject({
        ...expectDefault,
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: Mode.CLIENT,
        baseUrl: 'https://test.com/tiobeweb/TICS',
        displayUrl: 'http://viewer.url/'
      });
    });
  });

  describe('other validations', () => {
    beforeEach(() => {
      values = {
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: 'client'
      };

      expectDefault = {
        ...expectDefault,
        viewerUrl: 'https://test.com/tiobeweb/TICS/api/cfg?name=asdf',
        mode: Mode.CLIENT,
        baseUrl: 'https://test.com/tiobeweb/TICS',
        displayUrl: 'https://test.com/tiobeweb/TICS'
      };
    });

    describe('validateAndGetMode', () => {
      it('should return if mode given is correct', () => {
        values = {
          ...values,
          mode: 'client'
        };
        const modeClient = new TicsConfiguration();
        values = {
          ...values,
          mode: 'QServer'
        };
        const modeQServer = new TicsConfiguration();
        values = {
          ...values,
          mode: 'diagNostic'
        };
        const modeDiagnostic = new TicsConfiguration();

        expect(modeClient).toMatchObject({ ...expectDefault, mode: Mode.CLIENT });
        expect(modeQServer).toMatchObject({ ...expectDefault, mode: Mode.QSERVER });
        expect(modeDiagnostic).toMatchObject({ ...expectDefault, mode: Mode.DIAGNOSTIC });
      });

      it('should throw error if mode given is incorrect', () => {
        values = {
          ...values,
          mode: 'server'
        };

        let error: any;
        try {
          new TicsConfiguration();
        } catch (err) {
          error = err;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Parameter 'mode' should be one of 'client', 'qserver' or 'diagnostic'. Input given is 'server'");
      });
    });

    describe('validate HostnameVerification', () => {
      it('should be set to true if no input is given', () => {
        const hostNone = new TicsConfiguration();

        expect(hostNone).toMatchObject({ ...expectDefault, hostnameVerification: true });
      });

      it('should return if the hostname verification given is correct', () => {
        values = {
          ...values,
          hostnameVerification: '1'
        };
        const hostOne = new TicsConfiguration();
        values = {
          ...values,
          hostnameVerification: 'true'
        };
        const hostTrue = new TicsConfiguration();
        values = {
          ...values,
          hostnameVerification: '0'
        };
        const hostZero = new TicsConfiguration();
        values = {
          ...values,
          hostnameVerification: 'FALSE'
        };
        const hostFalse = new TicsConfiguration();

        expect(hostOne).toMatchObject({ ...expectDefault, hostnameVerification: true });
        expect(hostTrue).toMatchObject({ ...expectDefault, hostnameVerification: true });
        expect(hostZero).toMatchObject({ ...expectDefault, hostnameVerification: false });
        expect(hostFalse).toMatchObject({ ...expectDefault, hostnameVerification: false });
      });

      it('should throw error if the hostname verification given is incorrect', () => {
        values = {
          ...values,
          hostnameVerification: '2'
        };

        let error: any;
        try {
          new TicsConfiguration();
        } catch (err) {
          error = err;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Parameter 'hostnameVerification' should be '1'/'true' or '0'/'false'. Input given is '2'");
      });
    });

    describe('validate TrustStrategy', () => {
      it('should return if trust strategy given is strict', () => {
        values = {
          ...values,
          trustStrategy: 'strict'
        };
        const strategyStrict = new TicsConfiguration();

        expect(strategyStrict).toEqual({
          ...expectDefault,
          trustStrategy: TrustStrategy.STRICT
        });
      });

      it('should return if trust strategy given is self-signed', () => {
        values = {
          ...values,
          trustStrategy: 'self-signed'
        };
        const strategySelf = new TicsConfiguration();

        expect(strategySelf).toEqual({
          ...expectDefault,
          trustStrategy: TrustStrategy.SELFSIGNED
        });
      });

      it('should return if trust strategy given is all', () => {
        values = {
          ...values,
          trustStrategy: 'all'
        };
        const strategyAll = new TicsConfiguration();

        expect(strategyAll).toEqual({
          ...expectDefault,
          trustStrategy: TrustStrategy.ALL
        });
      });

      it('should throw error if trust strategy given is incorrect', () => {
        values = {
          ...values,
          trustStrategy: 'self'
        };

        let error: any;
        try {
          new TicsConfiguration();
        } catch (err) {
          error = err;
        }

        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain("Parameter 'trustStrategy' should be one of 'strict', 'self-signed' or 'all'. Input given is 'self'");
      });
    });
  });

  describe('environment tests', () => {
    it('should set every value correctly and set the variables (Client)', () => {
      values = {
        filelist: './filelist',
        githubToken: 'github-token',
        hostnameVerification: 'false',
        installTics: 'true',
        mode: 'client',
        ticsAuthToken: 'auth-token',
        viewerUrl: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
        trustStrategy: 'self-signed',
        displayUrl: 'http://viewer.url'
      };

      const ticsConfig = new TicsConfiguration();

      expect(ticsConfig).toMatchObject({
        filelist: './filelist',
        githubToken: 'github-token',
        hostnameVerification: false,
        installTics: true,
        mode: Mode.CLIENT,
        ticsAuthToken: 'auth-token',
        viewerUrl: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
        trustStrategy: TrustStrategy.SELFSIGNED,
        baseUrl: 'http://localhost/tiobeweb/TICS',
        displayUrl: 'http://viewer.url/'
      });
      expect(process.env.TICSCI).toBe('1');
      expect(process.env.TICSIDE).toBe('GITHUB');
      expect(process.env.TICSAUTHTOKEN).toBe('auth-token');
      expect(process.env.TICSHOSTNAMEVERIFICATION).toBe('false');
      expect(process.env.TICSTRUSTSTRATEGY).toBe('self-signed');
      expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('0');
    });

    it('should set every value correctly and set the variables (QServer)', () => {
      values = {
        filelist: './filelist',
        githubToken: 'github-token',
        hostnameVerification: 'false',
        installTics: 'true',
        mode: 'qserver',
        ticsAuthToken: 'auth-token',
        viewerUrl: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
        trustStrategy: 'self-signed',
        displayUrl: 'http://viewer.url'
      };

      const ticsConfig = new TicsConfiguration();

      expect(ticsConfig).toMatchObject({
        filelist: './filelist',
        githubToken: 'github-token',
        hostnameVerification: false,
        installTics: true,
        mode: Mode.QSERVER,
        ticsAuthToken: 'auth-token',
        viewerUrl: 'http://localhost/tiobeweb/TICS/api/cfg?name=default',
        trustStrategy: TrustStrategy.SELFSIGNED,
        baseUrl: 'http://localhost/tiobeweb/TICS',
        displayUrl: 'http://viewer.url/'
      });

      expect(process.env.TICSCI).toBe('1');
      expect(process.env.TICSIDE).toBeUndefined();
      expect(process.env.TICSAUTHTOKEN).toBe('auth-token');
      expect(process.env.TICSHOSTNAMEVERIFICATION).toBe('false');
      expect(process.env.TICSTRUSTSTRATEGY).toBe('self-signed');
      expect(process.env.NODE_TLS_REJECT_UNAUTHORIZED).toBe('0');
    });
  });
});
