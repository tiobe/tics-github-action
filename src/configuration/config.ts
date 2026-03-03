import { TicsConfiguration } from './tics.js';
import { TicsCli } from './tics-cli.js';
import { ActionConfiguration } from './action.js';
import { GithubConfig } from './github.js';

export const actionConfig = new ActionConfiguration();
export const githubConfig = new GithubConfig();

export const ticsConfig = new TicsConfiguration();
export const ticsCli = new TicsCli(ticsConfig.mode);
