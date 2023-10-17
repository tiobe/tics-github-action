import * as http from 'http';
import { ProxyServer, createProxy } from 'proxy';

// Default values are set when the module is imported, so we need to set proxy first.
const proxyUrl = 'http://127.0.0.1:8082';
const originalHttpsProxyUrl = process.env['https_proxy'];
const originalHttpProxyUrl = process.env['http_proxy'];
process.env['https_proxy'] = proxyUrl;
process.env['http_proxy'] = proxyUrl;

// set required inputs
process.env.INPUT_PROJECTNAME = 'tics-github-action';
process.env.INPUT_TICSCONFIGURATION = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.GITHUB_ACTION = 'true';

// eslint-disable-next-line import/first
import { httpClient } from '../../src/configuration';
import { HttpClient } from '@actions/http-client';

jest.mock('../../src/tics/api_helper', () => {
  return {
    getTicsWebBaseUrlFromUrl: jest.fn(),
    httpRequest: jest.requireActual('../../src/tics/api_helper').httpRequest
  }
})

describe('@actions/github', () => {
  let proxyServer: ProxyServer;
  let proxyConnects: string[] = [];
  let requestCount = 0;

  beforeAll(async () => {
    // setup proxy server
    proxyServer = createProxy(http.createServer());
    proxyServer.listen(Number(proxyUrl.split(':')[2]));

    proxyServer.on('connect', (req) => {
      requestCount++;
      proxyConnects.push(req.url ?? '');
    });
  });

  beforeEach(() => {
    proxyConnects = [];
    requestCount = 0;
  });

  afterAll(async () => {
    proxyServer.close();

    if (originalHttpsProxyUrl) {
      process.env['https_proxy'] = originalHttpsProxyUrl;
    }
    if (originalHttpProxyUrl) {
      process.env['http_proxy'] = originalHttpProxyUrl;
    }
  });

  test('Should return basic REST request with proxy', async () => {
    const version = await httpClient.getJson<{ projectName: string }>('https://eboit.tiobe.com/tiobeweb/TICS/api/v1/version');

    expect(version?.result?.projectName).toBe('TiobeWebImplementation');
    expect(proxyConnects).toEqual(['eboit.tiobe.com:443']);
    expect(requestCount).toEqual(1);
  });
});
