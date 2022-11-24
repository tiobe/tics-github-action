import core from '@actions/core';
import util from 'util';
import { exec } from 'child_process';
import { ticsConfig, githubConfig } from '../github/configuration.js';
import { getTiobeWebBaseUrlFromUrl, doHttpRequest } from './ApiHelper.js';

const execWithPromise = util.promisify(exec);

export class TicsAnalyzer {

  run = async (fileListPath) => {
    let exitCode = 0;
    let installTicsApiFullUrl = '';

    core.info(`\u001b[35mAnalyzing new pull request for project ${ticsConfig.projectName}.`);
    try {
      if (ticsConfig.installTics == 'true') {
        const tiobeWebBaseUrl = getTiobeWebBaseUrlFromUrl(ticsConfig.ticsConfiguration);
        const ticsInstallApiBaseUrl = this.getInstallTicsApiUrl(tiobeWebBaseUrl, githubConfig.runnerOS.toLowerCase());
        let installTicsUrl = await this.retrieveInstallTics(ticsInstallApiBaseUrl);
        if (!installTicsUrl) {
          return;
        }

        installTicsApiFullUrl = tiobeWebBaseUrl + installTicsUrl;
      }
      return this.runTICSClient(installTicsApiFullUrl, fileListPath);
    } catch (error) {
      core.setFailed(error.message);
    }
    return exitCode;
  };

  runTICSClient = async (url, fileListPath) => {
    const bootstrapCommand = ticsConfig.installTics == 'true' ? this.getBootstrapCmd(url) : '';
    const ticsAnalysisCommand = this.getTicsClientArgs(fileListPath);
    const commandToRun = this.getCommandToRun(bootstrapCommand, ticsAnalysisCommand);

    core.info(`Invoking: ${commandToRun}`);
    return await execWithPromise(commandToRun);
  };

  getTicsClientArgs(fileListPath) {
    let execString = 'TICS @' + fileListPath + ' ';
    execString += ticsConfig.calc.includes('GATE') ? '' : '-viewer ';
    execString += ticsConfig.calc ? `-calc ${ticsConfig.calc} ` : '-calc GATE ';
    execString += ticsConfig.projectName ? `-project '${ticsConfig.projectName}' ` : '';
    execString += ticsConfig.clientToken ? `-cdtoken ${ticsConfig.clientToken} ` : '';
    execString += ticsConfig.tmpDir ? `-tmpdir ${ticsConfig.tmpDir} ` : '';
    execString += ticsConfig.extendTics ? ticsConfig.extendTics : '';
    return execString;
  }

  getBootstrapCmd = (installTicsUrl) => {
    if (this.isLinux()) {
      return `source <(curl -s \\"${installTicsUrl}\\")`;
    } else {
      return `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('${installTicsUrl}'))`;
    }
  };

  getCommandToRun = (bootstrapCmd, ticsAnalysisCmd) => {
    if (this.isLinux()) {
      return bootstrapCmd ? `bash -c "${bootstrapCmd} && ${ticsAnalysisCmd}"` : `bash -c "${ticsAnalysisCmd}"`;
    } else {
      return bootstrapCmd ? `powershell "${bootstrapCmd}; ${ticsAnalysisCmd}"` : `powershell "${ticsAnalysisCmd}"`;
    }
  };

  getInstallTicsApiUrl = (tiobeWebBaseUrl, os) => {
    let installTICSAPI = new URL(ticsConfig.ticsConfiguration);
    installTICSAPI.searchParams.append('platform', os);
    installTICSAPI.searchParams.append('url', tiobeWebBaseUrl);

    return installTICSAPI.href;
  };

  isLinux() {
    return githubConfig.runnerOS == 'Linux';
  }

  retrieveInstallTics = async (installTicsApiFullUrl) => {
    try {
      core.info('\u001b[35mTrying to retrieve configuration information from: ', installTicsApiFullUrl);

      let configInfo = await doHttpRequest(installTicsApiFullUrl).then((data) => {
        let response = {
          statusCode: 200,
          body: JSON.stringify(data.links.installTics),
        };

        return response;
      });
      let configObj = JSON.parse(configInfo.body);

      let installTICSUrlTemp = decodeURI(decodeURIComponent(configObj));

      return installTICSUrlTemp;

    } catch (error) {
      core.setFailed('An error occurred when trying to retrieve configuration information ' + error);
    }
  };
}
