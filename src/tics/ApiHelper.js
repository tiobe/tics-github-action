import core from '@actions/core';
import http from 'http';
import https from 'https';
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