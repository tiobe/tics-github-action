import { getBooleanInput, getInput, isDebug } from '@actions/core';
import { getOctokit } from '@actions/github';
import ProxyAgent from 'proxy-agent';
import { readFileSync } from 'fs';
import { getTicsWebBaseUrlFromUrl } from './tics/api_helper';

const payload = process.env.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : '';
const pullRequestNumber = payload.pull_request ? payload.pull_request.number : '';

export const githubConfig = {
  repo: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : '',
  owner: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '',
  branchname: process.env.GITHUB_HEAD_REF ? process.env.GITHUB_HEAD_REF : '',
  basebranchname: process.env.GITHUB_BASE_REF ? process.env.GITHUB_BASE_REF : '',
  branchdir: process.env.GITHUB_WORKSPACE ? process.env.GITHUB_WORKSPACE : '',
  eventName: process.env.GITHUB_EVENT_NAME ? process.env.GITHUB_EVENT_NAME : '',
  runnerOS: process.env.RUNNER_OS ? process.env.RUNNER_OS : '',
  pullRequestNumber: process.env.PULL_REQUEST_NUMBER ? process.env.PULL_REQUEST_NUMBER : pullRequestNumber,
  debugger: isDebug()
};

export const ticsConfig = {
  githubToken: getInput('githubToken', { required: true }),
  projectName: getInput('projectName', { required: true }),
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  additionalFlags: getInput('additionalFlags'),
  branchDir: getInput('branchDir'),
  branchName: getInput('branchName'),
  calc: getInput('calc'),
  nocalc: getInput('nocalc'),
  recalc: getInput('recalc'),
  norecalc: getInput('norecalc'),
  clientData: getInput('clientData'),
  codetype: getInput('codetype'),
  hostnameVerification: getInput('hostnameVerification'),
  trustStrategy: getInput('trustStrategy'),
  excludeMovedFiles: getBooleanInput('excludeMovedFiles'),
  installTics: getBooleanInput('installTics'),
  postAnnotations: getBooleanInput('postAnnotations'),
  ticsAuthToken: getInput('ticsAuthToken'),
  tmpDir: getInput('tmpDir'),
  viewerUrl: getInput('viewerUrl')
};

export const octokit = getOctokit(ticsConfig.githubToken);
export const requestInit = { agent: new ProxyAgent(), headers: {} };
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
