import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 105:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 82:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 667:
/***/ ((module) => {

module.exports = eval("require")("@octokit/action");


/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__nccwpck_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "f": () => (/* binding */ postSummary),
  "K": () => (/* binding */ run)
});

// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/github
var github = __nccwpck_require__(82);
// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@actions/core
var core = __nccwpck_require__(105);
;// CONCATENATED MODULE: external "child_process"
const external_child_process_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("child_process");
;// CONCATENATED MODULE: external "node:util"
const external_node_util_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:util");
;// CONCATENATED MODULE: external "fs"
const external_fs_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("fs");
;// CONCATENATED MODULE: external "path"
const external_path_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("path");
;// CONCATENATED MODULE: ./src/github/configuration.js


let processEnv = process.env;

let githubConfig = {
    repo: processEnv.GITHUB_REPOSITORY,
    owner: processEnv.GITHUB_REPOSITORY.split("/")[0],
    reponame: processEnv.GITHUB_REPOSITORY.split("/")[1],
    branchname: processEnv.GITHUB_HEAD_REF,
    basebranchname: processEnv.GITHUB_BASE_REF,
    branchdir: processEnv.GITHUB_WORKSPACE,
    eventName: processEnv.GITHUB_EVENT_NAME,
    runnerOS: processEnv.RUNNER_OS
}

let ticsConfig = {
    projectName: core.getInput('projectName', {required: true}),
    branchName: core.getInput('branchName'),
    branchDir: core.getInput('branchDir', {required: false}),
    tmpDir: core.getInput('tmpDir'),
    calc: core.getInput('calc'),
    viewerUrl: core.getInput('ticsViewerUrl') ? core.getInput('ticsViewerUrl') : "",
    clientToken: core.getInput('clientToken'),
    ticsAuthToken: core.getInput('ticsAuthToken') ? core.get('ticsAuthToken') : processEnv.TICSAUTHTOKEN,
    installTics: core.getInput('installTics'),
    ticsConfiguration: core.getInput('ticsConfiguration')
}

;// CONCATENATED MODULE: external "http"
const external_http_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("http");
;// CONCATENATED MODULE: external "https"
const external_https_namespaceObject = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("https");
;// CONCATENATED MODULE: ./src/tics/ApiHelper.js





const getTiobewebBaseUrlFromGivenUrl = (givenUrl) => {
    let urlLengthWithHost = 3;
    let urlLengthWithSection = 5;
    let url = givenUrl.slice(0, -1);
    let parts = url.split("/");

    if (parts.length < urlLengthWithHost) {
        core.error("Missing host name in TICS Viewer URL");
    }
    if (parts.length < urlLengthWithSection) {
        core.error("Missing section name in TICS Viewer URL");
    }

    return parts.splice(parts, 5).join('/');
}

const doHttpRequest = (url) => {

    return new Promise((resolve, reject) => {

        let tempUrl = new URL(url);
        let urlProtocol = tempUrl.protocol.replace(":", "");
        const client = (urlProtocol === 'http') ? external_http_namespaceObject : external_https_namespaceObject;

        const optionsInit = {
          followAllRedirects: true
        }

        let authToken = ticsConfig.ticsAuthToken;
        let options = authToken ? {...optionsInit, headers: {'Authorization': 'Basic ' + authToken } } : optionsInit

        let req = client.get(url, options, (res) => {
          let body = [];
          
          res.on('data', (chunk) => {
            body += chunk;
          })
          
          res.on('end', () => {
              if (res.statusCode === 200) {
                resolve(JSON.parse(body));
              } else {
                core.setFailed("HTTP request failed with status " + res.statusCode + ". Please try again by setting a TICSAUTHTOKEN in your configuration.");
              }
          })
        });

        req.on('error', error => {
          core.setFailed("HTTP request error: " + error)
          reject(error.message);
        })

        req.end();
    });
}
// EXTERNAL MODULE: ../../../../usr/local/lib/node_modules/@vercel/ncc/dist/ncc/@@notfound.js?@octokit/action
var action = __nccwpck_require__(667);
;// CONCATENATED MODULE: ./src/github/pulls/pulls.js
 //GitHub API client for GitHub Actions




