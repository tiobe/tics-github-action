import { isDebug } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { OctokitOptions } from '@octokit/core/dist-types/types';
import HttpClient from '@tiobe/http-client';
import { ProxyAgent } from 'proxy-agent';
import { getBaseUrl } from '@tiobe/install-tics';
import { ActionConfiguration } from './action/action_configuration';

export const githubConfig = {
  apiUrl: context.apiUrl,
  owner: context.repo.owner,
  reponame: context.repo.repo,
  commitSha: context.sha,
  eventName: context.eventName,
  id: `${context.runId.toString()}-${context.runNumber.toString()}`,
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

export const ticsConfig = new ActionConfiguration();

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
  baseUrl: githubConfig.apiUrl,
  request: {
    agent: new ProxyAgent(),
    retries: retryConfig.maxRetries,
    retryAfter: retryConfig.delay
  }
};

function getViewerUrl(): string {
  if (ticsConfig.viewerUrl) {
    return ticsConfig.viewerUrl.endsWith('/') ? ticsConfig.viewerUrl.slice(0, -1) : ticsConfig.viewerUrl;
  } else {
    return baseUrl;
  }
}

export const octokit = getOctokit(ticsConfig.githubToken, octokitOptions, retry);
export const baseUrl = getBaseUrl(ticsConfig.ticsConfiguration).href;
export const viewerUrl = getViewerUrl();
