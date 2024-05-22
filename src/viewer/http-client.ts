import HttpClient from '@tiobe/http-client';
import { ProxyAgent } from 'proxy-agent';
import { ticsConfig, actionConfig } from '../configuration/config';

export const httpClient = new HttpClient(
  true,
  {
    authToken: ticsConfig.ticsAuthToken,
    xRequestWithTics: true,
    retry: {
      retries: actionConfig.retryConfig.maxRetries,
      retryDelay: actionConfig.retryConfig.delay * 1000,
      retryOn: actionConfig.retryConfig.codes
    }
  },
  new ProxyAgent()
);
