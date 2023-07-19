import { getBooleanInput, getInput, isDebug } from '@actions/core';
import * as github from '@actions/github';
import { ProxyAgent } from 'proxy-agent';
import { getTicsWebBaseUrlFromUrl } from './tics/api_helper';
import { EOL } from 'os';

export const githubConfig = {
  repo: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : '',
  owner: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '',
  branchname: process.env.GITHUB_HEAD_REF ? process.env.GITHUB_HEAD_REF : '',
  basebranchname: process.env.GITHUB_BASE_REF ? process.env.GITHUB_BASE_REF : '',
  branchdir: process.env.GITHUB_WORKSPACE ? process.env.GITHUB_WORKSPACE : '',
  eventName: process.env.GITHUB_EVENT_NAME ? process.env.GITHUB_EVENT_NAME : '',
  commitSha: process.env.GITHUB_SHA ? process.env.GITHUB_SHA : '',
  runnerOS: process.env.RUNNER_OS ? process.env.RUNNER_OS : '',
  pullRequestNumber: getPullRequestNumber(),
  debugger: isDebug()
};

function getPullRequestNumber() {
  if (github.context.payload.pull_request) {
    return github.context.payload.pull_request.number;
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

export const octokit = github.getOctokit(ticsConfig.githubToken);
export const requestInit = { agent: new ProxyAgent(), headers: {} };
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
