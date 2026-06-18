import { ticsCli, ticsConfig } from '../configuration/config';
import { logger } from '../helper/logger';
import { getRetryErrorMessage, getRetryMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';
import { MeasureApiResponse } from './interfaces';

/**
 * Creates a project in the viewer if it does not exist.
 * @throws Error if project cannot be created.
 */
export async function getMeasureApiData(
  metrics: string[],
  opts?: { cdtoken?: string; deltaDate?: number; deltaPrevious?: boolean }
): Promise<MeasureApiResponse> {
  const filtersParam = getFilters(opts?.cdtoken);
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

function getFilters(cdtoken?: string) {
  let filters = `Project(${ticsCli.project})`;
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
