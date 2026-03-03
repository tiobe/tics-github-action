import { ticsCli, ticsConfig } from '../configuration/config.js';
import { QualityGate } from './interfaces.js';
import { logger } from '../helper/logger.js';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response.js';
import { joinUrl } from '../helper/url.js';
import { httpClient } from './http-client.js';
import { TicsRunIdentifier } from './interfaces.js';
import { ViewerFeature, viewerVersion } from './version.js';

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
 * @param identifier The identifier (project + either date or cdt) to get the qualitygate url for.
 * @returns The url to get the quality gate analysis.
 */
export async function getQualityGateUrl(identifier: TicsRunIdentifier): Promise<string> {
  const qualityGateUrl = new URL(joinUrl(ticsConfig.baseUrl, '/api/public/v1/QualityGateStatus'));

  qualityGateUrl.searchParams.append('project', identifier.project);

  if (ticsCli.branchname) {
    qualityGateUrl.searchParams.append('branch', ticsCli.branchname);
  }

  qualityGateUrl.searchParams.append('fields', 'details,blockingAfter');
  if (await viewerVersion.viewerSupports(ViewerFeature.NEW_ANNOTATIONS)) {
    qualityGateUrl.searchParams.append('includeFields', 'absValue');
  } else {
    qualityGateUrl.searchParams.append('includeFields', 'annotationsApiV1Links');
  }

  if (identifier.date) {
    qualityGateUrl.searchParams.append('date', identifier.date.toString());
  }

  if (identifier.cdtoken) {
    qualityGateUrl.searchParams.append('cdt', identifier.cdtoken);
  }

  return qualityGateUrl.href;
}
