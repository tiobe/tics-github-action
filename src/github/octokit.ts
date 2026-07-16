import { Octokit, OctokitOptions } from '@octokit/core';
import { paginateGraphQL } from '@octokit/plugin-paginate-graphql';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';
import { retry } from '@octokit/plugin-retry';
import fetch from 'node-fetch';
import { ProxyAgent } from 'proxy-agent';
import { actionConfig, githubConfig, ticsConfig } from '../configuration/config.js';

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

// Function copied from '@actions/github' (not possible to import due to ESM)
function getOctokitOptions(token: string, options: OctokitOptions): OctokitOptions {
  if (!token && !options.auth) {
    throw new Error('Parameter token or opts.auth is required');
  } else if (token && options.auth) {
    throw new Error('Parameters token and opts.auth may not both be specified');
  }

  const opts = Object.assign({}, options);
  const auth = typeof options.auth === 'string' ? options.auth : `token ${token}`;
  if (auth) {
    opts.auth = auth;
  }
  return opts;
}

// Recreate getOctokit() from '@actions/github' to get the correct typing
export const GitHubWithPlugins = Octokit.plugin(restEndpointMethods, paginateRest, paginateGraphQL, retry);
export const octokit = new GitHubWithPlugins(getOctokitOptions(ticsConfig.githubToken, octokitOptions));
