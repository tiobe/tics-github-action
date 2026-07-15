import { ticsCli, ticsConfig } from '../configuration/config.js';
import { logger } from '../helper/logger.js';
import { getRetryErrorMessage, getRetryMessage } from '../helper/response.js';
import { joinUrl } from '../helper/url.js';
import { httpClient } from './http-client.js';
import { MeasureApiResponse } from './interfaces.js';

/**
 * Creates a project in the viewer if it does not exist.
 * @throws Error if project cannot be created.
 */
export async function getMeasureApiData(
  metrics: string[],
  project: string,
  opts?: { cdtoken?: string; deltaDate?: number; deltaPrevious?: boolean }
): Promise<MeasureApiResponse> {
  const filtersParam = getFilters(project, opts?.cdtoken);
  const metricsParam = getMetrics(metrics, opts?.deltaDate, opts?.deltaPrevious);
  const createProjectUrl = joinUrl(ticsConfig.baseUrl, `api/public/v1/Measure?filters=${filtersParam}&metrics=${metricsParam}`);
  try {
    logger.info('Retrieving metric data');
    logger.debug(`With ${createProjectUrl}`);
    const response = await httpClient.get<MeasureApiResponse>(createProjectUrl);
    logger.info(getRetryMessage(response, 'Retrieved the last QServer run date.'));
    logger.debug(JSON.stringify(response));
    return response.data;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error calling the Measure API: ${message}`);
  }
}

function getFilters(project: string, cdtoken?: string) {
  let filters = `Project(${project})`;
  if (ticsCli.branchname) {
    filters += `,Branch(${ticsCli.branchname})`;
  }
  if (cdtoken) {
    filters += `,ClientData(${cdtoken})`;
  }
  return filters;
}

function getMetrics(metrics: string[], deltaDate?: number, deltaPrevious = false) {
  if (deltaDate) {
    return metrics.map(m => `Delta(${m},${deltaDate.toString()})`).join(',');
  }
  if (deltaPrevious) {
    return metrics.map(m => `Delta(${m},Run(-2))`).join(',');
  }
  return metrics.join(',');
}
