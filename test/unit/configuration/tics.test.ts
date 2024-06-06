import * as core from '@actions/core';
import { Mode, TicsConfiguration, TrustStrategy } from '../../../src/configuration/tics';

describe('TICS Configuration', () => {
  let values: Record<string, string>;

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
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Validate URLs', () => {
    test('Should throw error on Should throw error on incorrect URL', () => {
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

    test('Should throw error on incorrect URL missing http(s)', () => {
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

    test('Should throw error on http URL missing /api/', () => {
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

    test('Should throw error on https URL missing /api/', () => {
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

    test('Should throw error on http URL missing configuration name', () => {
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

    test('Should throw error on https URL missing configuration name', () => {
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

    test('Should return correct http URL and set base- and displayUrl', () => {
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

    test('Should return correct https URL and set base- and displayUrl', () => {
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

    test('Should throw error if incorrect displayUrl', () => {
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

    test('Should return different displayUrl from baseUrl', () => {
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

  describe('Other validations', () => {
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
      test('Should return if mode given is correct', () => {
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

      test('Should throw error if mode given is incorrect', () => {
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

    describe('Validate HostnameVerification', () => {
      test('Should be set to true if no input is given', () => {
        const hostNone = new TicsConfiguration();
        expect(hostNone).toMatchObject({ ...expectDefault, hostnameVerification: true });
      });

      test('Should return if the hostname verification given is correct', () => {
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

      test('Should throw error if the hostname verification given is incorrect', () => {
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

    describe('Validate TrustStrategy', () => {
      test('Should return if trust strategy given is strict', () => {
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

      test('Should return if trust strategy given is self-signed', () => {
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

      test('Should return if trust strategy given is all', () => {
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

      test('Should throw error if trust strategy given is incorrect', () => {
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

  test('Should set every value correctly and set the variables (Client)', () => {
    const exportSpy = jest.spyOn(core, 'exportVariable');

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
    expect(exportSpy).toHaveBeenCalledTimes(7);
    expect(exportSpy).toHaveBeenCalledWith('TICSCI', 1);
    expect(exportSpy).toHaveBeenCalledWith('TICSIDE', 'GITHUB');
    expect(exportSpy).toHaveBeenCalledWith('TICSAUTHTOKEN', 'auth-token');
    expect(exportSpy).toHaveBeenCalledWith('TICSHOSTNAMEVERIFICATION', false);
    expect(exportSpy).toHaveBeenCalledWith('TICSTRUSTSTRATEGY', 'self-signed');
    expect(exportSpy).toHaveBeenCalledWith('NODE_TLS_REJECT_UNAUTHORIZED', 0);
  });

  test('Should set every value correctly and set the variables (QServer)', () => {
    const exportSpy = jest.spyOn(core, 'exportVariable');

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
    expect(exportSpy).toHaveBeenCalledTimes(6);
    expect(exportSpy).toHaveBeenCalledWith('TICSCI', 1);
    expect(exportSpy).toHaveBeenCalledWith('TICSAUTHTOKEN', 'auth-token');
    expect(exportSpy).toHaveBeenCalledWith('TICSHOSTNAMEVERIFICATION', false);
    expect(exportSpy).toHaveBeenCalledWith('TICSTRUSTSTRATEGY', 'self-signed');
    expect(exportSpy).toHaveBeenCalledWith('NODE_TLS_REJECT_UNAUTHORIZED', 0);
  });
});
