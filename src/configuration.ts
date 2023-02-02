import { getBooleanInput, getInput } from '@actions/core';
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
  pullRequestNumber: process.env.PULL_REQUEST_NUMBER ? process.env.PULL_REQUEST_NUMBER : pullRequestNumber
};

export const ticsConfig = {
  projectName: getInput('projectName', { required: true }),
  branchName: getInput('branchName'),
  branchDir: getInput('branchDir'),
  calc: getInput('calc'),
  clientData: getInput('clientData'),
  additionalFlags: getInput('additionalFlags'),
  installTics: getBooleanInput('installTics'),
  logLevel: getInput('logLevel'),
  postAnnotations: getBooleanInput('postAnnotations'),
  ticsAuthToken: getInput('ticsAuthToken'),
  githubToken: getInput('githubToken', { required: true }),
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  tmpDir: getInput('tmpDir'),
  viewerUrl: getInput('viewerUrl'),
  hostnameVerification: getInput('hostnameVerification'),
  trustStrategy: getInput('trustStrategy')
};

export const octokit = getOctokit(ticsConfig.githubToken);
export const requestInit = { agent: new ProxyAgent(), headers: {} };
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
