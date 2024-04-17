import { exec } from '@actions/exec';
import { githubConfig, httpClient, ticsConfig, viewerUrl } from '../configuration';
import { logger } from '../helper/logger';
import { Analysis } from '../helper/interfaces';
import { getTmpDir } from '../github/artifacts';
import { InstallTics } from '@tiobe/install-tics';
import { platform } from 'os';
import { Mode } from '../helper/enums';
import { CliOptions } from '../action/cli_options';
import { ActionConfiguration } from '../action/action_configuration';
import { isOneOf } from '../helper/compare';
import { joinUrl } from '../helper/url';

let errorList: string[] = [];
let warningList: string[] = [];
let explorerUrls: string[] = [];
let statusCode: number;
let completed: boolean;

/**
 * Runs TICS based on the configuration set in a workflow.
 * @param fileListPath Path to changedFiles.txt.
 */
export async function runTicsAnalyzer(fileListPath: string): Promise<Analysis> {
  logger.header(`Analyzing for project ${ticsConfig.project}`);

  const command = await buildRunCommand(fileListPath);

  logger.header('Running TICS');
  logger.debug(`With command: ${command}`);
  try {
    statusCode = await exec(command, [], {
      silent: true,
      listeners: {
        stdout(data: Buffer) {
          let filtered = data.toString();
          filtered = logger.maskSecrets(filtered);
          process.stdout.write(filtered);
          findInStdOutOrErr(filtered);
        },
        stderr(data: Buffer) {
          let filtered = data.toString();
          filtered = logger.maskSecrets(filtered);
          process.stdout.write(filtered);
          findInStdOutOrErr(filtered);
        }
      }
    });
    completed = true;
  } catch (error: unknown) {
    if (error instanceof Error) logger.debug(error.message);
    completed = false;
    statusCode = -1;
  }

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
    installCommand = await installTics.getInstallCommand(ticsConfig.ticsConfiguration);

    if (platform() === 'linux') {
      installCommand += ' &&';
    }
  } else if (platform() === 'linux') {
    installCommand = `TICS='${ticsConfig.ticsConfiguration}';`;
  } else {
    installCommand = `$env:TICS='${ticsConfig.ticsConfiguration}'`;
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
  const error = data.toString().match(/\[ERROR.*/g);
  if (error && !errorList.find(e => e === error?.toString())) {
    errorList.push(error.toString());
  }

  const warning = data.toString().match(/\[WARNING.*/g);
  if (warning && !warningList.find(w => w === warning?.toString())) {
    warningList.push(warning.toString());
  }

  const findExplorerUrl = data.match(/\/Explorer.*/g);
  if (findExplorerUrl) {
    const urlPath = findExplorerUrl.slice(-1).pop();
    if (urlPath) {
      explorerUrls.push(joinUrl(viewerUrl, urlPath));
    }
  }
}

/**
 * Builds the TICS calculate command based on the fileListPath and the ticsConfig set.
 * @param fileListPath
 * @returns string of the command to run TICS.
 */
export function getTicsCommand(fileListPath: string) {
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

  if (ticsConfig.tmpdir || githubConfig.debugger) {
    command.push(`-tmpdir '${getTmpDir()}'`);
  }

  if (ticsConfig.additionalFlags) {
    command.push(`${ticsConfig.additionalFlags}`);
  }

  // Add TICS debug flag when in debug mode, if this flag was not already set.
  if (githubConfig.debugger && !command.includes('-log ')) {
    command.push('-log 9');
  }

  return command.join(' ');
}

function getCliOptionsForCommand() {
  const command = [`-project '${ticsConfig.project}'`];

  CliOptions.filter(o => !isOneOf(o.action, 'additionalFlags', 'projectName', 'tmpDir')).forEach(option => {
    if (option.modes.includes(ticsConfig.mode)) {
      const value = ticsConfig[option.cli as keyof ActionConfiguration];
      if (value) {
        command.push(`-${option.cli} ${value}`);
      }
    }
  });

  return command;
}
