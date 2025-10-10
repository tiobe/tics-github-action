import { satisfies } from 'semver';
import { ticsCli, ticsConfig } from '../configuration/config';
import { QualityGate } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';
import { TicsRunIdentifier } from './interfaces';

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

  qualityGateUrl.searchParams.append('fields', 'details');
  if (satisfies(await ticsConfig.getViewerVersion(), '>=2025.1.8')) {
    qualityGateUrl.searchParams.append('includeFields', 'blockingAfter,absValue');
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
