import * as http from 'http';
import { createProxy } from 'proxy';

// Default values are set when the module is imported, so we need to set proxy first.
// Running these tests with https_proxy
const proxyUrl = 'http://127.0.0.1:8081';
const originalProxyUrl = process.env['https_proxy'];
process.env['https_proxy'] = proxyUrl;

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
import { octokit } from '../../src/configuration';
import { RequestError } from '@octokit/request-error';
import { Octokit, customFetch } from '@octokit/action';
import { retry } from '@octokit/plugin-retry';

describe('@octokit/action (using https_proxy)', () => {
  let proxyServer: http.Server;
  let requestCount = 0;
  let proxyConnects: string[];

  beforeAll(async () => {
    // setup proxy server
    proxyServer = createProxy();
    await new Promise<void>(resolve => {
      const port = Number(proxyUrl.split(':')[2]);
      proxyServer.listen(port, () => resolve());
    });

    proxyServer.on('connect', req => {
      requestCount++;
      proxyConnects.push(req.url ?? '');
    });
  });

  beforeEach(() => {
    proxyConnects = [];
    requestCount = 0;
  });

  afterAll(async () => {
    // Stop proxy server
    await new Promise<void>(resolve => {
      proxyServer.once('close', () => resolve());
      proxyServer.close();
    });

    if (originalProxyUrl) {
      process.env['https_proxy'] = originalProxyUrl;
    }
  });

  test('Should return basic REST request with proxy', async () => {
    const branch = await octokit.rest.repos.getBranch({
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });
    expect(branch.data.name).toEqual('main');
    expect(proxyConnects).toEqual(['api.github.com:443']);
    expect(requestCount).toEqual(1);
  });

  test('Should return basic pagination request with proxy', async () => {
    const branch = await octokit.paginate(octokit.rest.repos.listBranches, {
      owner: 'tiobe',
      repo: 'tics-github-action',
      branch: 'main'
    });
    expect(branch.find(b => b.name === 'main')).not.toBeUndefined();
    expect(proxyConnects).toEqual(['api.github.com:443']);
    expect(requestCount).toEqual(1);
  });

  test('Should return basic GraphQL request with proxy', async () => {
    const repository = await octokit.graphql('{repository(owner:"tiobe", name:"tics-github-action"){name}}');
    expect(repository).toEqual({ repository: { name: 'tics-github-action' } });
    expect(proxyConnects).toEqual(['api.github.com:443']);
    expect(requestCount).toEqual(1);
  });

  test('Should retry when request url is unavailable', async () => {
    const time = Date.now();
    let retryCount = 0;
    try {
      const octokit = new (Octokit.plugin(retry))({
        request: {
          fetch: customFetch,
          retries: 3, // for the purpose of testing, set a lower number of retries
          retryAfter: 1 // for the purpose of testing, set a lower timeout
        }
      });

      await octokit.request('/', {
        owner: 'tiobe',
        repo: 'tics-github-action',
        branch: 'main'
      });
    } catch (error: unknown) {
      retryCount = (error as RequestError).request.request?.retryCount;
    }

    expect((Date.now() - time) / 1000).toBeGreaterThanOrEqual(3);
    expect(retryCount).toEqual(3);
    expect(requestCount).toEqual(4);
  }, 10000);
});
