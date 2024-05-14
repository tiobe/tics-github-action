import { TicsConfiguration } from './tics';
import { TicsCli } from './tics-cli';
import { ActionConfiguration } from './action';
import { GithubConfig } from './github';

export const actionConfig = new ActionConfiguration();
export const githubConfig = new GithubConfig();

export const ticsConfig = new TicsConfiguration();
export const ticsCli = new TicsCli(ticsConfig.mode);
