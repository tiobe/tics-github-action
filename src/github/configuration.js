import core from '@actions/core';
import fs from 'fs';

let processEnv = process.env;
const payload = JSON.parse(fs.readFileSync(processEnv.GITHUB_EVENT_PATH, 'utf8'));
const pullRequestNumber = payload.pull_request ? payload.pull_request.number : '';


export let githubConfig = {
  repo: processEnv.GITHUB_REPOSITORY,
  owner: processEnv.GITHUB_REPOSITORY.split('/')[0],
  reponame: processEnv.GITHUB_REPOSITORY.split('/')[1],
  branchname: processEnv.GITHUB_HEAD_REF,
  basebranchname: processEnv.GITHUB_BASE_REF,
  branchdir: processEnv.GITHUB_WORKSPACE,
  eventName: processEnv.GITHUB_EVENT_NAME,
  runnerOS: processEnv.RUNNER_OS,
  pullRequestNumber: processEnv.PULL_NR ? processEnv.PULL_NR : pullRequestNumber
};

function getHostnameVerification() {
  let hostnameVerification;
  switch (processEnv.TICSHOSTNAMEVERIFICATION) {
    case '0':
    case 'false':
      hostnameVerification = false;
      core.info('Hostname Verification disabled');
      break;
    default:
      hostnameVerification = true;
      break;
  }
  return hostnameVerification;
}

export let ticsConfig = {
  projectName: core.getInput('projectName', { required: true }),
  branchName: core.getInput('branchName'),
  branchDir: core.getInput('branchDir', { required: false }),
  tmpDir: core.getInput('tmpDir'),
  calc: core.getInput('calc'),
  viewerUrl: core.getInput('ticsViewerUrl') ? core.getInput('ticsViewerUrl') : '',
  clientToken: core.getInput('clientToken'),
  ticsAuthToken: core.getInput('ticsAuthToken') ? core.getInput('ticsAuthToken') : processEnv.TICSAUTHTOKEN,
  installTics: core.getInput('installTics'),
  ticsConfiguration: core.getInput('ticsConfiguration'),
  extendTics: core.getInput('extendTics'),
  showAnnotations: core.getInput('showAnnotations') ? core.getInput('showAnnotations') : false,
  hostnameVerification: getHostnameVerification()
};