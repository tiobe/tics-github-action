import core from '@actions/core';
import http from 'http';
import https from 'https';
import ProxyAgent from 'proxy-agent';
import { ticsConfig } from '../github/configuration.js';

export const getTiobeWebBaseUrlFromUrl = (givenUrl) => {
  const cfgMarker = 'cfg?name=';
  const apiMarker = '/api/';
  let baseUrl = null;

  /* 
  We cannot rely on the basic URL structure <protocol>://<domainname>:<port>/tiobeweb/<section>/api/...
  However, we always need a configuration via the api, so let's check on those
  */

  // Check if we got a configuration using the API
  if (givenUrl.includes(apiMarker + cfgMarker)) {
    baseUrl = givenUrl.split(apiMarker)[0];
  } else {
    core.setFailed('Missing configuration api in the TICS Viewer URL. Please check your workflow configuration.');
  }

  return baseUrl;
};

export const doHttpRequest = (url) => {

  return new Promise((resolve, reject) => {

    let tempUrl = new URL(url);
    let urlProtocol = tempUrl.protocol.replace(':', '');
    const client = (urlProtocol === 'http') ? http : https;

    const optionsInit = {
      followAllRedirects: true,
      rejectUnauthorized: ticsConfig.hostnameVerification,
      agent: new ProxyAgent()
    };
    let authToken = ticsConfig.ticsAuthToken;
    let options = authToken ? { ...optionsInit, headers: { 'Authorization': `Basic ${authToken}`, 'x-requested-with': 'tics' } } : optionsInit;

    let req = client.get(url, options, (res) => {
      let body = [];

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        switch (res.statusCode) {
          case 200:
            resolve(JSON.parse(body));
            break;
          case 302:
            core.setFailed(`HTTP request failed with status ${res.statusCode}. Please check if the given ticsConfiguration is correct (possibly http instead of https).`);
            break;
          case 400:
            core.setFailed(`HTTP request failed with status ${res.statusCode}. ${JSON.parse(body).alertMessages[0].header}`);
            break;
          case 401:
            var baseUrl = getTiobeWebBaseUrlFromUrl(tempUrl.href);
            core.setFailed(`HTTP request failed with status ${res.statusCode}. Please provide a working TICSAUTHTOKEN in your configuration. Check ${baseUrl}/Administration.html#page=authToken`);
            break;
          case 404:
            core.setFailed(`HTTP request failed with status ${res.statusCode}. Please check if the given ticsConfiguration is correct.`);
            break;
          default:
            core.setFailed(`HTTP request failed with status ${res.statusCode}. Please check if your configuration is correct.`);
            break;
        }
      });
    });

    req.on('error', error => {
      core.setFailed('HTTP request error: ' + error);
      reject(error.message);
    });
  });
};