//Octokit client is authenticated
const octokit = new action.Octokit();
const payload = JSON.parse(external_fs_namespaceObject.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const pullRequestNum = payload.pull_request ? payload.pull_request.number : "";

/* Helper functions to get all changed files params of a pull request */
const getParams = () => {

    let parameters = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        pull_number: pullRequestNum,
        per_page: 100,
        page: 1,
    }

    return parameters;
}

const getPRChangedFiles =  async() => {

    let changedFiles = "";

    try {
       await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', getParams()).then((response) => {
            core.debug(`Getting the changed files list ${response.data}`)

            response.data && response.data.map((item) => {
                changedFiles += item.filename + " ,"
            })

            changedFiles = changedFiles.slice(0, -1); // remove the last comma

            return changedFiles; 
        })
    } catch(e) {
        core.error(`We cannot retrieve the files that changed in this PR: ${e}`)
    }

    return changedFiles;
};

;// CONCATENATED MODULE: ./src/tics/TicsPublisher.js









const execWithPromise = external_node_util_namespaceObject.promisify(external_child_process_namespaceObject.exec);

class TicsPublisher {

    run = async()  => {
        let qualitygates = [];

        try {
            const qualityGateUrl = this.getQualityGateUrlAPI();
            return this.getQualityGates(qualityGateUrl).then((qualitygates) => {
                core.info(`\u001b[35m > Retrieved quality gates results`);
                console.log("qualitygates => " +  qualitygates.gates.length);
                return qualitygates;
            })
        } catch (error) {
           core.setFailed(error.message);
        }
        return qualitygates;
    }

    getQualityGateUrlAPI = () => {

        let qualityGateUrlAPI = new URL(getTiobewebBaseUrlFromGivenUrl(ticsConfig.ticsConfiguration) + '/api/public/v1/QualityGateStatus');
            qualityGateUrlAPI.searchParams.append('project', ticsConfig.projectName);
            qualityGateUrlAPI.searchParams.append('branch', ticsConfig.branchName);
            qualityGateUrlAPI.searchParams.append('fields', 'details,annotationsApiV1Links');

        return qualityGateUrlAPI.href;
    }

    getQualityGates = async(url) => {
        try {
         
            console.log("\u001b[35m > Trying to retrieve quality gates from ", url)
            let qualityGates = await doHttpRequest(url).then((data) => {
                let response = {
                    statusCode: 200,
                    body: JSON.stringify(data),
                };
                return response;
            });
         
            console.log("\u001b[35m > Trying to parse quality gates response.")
            let qualityGateObj = JSON.parse(qualityGates.body);
            
            console.log("\u001b[35m > Trying to retrieve quality gate status ", qualityGateObj.passed)
            if(qualityGateObj.passed === false) {
                core.setFailed('Quality gate failed');
            }
            
            return qualityGateObj;

        } catch (error) {
            core.setFailed("An error occurred when trying to retrieve quality gates " + error);
        }
    }

}



;// CONCATENATED MODULE: ./src/tics/TicsAnalyzer.js











const TicsAnalyzer_execWithPromise = external_node_util_namespaceObject.promisify(external_child_process_namespaceObject.exec);

class TicsAnalyzer {

    run = async()  => {
        let exitCode = 0;
        let installTicsApiFullUrl = "";

        try {
            if (ticsConfig.installTics == 'true') {
                const tiobeWebBaseUrl = getTiobewebBaseUrlFromGivenUrl(ticsConfig.ticsConfiguration);
                const ticsInstallApiBaseUrl = this.getInstallTicsApiUrl(tiobeWebBaseUrl, githubConfig.runnerOS.toLowerCase());
                let installTicsUrl = await this.retrieveInstallTics(ticsInstallApiBaseUrl);
                installTicsApiFullUrl = tiobeWebBaseUrl + installTicsUrl;
            }
            exitCode = this.runTICSClient(installTicsApiFullUrl).then((exitCode)=> {
                return exitCode;
            });
        } catch (error) {
           core.setFailed(error.message);
        }
        return exitCode;
    }

