import { exec, execFile } from 'child_process';
import util from 'node:util';
import fs from 'fs';
import path from 'path';
import core from '@actions/core';
import { ticsConfig, githubConfig } from '../github/configuration.js';
import { getTiobewebBaseUrlFromGivenUrl, doHttpRequest } from "./ApiHelper.js";
import { postSummary } from "../index.js";
import { TicsPublisher } from '../tics/TicsPublisher.js';

const execWithPromise = util.promisify(exec);

export class TicsAnalyzer {

    run = async(changeSet, fileListPath)  => {
        let exitCode = 0;
        let installTicsApiFullUrl = "";

        try {
            if (ticsConfig.installTics == 'true') {
                const tiobeWebBaseUrl = getTiobewebBaseUrlFromGivenUrl(ticsConfig.ticsConfiguration);
                const ticsInstallApiBaseUrl = this.getInstallTicsApiUrl(tiobeWebBaseUrl, githubConfig.runnerOS.toLowerCase());
                let installTicsUrl = await this.retrieveInstallTics(ticsInstallApiBaseUrl);
                if (!installTicsUrl) {
                    return;
                }

                installTicsApiFullUrl = tiobeWebBaseUrl + installTicsUrl;
            }
            exitCode = this.runTICSClient(installTicsApiFullUrl, changeSet, fileListPath).then((exitCode)=> {
                return exitCode;
            });
        } catch (error) {
           core.setFailed(error.message);
        }
        return exitCode;
    }

    runTICSClient = async(url, changeSet, fileListPath) => {
        const bootstrapCommand =  ticsConfig.installTics == 'true' ? this.getBootstrapCmd(url) : "";
        const ticsAnalysisCommand = this.getTicsClientArgs(fileListPath);

        core.info(`Invoking: ${this.runCommand(bootstrapCommand, ticsAnalysisCommand)}`);
        const {stdout, stderr} = await execWithPromise(this.runCommand(bootstrapCommand, ticsAnalysisCommand), (err, stdout, stderr) => {
            if (err && err.code != 0) {
                core.info(stderr);
                core.info(stdout);
                let errorList = stdout.match(/\[ERROR.*/g);
                
                if (errorList) {
                    postSummary(errorList, true);
                } else {
                    postSummary(stderr, true);
                }
                core.setFailed("There is a problem while running TICS Client Viewer. Please check that TICS is configured and all required parameters have been set in your workflow.");
                return;
            } else {
                core.info(stdout);
                let locateExplorerUrl = stdout.match(/http.*Explorer.*/g);
                let explorerUrl = "";
                
                if (!!locateExplorerUrl) {
                    explorerUrl = locateExplorerUrl.slice(-1).pop();
                    core.info(`\u001b[35m > Explorer url retrieved ${explorerUrl}`); 
                } else {
                    postSummary("There is a problem while running TICS Client Viewer", true);
                    core.setFailed("There is a problem while running TICS Client Viewer.");
                    return;
                }

                const ticsPublisher = new TicsPublisher();
                ticsPublisher.run(explorerUrl).then((qualitygates) => {
                    core.info(`\u001b[35m > Retrieved quality gates results`);

                    return qualitygates;
                }).then((qualitygates) => {
                    let results = {
                        explorerUrl: explorerUrl,
                        changeSet: changeSet,
                        qualitygates: qualitygates
                    };

                    postSummary(results, false);
                })
            }
        });
    }

    getTicsClientArgs(fileListPath) {
        console.log(fileListPath);
        let execString = 'TICS @' + fileListPath + ' ';
        execString += ticsConfig.calc.includes("GATE") ? '' : '-viewer ';
        execString += ticsConfig.calc ? `-calc ${ticsConfig.calc} `: '-calc GATE ';
        execString += ticsConfig.projectName ? `-project '${ticsConfig.projectName}' ` : '';
        execString += ticsConfig.clientToken ? `-cdtoken ${ticsConfig.clientToken} ` : '';
        execString += ticsConfig.tmpDir ? `-tmpdir ${ticsConfig.tmpDir} ` : '';
        execString += ticsConfig.extendTics ? ticsConfig.extendTics : '';
        return execString;
    }

    getBootstrapCmd = (installTicsUrl) => {
        if (this.isLinux()) {
            return `source <(curl -s \\\"${installTicsUrl}\\\")`;
        } else {
            return `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('${installTicsUrl}'))`;
        }
    }

    runCommand = (bootstrapCmd, ticsAnalysisCmd) => {
        if (this.isLinux()) {
            return bootstrapCmd ? `bash -c \"${bootstrapCmd} && ${ticsAnalysisCmd}\"` : `bash -c \"${ticsAnalysisCmd}\"`;
        } else {
            return bootstrapCmd ? `powershell \"${bootstrapCmd}; ${ticsAnalysisCmd} \"` : `powershell \"${ticsAnalysisCmd} \"` ;
        }
     }

    getInstallTicsApiUrl = (tiobeWebBaseUrl, os) => {
        let installTICSAPI = new URL(ticsConfig.ticsConfiguration);
        installTICSAPI.searchParams.append('platform', os);
        installTICSAPI.searchParams.append('url', tiobeWebBaseUrl);

        return installTICSAPI.href;
    }

    isLinux() {
        return githubConfig.runnerOS == 'Linux';
    }

    retrieveInstallTics = async(installTicsApiFullUrl) => {
        try {
            console.log("\u001b[35m > Trying to retrieve configuration information from: ", installTicsApiFullUrl)

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
            core.setFailed("An error occurred when trying to retrieve configuration information " + error);
        }
    }
}
