import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as http from 'http';
import { createProxy } from 'proxy';

// Default values are set when the module is imported, so we need to set proxy first.
// Running these tests with https_proxy
const proxyUrl = 'http://0.0.0.0:8081';
const originalhttpsProxyUrl = process.env['https_proxy'];
const originalhttpProxyUrl = process.env['https_proxy'];
process.env['https_proxy'] = proxyUrl;
process.env['http_proxy'] = proxyUrl;

// set required inputs
process.env.GITHUB_REPOSITORY = 'owner/repo';
process.env.GITHUB_API_URL = 'https://api.github.com';
process.env.GITHUB_ACTION = '_tics-github-action';
process.env.GITHUB_JOB = 'tics_client';
process.env.GITHUB_WORKFLOW = 'tics client';
process.env.INPUT_MODE = 'client';
process.env.INPUT_PROJECT = 'tics-github-action';
process.env.INPUT_VIEWERURL = 'http://localhost/tiobeweb/TICS/api/cfg?name=default';
process.env.INPUT_EXCLUDEMOVEDFILES = 'false';
process.env.INPUT_INSTALLTICS = 'false';
process.env.INPUT_POSTANNOTATIONS = 'false';
process.env.INPUT_POSTTOCONVERSATION = 'false';
process.env.INPUT_PULLREQUESTAPPROVAL = 'false';
process.env.INPUT_SHOWBLOCKINGAFTER = 'true';
process.env.INPUT_TRUSTSTRATEGY = 'strict';

// mock before importing octokit
jest.spyOn(process.stdout, 'write').mockImplementation((): any => {});

import { octokit } from '../../src/github/octokit';
import { RequestError } from '@octokit/request-error';

describe('@octokit/action (using https_proxy)', () => {
  let proxyServer: http.Server;
  let proxyConnects: string[];

  beforeAll(async () => {
    // setup proxy server
    proxyServer = createProxy();
    const port = Number(proxyUrl.split(':')[2]);
    proxyServer.listen(port);

    proxyServer.on('connect', req => {
      proxyConnects.push(req.url ?? '');
    });
  });

  beforeEach(() => {
    proxyConnects = [];
  });

  afterAll(async () => {
    // Stop proxy server
    await new Promise<void>(resolve => {
      proxyServer.once('close', () => resolve());
      proxyServer.close();
    });

    if (originalhttpsProxyUrl) {
      process.env['https_proxy'] = originalhttpsProxyUrl;
    }
    if (originalhttpProxyUrl) {
      process.env['http_proxy'] = originalhttpProxyUrl;
    }
  });

  it('should return basic REST request, but not through the proxy', async () => {
    // setting no_proxy
    const originalNoProxy = process.env['no_proxy'];
    process.env['no_proxy'] = 'api.github.com';

    const branch = await octokit.rest.repos.getBranch({
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });

    // resetting no_proxy
    process.env['no_proxy'] = originalNoProxy;

    expect(branch.data.name).toBe('main');
    expect(proxyConnects).toHaveLength(0);
  });

  it('should return basic REST request through the proxy', async () => {
    const branch = await octokit.rest.repos.getBranch({
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });

    expect(branch.data.name).toBe('main');
    expect(proxyConnects).toEqual(['api.github.com:443']);
  });

  it('should return basic pagination request through the proxy', async () => {
    const branch = await octokit.paginate(octokit.rest.repos.listBranches, {
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });

    expect(branch.find(b => b.name === 'main')).toBeDefined();
    expect(proxyConnects).toEqual(['api.github.com:443']);
  });

  it('should return basic GraphQL request through the proxy', async () => {
    const repository = await octokit.graphql('{repository(owner:"tiobe", name:"tics-github-action"){name}}');

    expect(repository).toEqual({ repository: { name: 'tics-github-action' } });
    expect(proxyConnects).toEqual(['api.github.com:443']);
  });

  it('should retry 3 times on request through the proxy', async () => {
    proxyServer.on('request', req => {
      if (req.url?.startsWith('http')) {
        proxyConnects.push(req.url);
      }
    });

    const time = Date.now();
    let retryCount = 0;
    try {
      await octokit.request('/', {
        baseUrl: 'http://0.0.0.0:8081',
        request: {
          retries: 3, // for the purpose of testing, set a lower number of retries
          retryAfter: 1 // for the purpose of testing, set a lower timeout
        }
      });
    } catch (error: unknown) {
      retryCount = (error as RequestError).request.request?.retryCount;
    }

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(3);
    expect(proxyConnects).toContain('http://0.0.0.0:8081/');
    expect(proxyConnects).toHaveLength(4);
    expect(retryCount).toBe(3);
  }, 10000);
});
