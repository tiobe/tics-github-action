import { getBooleanInput, getInput, isDebug } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { HttpClient } from '@actions/http-client';
import { getTicsWebBaseUrlFromUrl } from './tics/api_helper';
import { EOL } from 'os';

export const githubConfig = {
  repo: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : '',
  owner: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '',
  branchname: process.env.GITHUB_HEAD_REF ? process.env.GITHUB_HEAD_REF : '',
  basebranchname: process.env.GITHUB_BASE_REF ? process.env.GITHUB_BASE_REF : '',
  branchdir: process.env.GITHUB_WORKSPACE ? process.env.GITHUB_WORKSPACE : '',
  commitSha: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : '',
  eventName: context.eventName,
  id: `${context.runId.toString()}-${process.env.GITHUB_RUN_ATTEMPT}`,
  runnerOS: process.env.RUNNER_OS ? process.env.RUNNER_OS : '',
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

export const ticsConfig = {
  githubToken: getInput('githubToken', { required: true }),
  projectName: getInput('projectName', { required: true }),
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  additionalFlags: getInput('additionalFlags'),
  branchDir: getInput('branchDir'),
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
  ticsAuthToken: getInput('ticsAuthToken'),
  tmpDir: getInput('tmpDir'),
  trustStrategy: getInput('trustStrategy'),
  secretsFilter: getSecretsFilter(getInput('secretsFilter')),
  viewerUrl: getInput('viewerUrl')
};

const ignoreSslError: boolean =
  ticsConfig.hostnameVerification === '0' ||
  ticsConfig.hostnameVerification === 'false' ||
  ticsConfig.trustStrategy === 'self-signed' ||
  ticsConfig.trustStrategy === 'all';

export const octokit = getOctokit(ticsConfig.githubToken, { request: { retries: 25 } }, require('@octokit/plugin-retry').retry);
export const httpClient = new HttpClient('tics-github-action', undefined, { allowRetries: true, maxRetries: 10, ignoreSslError: ignoreSslError });
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
