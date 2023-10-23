import * as http from 'http';
import { ProxyServer, createProxy } from 'proxy';

// Default values are set when the module is imported, so we need to set proxy first.
// Running these tests with http_proxy
const proxyUrl = 'http://127.0.0.1:8082';
const originalProxyUrl = process.env['http_proxy'];
process.env['http_proxy'] = proxyUrl;

// set required inputs
process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_PROJECTNAME = 'tics-github-action';
process.env.INPUT_TICSCONFIGURATION = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';

// eslint-disable-next-line import/first
import { httpClient } from '../../src/configuration';
import { HttpClient } from '@actions/http-client';

jest.mock('../../src/tics/api_helper', () => {
  return {
    getTicsWebBaseUrlFromUrl: jest.fn(),
    httpRequest: jest.requireActual('../../src/tics/api_helper').httpRequest
  };
});

describe('@actions/http-client (using http_proxy)', () => {
  let proxyServer: ProxyServer;
  let proxyConnects: string[] = [];
  let requestCount = 0;

  beforeAll(async () => {
    // setup proxy server
    proxyServer = createProxy(
      http.createServer((req, res) => {
        requestCount++;
        if (req.url == '/200') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"data": "pass"}');
        } else if (req.url == '/502') {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      })
    );
    const port = Number(proxyUrl.split(':')[2]);
    proxyServer.listen(port);

    proxyServer.on('connect', req => {
      proxyConnects.push(req.url ?? '');
    });
  });

  beforeEach(() => {
    proxyConnects = [];
    requestCount = 0;
  });

  afterAll(async () => {
    proxyServer.close();

    if (originalProxyUrl) {
      process.env['http_proxy'] = originalProxyUrl;
    }
  });

  test('Should return basic REST request through the proxy', async () => {
    const response = await httpClient.get('http://0.0.0.0:8082/200');

    expect(JSON.parse(await response.readBody())).toEqual({ data: 'pass' });
    expect(proxyConnects).toEqual(['0.0.0.0:8082']);
    expect(requestCount).toEqual(1);
  });

  test('Should retry 7 times basic REST request through the proxy', async () => {
    const httpClient = new HttpClient('tics-github-action', undefined, {
      allowRetries: true,
      maxRetries: 7
    });

    const time = Date.now();
    const response = await httpClient.get('http://0.0.0.0:8082/502');

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(1);
    expect(response.message.statusCode).toEqual(502);
    expect(proxyConnects).toContain('0.0.0.0:8082');
    expect(requestCount).toEqual(8);
  }, 10000);

  test('Should retry 8 times basic REST request through the proxy', async () => {
    const httpClient = new HttpClient('tics-github-action', undefined, {
      allowRetries: true,
      maxRetries: 8
    });

    const time = Date.now();
    const response = await httpClient.get('http://0.0.0.0:8082/502');

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(2);
    expect(response.message.statusCode).toEqual(502);
    expect(proxyConnects).toContain('0.0.0.0:8082');
    expect(requestCount).toEqual(9);
  }, 10000);

  test('Should retry on basic REST request, but not through the proxy', async () => {
    // setting no_proxy
    const originalNoProxy = process.env['no_proxy'];
    process.env['no_proxy'] = '0.0.0.0';

    const httpClient = new HttpClient('tics-github-action', undefined, {
      allowRetries: true,
      maxRetries: 8
    });

    const time = Date.now();
    const response = await httpClient.get('http://0.0.0.0:8082/502');

    // resetting no_proxy
    process.env['no_proxy'] = originalNoProxy;

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(2);
    expect(response.message.statusCode).toEqual(502);
    expect(proxyConnects.length).toEqual(0);
    expect(requestCount).toEqual(9);
  }, 10000);
});