    runTICSClient = async(url) => {
        const bootstrapCommand =  ticsConfig.installTics == 'true' ? this.getBootstrapCmd(url) : "";
        const ticsAnalysisCommand = this.getTicsClientArgs();

        core.info(`Invoking: ${this.runCommand(bootstrapCommand, ticsAnalysisCommand)}`);
        const {stdout, stderr} = await TicsAnalyzer_execWithPromise(this.runCommand(bootstrapCommand, ticsAnalysisCommand), (err, stdout, stderr) => {
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

                getPRChangedFiles().then((changeSet) => {
                    core.info(`\u001b[35m > Retrieving changed files to analyse`);
                    core.info(`Changed files list retrieved: ${changeSet}`);
                    return changeSet;
                }).then((changeSet) => {
                    const ticsPublisher = new TicsPublisher();
                    ticsPublisher.run().then((qualitygates) => {
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
                });
            }
        });
    }

    getTicsClientArgs() {
        let execString = 'TICS ';
        execString += ticsConfig.calc.includes("GATE") ? '' : '-viewer ';
        execString += ticsConfig.calc ? `-calc ${ticsConfig.calc} -changed `: '-calc GATE -changed ';
        execString += ticsConfig.projectName ? `-project ${ticsConfig.projectName} ` : '';
        execString += ticsConfig.clientToken ? `-cdtoken ${ticsConfig.clientToken} ` : '';
        execString += ticsConfig.tmpDir ? `-tmpdir ${ticsConfig.tmpDir} ` : '';
        execString += ticsConfig.branchDir ? `${ticsConfig.branchDir} ` : ' .';
        return execString;
    }

    getBootstrapCmd = (installTicsUrl) => {
        if (this.isLinux) {
            return `source <(curl -s \\\"${installTicsUrl}\\\")`;
        } else {
            return `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('${installTicsUrl}'))`;
        }
    }

    runCommand = (bootstrapCmd, ticsAnalysisCmd) => {
        if (this.isLinux) {
            return `bash -c \"${bootstrapCmd} && ${ticsAnalysisCmd}\"`;
        } else {
            return `powershell \"${bootstrapCmd}; if ($LASTEXITCODE -eq 0) { ${ticsAnalysisCmd} }\"`;
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

;// CONCATENATED MODULE: ./src/github/issues/issues.js
 //GitHub API client for GitHub Actions




//Octokit client is authenticated
const issues_octokit = new action.Octokit();
const issues_payload = JSON.parse(external_fs_namespaceObject.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const issues_pullRequestNum = issues_payload.pull_request ? issues_payload.pull_request.number : "";

/* Helper functions to construct a checkrun */
const issues_getParams = (inputparams) => {
    let parameters = {};

    parameters = {
        accept: 'application/vnd.github.v3+json',
        owner: githubConfig.owner,
        repo: githubConfig.reponame,
        issue_number: issues_pullRequestNum,
        comment_id: inputparams.comment_id ?  inputparams.comment_id : '',
        body: inputparams.body ? inputparams.body : ''
    }
    
    return parameters;
}

const createIssueComment =  async(params) => {
    try {
        core.info(`\u001b[35m > Posting pull request decoration`);
        console.log(issues_pullRequestNum);
        await issues_octokit.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', issues_getParams(params))
    } catch(e) {
        console.log("Create issue comment failed: ", e)
    }
};

;// CONCATENATED MODULE: ./src/github/summary/markdownGenerator.js
const generateLinkMarkdown = (text, link) => {
    return Boolean(text) && Boolean(link) ? `[${text}](${link})` : '';
}

const generateStatusMarkdown = (passed, hasSuffix) => {
    if (passed) {
        return ':heavy_check_mark: ' + (hasSuffix ? 'Passed ' : '');
    } else {
        return ':x: ' + (hasSuffix ? 'Failed ' : '');
    }
}

/**
*  To properly render a table markdown, the table should start with a blank line.
*  Hyphens(-) are used to create each column's header, while pipes(|) separate each column.
*  For example:
*  
*  | First Header  | Second Header |
*  | ------------- | ------------- |
*  | Content Cell  | Content Cell  |
*  | Content Cell  | Content Cell  |
*/
const generateTableMarkdown = (headers, cells) => {
    let row = `\n ${generateTableHeaders(headers, true)} ${generateTableHeaders(headers, false)}`;
    
    cells.forEach(cell => {
        row += `|  ${generateLinkMarkdown(cell.name, cell.link)} | ${cell.score} | \n`
    })
    
    return row;
}

const generateTableHeaders = (array, isHeader) => {
    return '|' + array.map((header) => {
       return isHeader ? header : '---';
    }).join('|') + '|' + '\n';
}

const generateExpandableAreaMarkdown = (title, body) => {
    return `<details><summary>${title}</summary> \n ${body} </details> \n`;
}

;// CONCATENATED MODULE: ./src/github/summary/index.js



const getErrorSummary = (errorList) => {
    let errorMessage = `## TICS Quality Gate\r\n\r\n### :x: Failed \r\n\r\n #### The following errors have occurred during analysis:\r\n\r\n`;

   if (errorList && Array.isArray(errorList)) {
       errorList.forEach(item => errorMessage += `> :x: ${item}\r\n`); 
    } else {
        errorMessage += `> :x: ${errorList}\r\n`
    }

    return errorMessage;
}

const getQualityGateSummary = (qualityGateObj) => {
    if (!qualityGateObj) {
       return "";
    }
    
    let gatesConditionsSummary = '';

    qualityGateObj.gates && qualityGateObj.gates.forEach(gate => {
        gatesConditionsSummary = getQGCondtionsSummary(gate.conditions);
    })
    
    return `## TICS Quality Gate \n\n ### ${generateStatusMarkdown(qualityGateObj.passed, true)} \n\n ${gatesConditionsSummary}\n`;
}

const getLinkSummary = (link) => {
    return generateLinkMarkdown('See the results in the TICS Viewer', link) + `\n\n`;
}

const getFilesSummary = (fileList) => {
    return `#### The following file(s) have been checked:\n> ${fileList}`;
}

/**
* Helper methods to generate markdown
*/
const getQGCondtionsSummary = (conditions) => {
    let out = '';
    
    conditions.forEach(condition => {
        if (condition.skipped !== true) {
            const gateConditionWithIcon = `${generateStatusMarkdown(condition.passed, false)}  ${condition.message}`; 

            if (condition.details !== null && condition.details.items.length > 0) {
                let headers = [];
                headers.push("File", condition.details.dataKeys.actualValue.title);
                let cells = getTableCellsDetails(condition.details.items.filter(item => item.itemType === "file"));

                out += generateExpandableAreaMarkdown(gateConditionWithIcon, generateTableMarkdown(headers, cells)) + '\n\n\n';
            } else {
                out += gateConditionWithIcon + ' \n\n\n';
            }
        }
    })
    
    return out;
}

const getTableCellsDetails = (items) => {
    return items.map((item) => {
        return {
                 name: item.name,
                 link: core.getInput('ticsViewerUrl') + item.link,
                 score: item.data.actualValue.formattedValue
               };
    });
}

;// CONCATENATED MODULE: ./src/index.js







if (githubConfig.eventName == 'pull_request') {
    run();
} else {
    core.setFailed("This action is running only on pull request events.");
}

async function run() {
    try {
        core.info(`\u001b[35m > Analysing new pull request for project ${ticsConfig.projectName}.`)
        const ticsAnalyzer = new TicsAnalyzer();
        const exitCode = await ticsAnalyzer.run();

    } catch (error) {
       core.error("Failed to run TiCS Github Action");
       core.error(error);
       core.setFailed(error.message);
    }
}

async function postSummary(summary, isError) {
    let commentBody = {};

    if (isError) {
        commentBody.body = getErrorSummary(summary);
        createIssueComment(commentBody)
    } else {
        commentBody.body = getQualityGateSummary(summary.qualitygates) + getLinkSummary(summary.explorerUrl) + getFilesSummary(summary.changeSet);
        createIssueComment(commentBody);
    }
}
})();

var __webpack_exports__postSummary = __webpack_exports__.f;
var __webpack_exports__run = __webpack_exports__.K;
export { __webpack_exports__postSummary as postSummary, __webpack_exports__run as run };
