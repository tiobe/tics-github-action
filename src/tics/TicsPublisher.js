import core from '@actions/core';
import { ticsConfig } from '../github/configuration.js';
import { doHttpRequest, getTiobeWebBaseUrlFromUrl } from './ApiHelper.js';

export class TicsPublisher {

  run = async (explorerUrl) => {
    let qualitygates = [];

    try {
      const qualityGateUrl = this.getQualityGateUrlAPI(explorerUrl);
      return this.getQualityGates(qualityGateUrl).then((qualitygates) => {
        core.info('\u001b[35mRetrieved quality gates results');
        return qualitygates;
      });
    } catch (error) {
      core.setFailed(error.message);
    }
    return qualitygates;
  };

  getQualityGateUrlAPI = (explorerUrl) => {
    let projectName = (ticsConfig.projectName == 'auto')? this.getItemFromUrl(explorerUrl, 'Project') : ticsConfig.projectName;
    let clientDataTok = this.getItemFromUrl(explorerUrl, 'ClientData');
    let qualityGateUrlAPI = new URL(getTiobewebBaseUrlFromGivenUrl(ticsConfig.ticsConfiguration) + '/api/public/v1/QualityGateStatus');
    
    qualityGateUrlAPI.searchParams.append('project', projectName);
    
    // Branchname is optional, to check if it is set
    if (ticsConfig.branchName) {
      qualityGateUrlAPI.searchParams.append('branch', ticsConfig.branchName);
    }
    
    qualityGateUrlAPI.searchParams.append('fields', 'details,annotationsApiV1Links');
    qualityGateUrlAPI.searchParams.append('cdt', clientDataTok);

    return qualityGateUrlAPI.href;
  };
  
  /* 
    Gets item form URL. Example:
    Input 0 : https://testlab.tiobe.com/tiobeweb/testlab/Explorer.html#axes=ClientData%2807dZd7R5GmI0xI9lhN18Yg%29%2CProject%28c-demo%29%2CBranch%28main%
    Input 1 : Project
    Output : c-demo
  */
  getItemFromUrl = (explorerUrl, item) => {
    let regExpr = new RegExp(`${item}\\((.*?)\\)`);
    let itemValue = decodeURIComponent(explorerUrl).match(regExpr);

    if (itemValue.length >= 2) {
      console.log(`Retrieved ${item} value: ${itemValue[1]}`);
      return itemValue[1];
    }

    return '';
  };

  getQualityGates = async (url) => {
    try {

      core.info('\u001b[35mTrying to retrieve quality gates from ', decodeURIComponent(url));
      let qualityGates = await doHttpRequest(url).then((data) => {
        let response = {
          statusCode: 200,
          body: JSON.stringify(data),
        };
        return response;
      });

      core.info('\u001b[35mTrying to parse quality gates response.');
      let qualityGateObj = JSON.parse(qualityGates.body);

      core.info('\u001b[35mTrying to retrieve quality gate status ', qualityGateObj.passed);
      if (qualityGateObj.passed === false) {
        core.setFailed('Quality gate failed');
      }

      return qualityGateObj;

    } catch (error) {
      core.setFailed('An error occurred when trying to retrieve quality gates ' + error);
    }
  };

  getAnnotations = async (annotationLink) => {
    try {
      core.info('\u001b[35mTrying to retrieve annotations from ');
      core.info(annotationLink);
      let ticsAnnotations = await doHttpRequest(annotationLink).then((data) => {
        let response = {
          statusCode: 200,
          body: JSON.stringify(data),
        };
        return response;
      });

      let ticsAnnotationsObj = JSON.parse(ticsAnnotations.body);

      return ticsAnnotationsObj;

    } catch (error) {
      core.setFailed('An error occured when trying to retrieve annotations ' + error);
    }
  };

  getSubstring = (value, del1, del2) => {

    const sub_position_1 = value.indexOf(del1);
    const sub_position_2 = value.indexOf(del2);

    return value.substring(sub_position_1 + del1.length, sub_position_2);
  };

}


