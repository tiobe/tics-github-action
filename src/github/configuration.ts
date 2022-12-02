import { getInput, info } from '@actions/core';
import { getOctokit } from '@actions/github';
import { readFileSync } from 'fs';
import ProxyAgent from 'proxy-agent';

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
  branchDir: getInput('branchDir'),
  branchName: getInput('branchName'),
  tmpDir: getInput('tmpDir'),
  calc: getInput('calc'),
  viewerUrl: getInput('ticsViewerUrl') ? getInput('ticsViewerUrl') : '',
  clientToken: getInput('clientToken'),
  ticsAuthToken: getInput('ticsAuthToken') ? getInput('ticsAuthToken') : processEnv.TICSAUTHTOKEN,
  installTics: getInput('installTics') === 'true' ? true : false,
  ticsConfiguration: getInput('ticsConfiguration'),
  extendTics: getInput('extendTics'),
  showAnnotations: getInput('showAnnotations') ? getInput('showAnnotations') : true,
  hostnameVerification: getHostnameVerification(),
  logLevel: getInput('logLevel') ? getInput('logLevel') : 'default'
};

export const octokit = getOctokit(githubConfig.githubToken, { request: { agent: new ProxyAgent() } });
