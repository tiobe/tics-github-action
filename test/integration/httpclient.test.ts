import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as http from 'http';
import { ProxyServer, createProxy } from 'proxy';

// Default values are set when the module is imported, so we need to set proxy first.
// Running these tests with http_proxy
const proxyUrl = 'http://127.0.0.1:8083';
const originalProxyUrl = process.env['http_proxy'];
process.env['http_proxy'] = proxyUrl;

// set required inputs
process.env.GITHUB_REPOSITORY = 'owner/repo';
process.env.INPUT_GITHUBTOKEN = 'token';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECTNAME = 'tics-github-action';
process.env.INPUT_VIEWERURL = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.INPUT_SHOWBLOCKINGAFTER = 'true';
process.env.INPUT_TRUSTSTRATEGY = 'strict';

// mock before importing httpClient
jest.spyOn(process.stdout, 'write').mockImplementation((): any => {});

import { httpClient } from '../../src/viewer/http-client';
import HttpClient from '@tiobe/http-client';
import { ProxyAgent } from 'proxy-agent';

describe('@actions/http-client (using http_proxy)', () => {
  let proxyServer: ProxyServer;
  let httpServer: http.Server;
  let proxyConnects: string[] = [];

  beforeAll(async () => {
    httpServer = http
      .createServer((req, res) => {
        if (req.url == '/200') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end('{"data": "pass"}');
        } else if (req.url == '/502') {
          res.writeHead(502, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      })
      .listen(8082);

    proxyServer = createProxy();
    const port = Number(proxyUrl.split(':')[2]);
    proxyServer.listen(port);

    proxyServer.on('request', req => {
      proxyConnects.push(req.url ?? '');
    });
  });

  beforeEach(() => {
    proxyConnects = [];
  });

  afterAll(async () => {
    proxyServer.close();
    httpServer.close();

    if (originalProxyUrl) {
      process.env['http_proxy'] = originalProxyUrl;
    }
  });

  it('should return basic REST request through the proxy', async () => {
    const response = await httpClient.get('http://0.0.0.0:8082/200');

    expect(response).toMatchObject({ data: { data: 'pass' }, status: 200, retryCount: 0 });
    expect(proxyConnects).toContain('http://0.0.0.0:8082/200');
    expect(proxyConnects.filter(p => p === 'http://0.0.0.0:8082/200')).toHaveLength(1);
  });

  it('should retry 3 times basic REST request through the proxy', async () => {
    const httpClient = new HttpClient(
      true,
      {
        retry: {
          retries: 3,
          retryDelay: 200,
          retryOn: [502]
        }
      },
      new ProxyAgent()
    );

    let response: any;
    let errorMessage: any;
    const time = Date.now();
    try {
      response = await httpClient.get('http://0.0.0.0:8082/502');
    } catch (error: any) {
      errorMessage = error.message;
    }

    expect(Date.now() - time).toBeGreaterThanOrEqual(600);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects).toContain('http://0.0.0.0:8082/502');
    expect(proxyConnects.filter(p => p === 'http://0.0.0.0:8082/502')).toHaveLength(4);
  }, 10000);

  it('should retry 4 times basic REST request through the proxy', async () => {
    const httpClient = new HttpClient(
      true,
      {
        retry: {
          retries: 4,
          retryDelay: 200,
          retryOn: [502]
        }
      },
      new ProxyAgent()
    );

    let response: any;
    let errorMessage: any;
    const time = Date.now();
    try {
      response = await httpClient.get('http://0.0.0.0:8082/502');
    } catch (error: any) {
      errorMessage = error.message;
    }

    expect(Date.now() - time).toBeGreaterThanOrEqual(800);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects).toContain('http://0.0.0.0:8082/502');
    expect(proxyConnects.filter(p => p === 'http://0.0.0.0:8082/502')).toHaveLength(5);
  }, 10000);

  it('should retry on basic REST request, but not through the proxy', async () => {
    // setting no_proxy
    const originalNoProxy = process.env['no_proxy'];
    process.env['no_proxy'] = '0.0.0.0';

    const httpClient = new HttpClient(
      true,
      {
        retry: {
          retries: 4,
          retryDelay: 200,
          retryOn: [502]
        }
      },
      new ProxyAgent()
    );

    let response: any;
    let errorMessage: any;
    const time = Date.now();
    try {
      response = await httpClient.get('http://0.0.0.0:8082/502');
    } catch (error: any) {
      errorMessage = error.message;
    }

    // resetting no_proxy
    process.env['no_proxy'] = originalNoProxy;

    expect(Date.now() - time).toBeGreaterThanOrEqual(800);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects.filter(p => p === 'http://0.0.0.0:8082/502')).toHaveLength(0);
  }, 10000);
});
