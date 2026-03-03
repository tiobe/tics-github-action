import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as http from 'http';
import { ProxyServer, createProxy } from 'proxy';
import { HttpClient } from '@tiobe/http-client';
import { ProxyAgent } from 'proxy-agent';

describe('@actions/http-client (using http_proxy)', () => {
  let serverUrl: string = '';
  let proxyServer: ProxyServer;
  let httpServer: http.Server;
  let proxyConnects: string[] = [];
  let httpClient: any; // We will import this dynamically

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
      .listen(0);
    serverUrl = 'http://127.0.0.1:' + (httpServer.address() as any).port;

    proxyServer = createProxy();
    proxyServer.listen(0);
    const proxyUrl = 'http://127.0.0.1:' + (proxyServer.address() as any).port;

    // 1. Setup environment variables
    vi.stubEnv('https_proxy', proxyUrl);
    vi.stubEnv('http_proxy', proxyUrl);
    vi.stubEnv('GITHUB_REPOSITORY', 'owner/repo');
    vi.stubEnv('GITHUB_API_URL', 'https://api.github.com');
    vi.stubEnv('GITHUB_ACTION', '_tics-github-action');
    vi.stubEnv('GITHUB_JOB', 'tics_client');
    vi.stubEnv('GITHUB_WORKFLOW', 'tics client');

    // Core inputs (using stubEnv to ensure @actions/core sees them)
    vi.stubEnv('INPUT_MODE', 'client');
    vi.stubEnv('INPUT_PROJECT', 'tics-github-action');
    vi.stubEnv('INPUT_VIEWERURL', 'http://localhost/tiobeweb/TICS/api/cfg?name=default');
    vi.stubEnv('INPUT_EXCLUDEMOVEDFILES', 'false');
    vi.stubEnv('INPUT_INSTALLTICS', 'false');
    vi.stubEnv('INPUT_POSTANNOTATIONS', 'false');
    vi.stubEnv('INPUT_SHOWNONBLOCKING', 'false');
    vi.stubEnv('INPUT_POSTTOCONVERSATION', 'false');
    vi.stubEnv('INPUT_PULLREQUESTAPPROVAL', 'false');
    vi.stubEnv('INPUT_SHOWBLOCKINGAFTER', 'true');
    vi.stubEnv('INPUT_TRUSTSTRATEGY', 'strict');

    // 2. Mock stdout before any imports trigger logging
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

    proxyServer.on('request', req => {
      proxyConnects.push(req.url ?? '');
    });

    // 4. Dynamic Import: This ensures config.ts reads the stubbed envs above
    const module = await import('../../src/viewer/http-client');
    httpClient = module.httpClient;
  });

  beforeEach(() => {
    proxyConnects = [];
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    proxyServer.close();
    httpServer.close();
  });

  it('should return basic REST request through the proxy', async () => {
    const url = `${serverUrl}/200`;
    const response = await httpClient.get(url);

    expect(response).toMatchObject({ data: { data: 'pass' }, status: 200, retryCount: 0 });
    expect(proxyConnects).toContain(url);
    expect(proxyConnects.filter(p => p === url)).toHaveLength(1);
  });

  it('should retry 3 times basic REST request through the proxy', async () => {
    const url = `${serverUrl}/502`;
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
      response = await httpClient.get(url);
    } catch (error: any) {
      errorMessage = error.message;
    }

    expect(Date.now() - time).toBeGreaterThanOrEqual(600);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects).toContain(url);
    expect(proxyConnects.filter(p => p === url)).toHaveLength(4);
  }, 10000);

  it('should retry 4 times basic REST request through the proxy', async () => {
    const url = `${serverUrl}/502`;
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
      response = await httpClient.get(url);
    } catch (error: any) {
      errorMessage = error.message;
    }

    expect(Date.now() - time).toBeGreaterThanOrEqual(800);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects).toContain(url);
    expect(proxyConnects.filter(p => p === url)).toHaveLength(5);
  }, 10000);

  it('should retry on basic REST request, but not through the proxy', async () => {
    vi.stubEnv('no_proxy', '127.0.0.1');

    const url = `${serverUrl}/502`;
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
      response = await httpClient.get(url);
    } catch (error: any) {
      errorMessage = error.message;
    }

    // resetting no_proxy
    vi.stubEnv('no_proxy', '');

    expect(Date.now() - time).toBeGreaterThanOrEqual(800);
    expect(response).toBeUndefined();
    expect(errorMessage).toContain('502');
    expect(proxyConnects.filter(p => p === url)).toHaveLength(0);
  }, 10000);
});
