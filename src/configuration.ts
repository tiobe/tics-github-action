import { getBooleanInput, getInput, info } from '@actions/core';
import { getOctokit } from '@actions/github';
import { HttpClient } from '@actions/http-client';
import { readFileSync } from 'fs';
import { RequestOptions } from 'https';
import ProxyAgent from 'proxy-agent';
import { getTicsWebBaseUrlFromUrl } from './tics/api_helper';

const payload = process.env.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')) : '';
const pullRequestNumber = payload.pull_request ? payload.pull_request.number : '';

export let githubConfig = {
  repo: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY : '',
  owner: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY?.split('/')[1] : '',
  branchname: process.env.GITHUB_HEAD_REF ? process.env.GITHUB_HEAD_REF : '',
  basebranchname: process.env.GITHUB_BASE_REF ? process.env.GITHUB_BASE_REF : '',
  branchdir: process.env.GITHUB_WORKSPACE ? process.env.GITHUB_WORKSPACE : '',
  eventName: process.env.GITHUB_EVENT_NAME ? process.env.GITHUB_EVENT_NAME : '',
  runnerOS: process.env.RUNNER_OS ? process.env.RUNNER_OS : '',
  githubToken: process.env.GITHUB_TOKEN ? process.env.GITHUB_TOKEN : '',
  pullRequestNumber: process.env.PULL_REQUEST_NUMBER ? process.env.PULL_REQUEST_NUMBER : pullRequestNumber
};

function getHostnameVerification() {
  let hostnameVerification;
  switch (process.env.TICSHOSTNAMEVERIFICATION) {
    case '0':
    case 'false':
      hostnameVerification = false;
      info('Hostname Verification disabled');
      break;
    default:
      hostnameVerification = true;
      break;
  }
  return hostnameVerification;
}

export let ticsConfig = {
  projectName: getInput('projectName', { required: true }),
  branchName: getInput('branchName'),
  branchDir: getInput('branchDir'),
  calc: getInput('calc'),
  clientData: getInput('clientData'),
  additionalFlags: getInput('additionalFlags'),
  hostnameVerification: getHostnameVerification(),
  installTics: getBooleanInput('installTics'),
  logLevel: getInput('logLevel') ? getInput('logLevel').toLowerCase() : 'default',
  postAnnotations: getInput('postAnnotations') ? getBooleanInput('postAnnotations') : true,
  ticsAuthToken: getInput('ticsAuthToken') ? getInput('ticsAuthToken') : process.env.TICSAUTHTOKEN,
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  tmpDir: getInput('tmpDir'),
  viewerUrl: getInput('viewerUrl')
};

const httpClientOptions: RequestOptions = { rejectUnauthorized: ticsConfig.hostnameVerification, agent: new ProxyAgent() };

export const octokit = getOctokit(githubConfig.githubToken, { request: { agent: new ProxyAgent() } });
export const httpClient = new HttpClient('http-client', [], httpClientOptions);
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
