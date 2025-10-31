import { ticsCli, ticsConfig } from '../configuration/config';
import { logger } from '../helper/logger';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';
import { TicsRunIdentifier, AnalyzedFiles, AnalyzedFile } from './interfaces';

/**
 * Retrieves the files TICS analyzed from the TICS viewer.
 * @param url The viewer call to retrieve the analyzed files from.
 * @returns the analyzed files.
 */
export async function getAnalyzedFiles(url: string): Promise<string[]> {
  logger.header('Retrieving analyzed files.');
  logger.debug(`From: ${url}`);

  let analyzedFiles: string[] = [];
  try {
    const response = await httpClient.get<AnalyzedFiles>(url);

    analyzedFiles = response.data.data.map((file: AnalyzedFile) => {
      logger.debug(file.formattedValue);
      return file.formattedValue;
    });
    logger.info(getRetryMessage(response, 'Retrieved the analyzed files.'));
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`There was an error retrieving the analyzed files: ${message}`);
  }
  return analyzedFiles;
}

/**
 * Builds the analyzed files api call.
 * @param identifier The identifier (project + either date or cdt) to get the analyzed files url for.
 * @returns The url to get the quality gate analysis.
 */
export function getAnalyzedFilesUrl(identifier: TicsRunIdentifier): string {
  const getAnalyzedFilesUrl = new URL(joinUrl(ticsConfig.baseUrl, '/api/public/v1/Measure?metrics=filePath'));

  const filters = [`Project(${identifier.project})`];

  if (ticsCli.branchname) {
    filters.push(`Branch(${ticsCli.branchname})`);
  }

  if (identifier.date) {
    filters.push(`Date(${identifier.date.toString()})`);
  }

  if (identifier.cdtoken) {
    filters.push(`ClientData(${identifier.cdtoken})`);
  }

  filters.push(`CodeType(Set(production,test,external,generated)),Window(-1),File()`);

  getAnalyzedFilesUrl.searchParams.append('filters', filters.join(','));

  return getAnalyzedFilesUrl.href;
}
