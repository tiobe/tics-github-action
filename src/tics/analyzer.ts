import { exec } from '@actions/exec';
import { baseUrl, githubConfig, ticsConfig, viewerUrl } from '../configuration';
import Logger from '../helper/logger';
import { getInstallTicsApiUrl, httpRequest } from './api_helper';

let errorList: string[] = [];
let warningList: string[] = [];
let explorerUrl: string | undefined;
let statusCode: number;
let completed: boolean;

/**
 * Runs TiCS based on the configuration set in a workflow.
 * @param fileListPath Path to changedFiles.txt.
 */
export async function runTicsAnalyzer(fileListPath: string) {
  Logger.Instance.header(`Analyzing for project ${ticsConfig.projectName}`);

  const command = await buildRunCommand(fileListPath);

  Logger.Instance.header('Running TiCS');
  Logger.Instance.debug(`With command: ${command}`);
  try {
    statusCode = await exec(command, [], {
      silent: true,
      listeners: {
        stdout(data: Buffer) {
          let filtered = data.toString();
          filtered = Logger.Instance.maskSecrets(filtered);
          process.stdout.write(filtered);
          findInStdOutOrErr(filtered);
        },
        stderr(data: Buffer) {
          let filtered = data.toString();
          filtered = Logger.Instance.maskSecrets(filtered);
          process.stdout.write(filtered);
          findInStdOutOrErr(filtered);
        }
      }
    });
    completed = true;
  } catch (error: any) {
    Logger.Instance.debug(error.message);
    completed = false;
    statusCode = -1;
  } finally {
    return {
      completed: completed,
      statusCode: statusCode,
      explorerUrl: explorerUrl,
      errorList: errorList,
      warningList: warningList
    };
  }
}

/**
 * Build the command to run (and optionally install) TiCS.
 * @param fileListPath Path to changedFiles.txt.
 * @returns Command to run.
 */
async function buildRunCommand(fileListPath: string) {
  if (githubConfig.runnerOS === 'Linux') {
    return `/bin/bash -c "${await getInstallTics()} ${getTicsCommand(fileListPath)}"`;
  }
  return `powershell "${await getInstallTics()}; if ($?) {${getTicsCommand(fileListPath)}}"`;
}

/**
 * Get the command to install TiCS with.
 */
async function getInstallTics() {
  if (!ticsConfig.installTics) return '';

  const installTicsUrl = await retrieveInstallTics(githubConfig.runnerOS.toLowerCase());

  if (githubConfig.runnerOS === 'Linux') {
    let trustStrategy = '';
    if (ticsConfig.trustStrategy === 'self-signed' || ticsConfig.trustStrategy === 'all') {
      trustStrategy = '--insecure';
    }
    return `source <(curl --silent ${trustStrategy} '${installTicsUrl}') &&`;
  } else {
    // runnerOS is assumed to be Windows here
    let trustStrategy = '';
    if (ticsConfig.trustStrategy === 'self-signed' || ticsConfig.trustStrategy === 'all') {
      trustStrategy = '[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true};';
    }
    return `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; ${trustStrategy} iex ((New-Object System.Net.WebClient).DownloadString('${installTicsUrl}'))`;
  }
}

/**
 * Push warnings or errors to a list to summarize them on exit.
 * @param data stdout or stderr
 */
function findInStdOutOrErr(data: string) {
  const error = data.toString().match(/\[ERROR.*/g);
  if (error && !errorList.find(e => e === error?.toString())) errorList.push(error.toString());

  const warning = data.toString().match(/\[WARNING.*/g);
  if (warning && !warningList.find(w => w === warning?.toString())) warningList.push(warning.toString());

  const findExplorerUrl = data.match(/\/Explorer.*/g);
  if (!explorerUrl && findExplorerUrl) explorerUrl = viewerUrl + findExplorerUrl.slice(-1).pop();
}

/**
 * Retrieves the the TiCS install url from the ticsConfiguration.
 * @param os the OS the runner runs on.
 * @returns the TiCS install url.
 */
async function retrieveInstallTics(os: string) {
  try {
    Logger.Instance.info('Trying to retrieve configuration information from TiCS.');

    const ticsInstallApiBaseUrl = getInstallTicsApiUrl(baseUrl, os);

    const data = await httpRequest(ticsInstallApiBaseUrl);

    return baseUrl + '/' + data.links.installTics;
  } catch (error: any) {
    Logger.Instance.exit(`An error occurred when trying to retrieve configuration information: ${error.message}`);
  }
}

/**
 * Builds the TiCS calculate command based on the fileListPath and the ticsConfig set.
 * @param fileListPath
 * @returns string of the command to run TiCS.
 */
function getTicsCommand(fileListPath: string) {
  let execString = 'TICS -ide github ';
  if (ticsConfig.mode === 'diagnostic') {
    execString += '-version ';
  } else {
    execString += `@${fileListPath} -viewer `;
    execString += `-project '${ticsConfig.projectName}' `;
    execString += `-calc ${ticsConfig.calc} `;
    execString += ticsConfig.nocalc ? `-nocalc ${ticsConfig.nocalc} ` : '';
    execString += ticsConfig.recalc ? `-recalc ${ticsConfig.recalc} ` : '';
    execString += ticsConfig.norecalc ? `-norecalc ${ticsConfig.norecalc} ` : '';
    execString += ticsConfig.codetype ? `-codetype ${ticsConfig.codetype} ` : '';
    execString += ticsConfig.clientData ? `-cdtoken ${ticsConfig.clientData} ` : '';
    execString += ticsConfig.tmpDir ? `-tmpdir '${ticsConfig.tmpDir}' ` : '';
  }
  execString += ticsConfig.additionalFlags ? ticsConfig.additionalFlags : '';
  // Add TICS debug flag when in debug mode, if this flag was not already set.
  execString += githubConfig.debugger && !execString.includes('-log ') ? ' -log 9' : '';

  return execString;
}
