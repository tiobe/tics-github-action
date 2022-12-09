import { getInput, info } from '@actions/core';
import { Octokit } from '@octokit/rest';
import { readFileSync } from 'fs';
import ProxyAgent from 'proxy-agent';
import { getTicsWebBaseUrlFromUrl } from '../tics/api_helper';

let processEnv = process.env;
const payload = processEnv.GITHUB_EVENT_PATH ? JSON.parse(readFileSync(processEnv.GITHUB_EVENT_PATH, 'utf8')) : '';
const pullRequestNumber = payload.pull_request ? payload.pull_request.number : '';

export let githubConfig = {
  repo: processEnv.GITHUB_REPOSITORY ? processEnv.GITHUB_REPOSITORY : '',
  owner: processEnv.GITHUB_REPOSITORY ? processEnv.GITHUB_REPOSITORY.split('/')[0] : '',
  reponame: processEnv.GITHUB_REPOSITORY ? processEnv.GITHUB_REPOSITORY?.split('/')[1] : '',
  branchname: processEnv.GITHUB_HEAD_REF ? processEnv.GITHUB_HEAD_REF : '',
  basebranchname: processEnv.GITHUB_BASE_REF ? processEnv.GITHUB_BASE_REF : '',
  branchdir: processEnv.GITHUB_WORKSPACE ? processEnv.GITHUB_WORKSPACE : '',
  eventName: processEnv.GITHUB_EVENT_NAME ? processEnv.GITHUB_EVENT_NAME : '',
  runnerOS: processEnv.RUNNER_OS ? processEnv.RUNNER_OS : '',
  githubToken: processEnv.GITHUB_TOKEN ? processEnv.GITHUB_TOKEN : '',
  pullRequestNumber: processEnv.PULL_REQUEST_NUMBER ? processEnv.PULL_REQUEST_NUMBER : pullRequestNumber
};

function getHostnameVerification() {
  let hostnameVerification;
  switch (processEnv.TICSHOSTNAMEVERIFICATION) {
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
  calc: getInput('calc') ? getInput('calc') : 'GATE',
  clientToken: getInput('clientToken'),
  extendTics: getInput('extendTics'),
  hostnameVerification: getHostnameVerification(),
  installTics: getInput('installTics') === 'true' ? true : false,
  logLevel: getInput('logLevel') ? getInput('logLevel').toLowerCase() : 'debug',
  postAnnotations: getInput('postAnnotations') ? getInput('postAnnotations') : true,
  ticsAuthToken: getInput('ticsAuthToken') ? getInput('ticsAuthToken') : processEnv.TICSAUTHTOKEN,
  ticsConfiguration: getInput('ticsConfiguration', { required: true }),
  tmpDir: getInput('tmpDir'),
  viewerUrl: getInput('viewerUrl')
};

export const octokit = new Octokit({ auth: githubConfig.githubToken, request: { agent: new ProxyAgent() } });
export const baseUrl = getTicsWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
export const viewerUrl = ticsConfig.viewerUrl ? ticsConfig.viewerUrl.replace(/\/+$/, '') : baseUrl;
