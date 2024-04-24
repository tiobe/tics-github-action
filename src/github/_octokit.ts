import { OctokitOptions } from '@octokit/core/dist-types/types';
import { getOctokit } from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { ProxyAgent } from 'proxy-agent';

import { githubConfig, actionConfig, ticsConfig } from '../configuration/_config';

const octokitOptions: OctokitOptions = {
  baseUrl: githubConfig.apiUrl,
  request: {
    agent: new ProxyAgent(),
    retries: actionConfig.retryConfig.maxRetries,
    retryAfter: actionConfig.retryConfig.delay
  }
};

export const octokit = getOctokit(ticsConfig.githubToken, octokitOptions, retry);
