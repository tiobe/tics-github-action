import { ticsCli, ticsConfig } from '../configuration/_config';
import { QualityGate } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './_http-client';

/**
 * Retrieves the TICS quality gate from the TICS viewer.
 * @param url The viewer call to retrieve the qualitygate from.
 * @returns the quality gates
 * @throws Error
 */
export async function getQualityGate(url: string): Promise<QualityGate> {
  logger.header('Retrieving the quality gates.');
  logger.debug(`From: ${url}`);

  try {
    const response = await httpClient.get<QualityGate>(url);
    logger.info(getRetryMessage(response, 'Retrieved the quality gates.'));
    logger.debug(JSON.stringify(response));
    return response.data;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving the quality gates: ${message}`);
  }
}

/**
 * Builds the quality gate api call.
 * @param identifier The identifier (either date or cdt) to get the qualitygate for.
 * @param date (only on qserver) the date of the last QServer run.
 * @param cdtoken (only on client) the cdtoken of the last Client run.
 * @returns The url to get the quality gate analysis.
 */
export function getQualityGateUrl({ date, cdtoken }: { date?: number; cdtoken?: string }): string {
  const qualityGateUrl = new URL(joinUrl(ticsConfig.baseUrl, '/api/public/v1/QualityGateStatus'));

  qualityGateUrl.searchParams.append('project', ticsCli.project);

  if (ticsCli.branchname) {
    qualityGateUrl.searchParams.append('branch', ticsCli.branchname);
  }

  qualityGateUrl.searchParams.append('fields', 'details,annotationsApiV1Links');
  qualityGateUrl.searchParams.append('includeFields', 'blockingAfter');

  if (date) {
    qualityGateUrl.searchParams.append('date', date.toString());
  }

  if (cdtoken) {
    qualityGateUrl.searchParams.append('cdt', cdtoken);
  }

  return qualityGateUrl.href;
}
