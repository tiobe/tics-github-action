import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import * as http from 'http';
import { createProxy } from 'proxy';
import { RequestError } from '@octokit/request-error';

describe('@octokit/action (using https_proxy)', () => {
  let proxyUrl: string | undefined;
  let proxyServer: http.Server;
  let proxyConnects: string[];
  let octokit: any; // We will import this dynamically

  beforeAll(async () => {
    // 3. Setup proxy server
    proxyServer = createProxy();
    proxyServer.listen(0);

    proxyUrl = 'http://127.0.0.1:' + (proxyServer.address() as any).port;

    // 1. Setup environment variables BEFORE importing octokit/config
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

    proxyServer.on('connect', req => {
      proxyConnects.push(req.url ?? '');
    });

    // 4. Dynamic Import: This ensures config.ts reads the stubbed envs above
    const module = await import('../../src/github/octokit.js');
    octokit = module.octokit;
  });

  beforeEach(() => {
    proxyConnects = [];
  });

  afterAll(async () => {
    vi.unstubAllEnvs();
    await new Promise<void>(resolve => {
      proxyServer.once('close', () => resolve());
      proxyServer.close();
    });
  });

  it('should return basic REST request, but not through the proxy', async () => {
    vi.stubEnv('no_proxy', 'api.github.com');

    const branch = await octokit.rest.repos.getBranch({
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });
    expect(branch.data.name).toBe('main');

    vi.stubEnv('no_proxy', '');

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
      repo: 'tics-github-action'
    });

    expect(branch.find((b: any) => b.name === 'main')).toBeDefined();
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
        baseUrl: proxyUrl,
        request: {
          retries: 3,
          retryAfter: 1
        }
      });
    } catch (error: unknown) {
      retryCount = (error as RequestError).request.request?.retryCount;
    }

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(3);
    expect(proxyConnects).toContain(`${proxyUrl}/`);
    expect(proxyConnects).toHaveLength(4);
    expect(retryCount).toBe(3);
  }, 10000);
});
