import { exec, execFile } from 'child_process';
import util from 'node:util';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import core from '@actions/core';
import { ticsConfig } from '../github/configuration.js';
import { doHttpRequest, getTiobewebBaseUrlFromGivenUrl } from './ApiHelper.js';
const execWithPromise = util.promisify(exec);

export class TicsPublisher {

    run = async(explorerUrl)  => {
        let qualitygates = [];

        try {
            const qualityGateUrl = this.getQualityGateUrlAPI(explorerUrl);
            return this.getQualityGates(qualityGateUrl).then((qualitygates) => {
                core.info(`\u001b[35m > Retrieved quality gates results`);
                return qualitygates;
            })
        } catch (error) {
           core.setFailed(error.message);
        }
        return qualitygates;
    }

    getQualityGateUrlAPI = (explorerUrl) => {
        let qualityGateUrlAPI = new URL(getTiobewebBaseUrlFromGivenUrl(ticsConfig.ticsConfiguration) + '/api/public/v1/QualityGateStatus');
            qualityGateUrlAPI.searchParams.append('project', ticsConfig.projectName);
            qualityGateUrlAPI.searchParams.append('branch', ticsConfig.branchName);
            qualityGateUrlAPI.searchParams.append('fields', 'details,annotationsApiV1Links');
            qualityGateUrlAPI.searchParams.append('cdt', this.getSubstring(decodeURI(explorerUrl), "ClientData(", "Project"));

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

    getSubstring = (value, del1, del2) => {

      const sub_position_1 = value.indexOf(del1);
      const sub_position_2 = value.indexOf(del2);

      return value.substring(sub_position_1, sub_position_2);
    }

}


