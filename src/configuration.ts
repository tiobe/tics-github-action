import { getBooleanInput, getInput, isDebug } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import HttpClient from '@tiobe/http-client';
import { ProxyAgent } from 'proxy-agent';
import { EOL } from 'os';
import { getBaseUrl } from '@tiobe/install-tics';
import { randomBytes } from 'crypto';

export const githubConfig = {
  baseUrl: process.env.GITHUB_API_URL ? process.env.GITHUB_API_URL : 'https://api.github.com',
  repo: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : '',
  owner: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '',
  branchname: process.env.GITHUB_HEAD_REF ? process.env.GITHUB_HEAD_REF : '',
  basebranchname: process.env.GITHUB_BASE_REF ? process.env.GITHUB_BASE_REF : '',
  commitSha: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : '',
  eventName: context.eventName,
  id: `${context.runId.toString()}-${process.env.GITHUB_RUN_ATTEMPT || randomBytes(4).toString('hex')}`,
  pullRequestNumber: getPullRequestNumber(),
  debugger: isDebug()
};

function getPullRequestNumber() {
  if (context.payload.pull_request) {
    return context.payload.pull_request.number;
  } else if (process.env.PULL_REQUEST_NUMBER) {
    return parseInt(process.env.PULL_REQUEST_NUMBER);
  } else {
    return 0;
  }
}

function getSecretsFilter(secretsFilter: string | undefined) {
  const defaults = ['TICSAUTHTOKEN', 'GITHUB_TOKEN', 'Authentication token'];
  const keys = secretsFilter ? secretsFilter.split(',').filter(s => s !== '') : [];

  const combinedFilters = defaults.concat(keys);
  if (githubConfig.debugger) process.stdout.write(`::debug::SecretsFilter: ${JSON.stringify(combinedFilters) + EOL}`);

  return combinedFilters;
}

function getRetryCodes(retryCodes?: string): number[] {
  if (!retryCodes) {
    return [419, 500, 501, 502, 503, 504];
  }
  return retryCodes.split(',').map(r => Number(r));
}

export const ticsConfig = {
  projectName: getInput('projectName', { required: true }),
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  githubToken: getInput('githubToken') || process.env.GITHUB_TOKEN || '',
  additionalFlags: getInput('additionalFlags'),
  branchName: getInput('branchName'),
  clientData: getInput('clientData'),
  codetype: getInput('codetype'),
  calc: getInput('calc'),
  excludeMovedFiles: getBooleanInput('excludeMovedFiles'),
  filelist: getInput('filelist'),
  hostnameVerification: getInput('hostnameVerification'),
  installTics: getBooleanInput('installTics'),
  mode: getInput('mode'),
  nocalc: getInput('nocalc'),
  norecalc: getInput('norecalc'),
  postAnnotations: getBooleanInput('postAnnotations'),
  postToConversation: getBooleanInput('postToConversation'),
  pullRequestApproval: getBooleanInput('pullRequestApproval'),
  recalc: getInput('recalc'),
  retryCodes: getRetryCodes(getInput('retryCodes')),
  ticsAuthToken: getInput('ticsAuthToken'),
  tmpDir: getInput('tmpDir'),
  trustStrategy: getInput('trustStrategy'),
  secretsFilter: getSecretsFilter(getInput('secretsFilter')),
  showBlockingAfter: getBooleanInput('showBlockingAfter'),
  viewerUrl: getInput('viewerUrl')
};

const retryConfig = {
  maxRetries: 10,
  delay: 5
};

export const httpClient = new HttpClient(
  true,
  {
    authToken: ticsConfig.ticsAuthToken,
    xRequestWithTics: true,
    retry: {
      retries: retryConfig.maxRetries,
      retryDelay: retryConfig.delay * 1000,
      retryOn: ticsConfig.retryCodes
    }
  },
  new ProxyAgent()
);

const octokitOptions: OctokitOptions = {
  baseUrl: githubConfig.baseUrl,
  request: {
    agent: new ProxyAgent(),
    retries: retryConfig.maxRetries,
    retryAfter: retryConfig.delay
  }
};

console.log(process.env);

export const octokit = getOctokit(ticsConfig.githubToken, octokitOptions, retry);
export const baseUrl = getBaseUrl(ticsConfig.ticsConfiguration).href;
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
