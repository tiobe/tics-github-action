import { baseUrl, httpClient, ticsConfig } from '../configuration';
import { getRetryMessage, getRetryErrorMessage } from '../helper/error';
import { AnalyzedFile, AnalyzedFiles, QualityGate, RunDateResponse } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { joinUrl } from '../helper/url';

/**
 * Retrieves the TICS quality gate from the TICS viewer.
 * @param url The TICS explorer url.
 * @returns the quality gates
 */
export async function getQServerQualityGate(date: number): Promise<QualityGate> {
  logger.header('Retrieving the quality gates.');
  const qualityGateUrl = getQualityGateUrl(date);
  logger.debug(`From: ${qualityGateUrl}`);

  try {
    const response = await httpClient.get<QualityGate>(qualityGateUrl);
    logger.info(getRetryMessage(response, 'Retrieved the quality gates.'));
    logger.debug(JSON.stringify(response));
    return response.data;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving the quality gates: ${message}`);
  }
}

/**
 * Builds the quality gate url.
 * @param url The TICS Explorer url.
 * @returns The url to get the quality gate analysis.
 */
function getQualityGateUrl(date: number) {
  let qualityGateUrl = new URL(joinUrl(baseUrl, '/api/public/v1/QualityGateStatus'));

  qualityGateUrl.searchParams.append('project', ticsConfig.project);

  if (ticsConfig.branchname) {
    qualityGateUrl.searchParams.append('branch', ticsConfig.branchname);
  }

  qualityGateUrl.searchParams.append('fields', 'details,annotationsApiV1Links');
  qualityGateUrl.searchParams.append('includeFields', 'blockingAfter');
  qualityGateUrl.searchParams.append('date', date.toString());

  return qualityGateUrl.href;
}

/**
 * Gets the date of the last QServer run the viewer knows of.
 * @returns the last QServer run date.
 * @throws Error if no date could be retrieved.
 */
export async function getLastQServerRunDate(): Promise<number> {
  const getRunDateUrl = joinUrl(baseUrl, `api/public/v1/Measure?filters=Project(${ticsConfig.project})&metrics=lastRunInDatabase`);
  try {
    logger.header('Retrieving the last QServer run date');
    logger.debug(`From ${getRunDateUrl}`);
    const response = await httpClient.get<RunDateResponse>(getRunDateUrl);
    logger.info(getRetryMessage(response, 'Retrieved the last QServer run date.'));
    logger.debug(JSON.stringify(response));
    if (response.data.data.length === 0) {
      throw Error('Request returned empty array');
    }
    return response.data.data[0].value / 1000;
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving last QServer run date: ${message}`);
  }
}

/**
 * Retrieves the files TICS analyzed from the TICS viewer.
 * @param url The TICS explorer url.
 * @returns the analyzed files.
 */
export async function getAnalyzedFilesQServer(date: number): Promise<string[]> {
  logger.header('Retrieving analyzed files.');
  const analyzedFilesUrl = getAnalyzedFilesUrl(date);
  let analyzedFiles: string[] = [];
  logger.debug(`From: ${analyzedFilesUrl}`);

  try {
    const response = await httpClient.get<AnalyzedFiles>(analyzedFilesUrl);
    if (response) {
      analyzedFiles = response.data.data.map((file: AnalyzedFile) => {
        logger.debug(file.formattedValue);
        return file.formattedValue;
      });
      logger.info(getRetryMessage(response, 'Retrieved the analyzed files.'));
    }
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving the analyzed files: ${message}`);
  }
  return analyzedFiles;
}

/**
 * Returns the url to get the analyzed files with from the TICS.
 * @param url The TICS explorer url.
 * @returns url to get the analyzed files from.
 */
function getAnalyzedFilesUrl(date: number) {
  let getAnalyzedFilesUrl = new URL(joinUrl(baseUrl, '/api/public/v1/Measure?metrics=filePath'));

  getAnalyzedFilesUrl.searchParams.append(
    'filters',
    `Project(${ticsConfig.project}),Date(${date.toString()}),Window(-1),CodeType(Set(production,test,external,generated)),File()`
  );

  return getAnalyzedFilesUrl.href;
}
