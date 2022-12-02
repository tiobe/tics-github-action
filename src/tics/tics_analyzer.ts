import { exec } from '@actions/exec';
import { githubConfig, ticsConfig } from '../github/configuration';
import Logger from '../helper/logger';
import { getInstallTiCSApiUrl, getTiCSWebBaseUrlFromUrl, httpRequest } from './api_helper';

let errorList: string[] = [];
let warningList: string[] = [];

export async function runTiCSAnalyzer(fileListPath: string) {
  Logger.Instance.header(`Analyzing new pull request for project ${ticsConfig.projectName}.`);

  const command = await buildRunCommand(fileListPath);

  Logger.Instance.header('Running TiCS');
  await exec(command, [], {
    silent: true,
    listeners: {
      stdout(data: Buffer) {
        Logger.Instance.info(data.toString());
        findWarningOrError(data.toString());
      },
      stderr(data: Buffer) {
        Logger.Instance.info(data.toString());
        findWarningOrError(data.toString());
      }
    }
  });

  if (errorList.length > 0) errorList.forEach(e => Logger.Instance.error(e));
  if (warningList.length > 0) warningList.forEach(w => Logger.Instance.warning(w));
}

/**
 * Build the command to run (and optionally install) TiCS.
 * @param fileListPath Path to changeSet.txt.
 * @returns Command to run.
 */
async function buildRunCommand(fileListPath: string) {
  if (githubConfig.runnerOS === 'Linux') {
    return `/bin/bash -c "${await getInstallTiCS()} ${getTiCSCommand(fileListPath)}"`;
  }
  return `powershell "${await getInstallTiCS()} ${getTiCSCommand(fileListPath)}"`;
}

/**
 * Get the command to install TiCS with.
 */
async function getInstallTiCS() {
  if (!ticsConfig.installTics) return '';

  const installTicsUrl = await retrieveInstallTics(ticsConfig.ticsConfiguration, githubConfig.runnerOS.toLowerCase());

  if (githubConfig.runnerOS === 'Linux') {
    return `source <(curl -s '${installTicsUrl}') &&`;
  }
  return `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString("${installTicsUrl}")) &&`;
}

/**
 * Push warnings or errors to a list to summarize them on exit.
 * @param data stdout or stderr
 */
function findWarningOrError(data: string) {
  let error = data.toString().match(/\[ERROR.*/g);
  if (error) errorList.push(error.toString());

  let warning = data.toString().match(/\[WARNING.*/g);
  if (warning) warningList.push(warning.toString());
}

/**
 * Retrieves the the TiCS install url from the ticsConfiguration.
 * @param url url given in the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TiCS install url.
 */
async function retrieveInstallTics(url: string, os: string) {
  try {
    Logger.Instance.info('Trying to retrieve configuration information from TiCS.');

    const ticsWebBaseUrl = getTiCSWebBaseUrlFromUrl(url);
    const ticsInstallApiBaseUrl = getInstallTiCSApiUrl(ticsWebBaseUrl, os);

    const data = await httpRequest(ticsInstallApiBaseUrl);

    return ticsWebBaseUrl + data.links.installTics;
  } catch (error: any) {
    Logger.Instance.exit(`An error occurred when trying to retrieve configuration information: ${error.message}`);
  }
}

/**
 * Builds the TiCS calculate command based on the fileListPath and the ticsConfig set.
 * @param fileListPath
 * @returns string of the command to run TiCS.
 */
function getTiCSCommand(fileListPath: string) {
  let execString = 'TICS @' + fileListPath + ' ';
  execString += ticsConfig.calc.includes('GATE') ? '' : '-viewer ';
  execString += ticsConfig.calc ? `-calc ${ticsConfig.calc} ` : '-recalc GATE ';
  execString += ticsConfig.projectName ? `-project ${ticsConfig.projectName} ` : '';
  execString += ticsConfig.clientToken ? `-cdtoken ${ticsConfig.clientToken} ` : '';
  execString += ticsConfig.tmpDir ? `-tmpdir ${ticsConfig.tmpDir} ` : '';
  execString += ticsConfig.extendTics ? ticsConfig.extendTics : '';
  return execString;
}
