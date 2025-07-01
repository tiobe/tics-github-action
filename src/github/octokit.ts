import { OctokitOptions } from '@octokit/core/dist-types/types';
import { getOctokitOptions, GitHub } from '@actions/github/lib/utils';
import { paginateGraphql } from '@octokit/plugin-paginate-graphql';
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

// Recreate getOctokit() from '@actions/github' to get the correct typing
const GitHubWithPlugins = GitHub.plugin(paginateGraphql, retry);
export const octokit = new GitHubWithPlugins(getOctokitOptions(ticsConfig.githubToken, octokitOptions));
