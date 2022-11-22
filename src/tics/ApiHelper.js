import core from '@actions/core';
import http from 'http';
import https from 'https';
import ProxyAgent from "proxy-agent";
import { ticsConfig, githubConfig } from '../github/configuration.js';

export const getTiobewebBaseUrlFromGivenUrl = (givenUrl) => {
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

export const doHttpRequest = (url) => {

    return new Promise((resolve, reject) => {

        let tempUrl = new URL(url);
        let urlProtocol = tempUrl.protocol.replace(":", "");
        const client = (urlProtocol === 'http') ? http : https;

        const optionsInit = {
          followAllRedirects: true,
          rejectUnauthorized: false,
          agent: new ProxyAgent()
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
                var baseUrl = this.getTiobeWebBaseUrlFromUrl(tempUrl.href);
                core.setFailed(`HTTP request failed with status ${res.statusCode}. Please provide a working TICSAUTHTOKEN in your configuration. Check ${baseUrl}/Administration.html#page=authToken`);
                break;
              case 404:
                core.setFailed(`HTTP request failed with status ${res.statusCode}. Please check if the given ticsConfiguration is correct.`);
                break;
              default:
                core.setFailed(`HTTP request failed with status ${res.statusCode}. Please check if your configuration is correct.`);
                break;
            }
        })

        req.end();
    });
}
