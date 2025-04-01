import { exec } from '@actions/exec';
import { logger } from '../helper/logger';
import { Analysis } from '../helper/interfaces';
import { getTmpDir } from '../github/artifacts';
import { InstallTics } from '@tiobe/install-tics';
import { platform } from 'os';
import { isOneOf } from '../helper/utils';
import { joinUrl } from '../helper/url';
import { githubConfig, ticsCli, ticsConfig } from '../configuration/config';
import { httpClient } from '../viewer/http-client';
import { Mode } from '../configuration/tics';
import { CliOptions, TicsCli } from '../configuration/tics-cli';

const errorList: string[] = [];
const warningList: string[] = [];
const explorerUrls: string[] = [];
let statusCode: number;
let completed: boolean;

/**
 * Runs TICS based on the configuration set in a workflow.
 * @param fileListPath Path to changedFiles.txt.
 */
export async function runTicsAnalyzer(fileListPath: string): Promise<Analysis> {
  logger.header(`Analyzing for project ${ticsCli.project}`);

  const command = await buildRunCommand(fileListPath);

  logger.header('Running TICS');
  logger.debug(`With command: ${command}`);
  try {
    statusCode = await exec(command, [], {
      silent: true,
      listeners: {
        stdline(data: string) {
          const filtered = logger.maskOutput(data);
          if (filtered) {
            process.stdout.write(filtered);
            findInStdOutOrErr(filtered);
          }
        },
        errline(data: string) {
          const filtered = logger.maskOutput(data);
          if (filtered) {
            process.stdout.write(filtered);
            findInStdOutOrErr(filtered);
          }
        }
      }
    });
    completed = true;
  } catch (error: unknown) {
    if (error instanceof Error) logger.debug(error.message);
    completed = false;
    statusCode = -1;
  }

  logger.info(`TICS closed with code ${statusCode.toString()}`);
  return {
    completed: completed,
    statusCode: statusCode,
    explorerUrls: explorerUrls,
    errorList: errorList,
    warningList: warningList
  };
}

/**
 * Build the command to run (and optionally install) TICS.
 * @param fileListPath Path to changedFiles.txt.
 * @returns Command to run.
 */
async function buildRunCommand(fileListPath: string): Promise<string> {
  const installTics = new InstallTics(true, httpClient);

  let installCommand = '';
  if (ticsConfig.installTics) {
    installCommand = await installTics.getInstallCommand(ticsConfig.viewerUrl);

    if (platform() === 'linux') {
      installCommand += ' &&';
    }
  } else if (platform() === 'linux') {
    installCommand = `TICS='${ticsConfig.viewerUrl}';`;
  } else {
    installCommand = `$env:TICS='${ticsConfig.viewerUrl}'`;
  }

  if (platform() === 'linux') {
    return `/bin/bash -c "${installCommand} ${getTicsCommand(fileListPath)}"`;
  }
  return `powershell "${installCommand}; if ($?) {${getTicsCommand(fileListPath)}}"`;
}

/**
 * Push warnings or errors to a list to summarize them on exit.
 * @param data stdout or stderr
 */
function findInStdOutOrErr(data: string): void {
  const error = data.match(/\[ERROR.*/g)?.toString();
  if (error && !errorList.find(e => e === error)) {
    errorList.push(error);
  }

  const warning = data.match(/\[WARNING.*/g)?.toString();
  if (warning && !warningList.find(w => w === warning)) {
    warningList.push(warning);
  }

  const noFilesToAnalyze = data.match(/No files to analyze with option '-changed':/g);
  if (noFilesToAnalyze) {
    warningList.push(`[WARNING 5057] ${data}`);
  }

  const findExplorerUrl = data.match(/\/Explorer.*/g);
  if (findExplorerUrl) {
    const urlPath = findExplorerUrl.slice(-1).pop();
    if (urlPath) {
      explorerUrls.push(joinUrl(ticsConfig.displayUrl, urlPath));
    }
  }
}

/**
 * Builds the TICS calculate command based on the fileListPath and the ticsConfig set.
 * @param fileListPath
 * @returns string of the command to run TICS.
 */
export function getTicsCommand(fileListPath: string): string {
  let command: string[] = [];

  switch (ticsConfig.mode) {
    case Mode.DIAGNOSTIC:
      command.push('TICS -ide github -help');
      break;
    case Mode.CLIENT:
      command.push('TICS -ide github');
      command.push(fileListPath === '.' ? '. -viewer' : `'@${fileListPath}' -viewer`);
      command = [...command, ...getCliOptionsForCommand()];
      break;
    case Mode.QSERVER:
      command.push('TICSQServer');
      command = [...command, ...getCliOptionsForCommand()];
      break;
  }

  if (ticsCli.tmpdir || githubConfig.debugger) {
    command.push(`-tmpdir '${getTmpDir()}'`);
  }

  if (ticsCli.additionalFlags) {
    command.push(ticsCli.additionalFlags);
  }

  return command.join(' ');
}

function getCliOptionsForCommand() {
  const command = [`-project '${ticsCli.project}'`];

  CliOptions.filter(o => !isOneOf(o.action, 'additionalFlags', 'project', 'tmpdir')).forEach(option => {
    if (option.modes.includes(ticsConfig.mode)) {
      const value = ticsCli[option.action as keyof TicsCli];
      if (value) {
        command.push(`-${option.action} ${value}`);
      }
    }
  });

  return command;
}
