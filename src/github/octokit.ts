import { OctokitOptions } from '@octokit/core/dist-types/types';
import { getOctokit } from '@actions/github';
import { retry } from '@octokit/plugin-retry';
import { ProxyAgent } from 'proxy-agent';
import fetch from 'node-fetch';

import { githubConfig, actionConfig, ticsConfig } from '../configuration/config';

const octokitOptions: OctokitOptions = {
  baseUrl: githubConfig.apiUrl,
  request: {
    // Custom fetch to support proxy
    fetch: (url: string, options: fetch.RequestInit) => {
      return fetch(url, {
        ...options,
        agent: new ProxyAgent()
      });
    },
    retries: actionConfig.retryConfig.maxRetries,
    retryAfter: actionConfig.retryConfig.delay
  }
};

export const octokit = getOctokit(ticsConfig.githubToken, octokitOptions, retry);
