import { ticsCli, ticsConfig } from '../configuration/config';
import { AnalyzedFiles, AnalyzedFile } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryMessage, getRetryErrorMessage } from '../helper/response';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';

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
 * @param identifier The identifier (either date or cdt) to get the qualitygate for.
 * @param date (only on qserver) the date of the last QServer run.
 * @param cdtoken (only on client) the cdtoken of the last Client run.
 * @returns The url to get the quality gate analysis.
 */
export function getAnalyzedFilesUrl({ date, cdtoken }: { date?: number; cdtoken?: string }): string {
  const getAnalyzedFilesUrl = new URL(joinUrl(ticsConfig.baseUrl, '/api/public/v1/Measure?metrics=filePath'));

  const filters = [`Project(${ticsCli.project})`];

  if (ticsCli.branchname) {
    filters.push(`Branch(${ticsCli.branchname})`);
  }

  if (date) {
    filters.push(`Date(${date.toString()})`);
  }

  if (cdtoken) {
    filters.push(`ClientData(${cdtoken})`);
  }

  filters.push(`Window(-1),CodeType(Set(production,test,external,generated)),File()`);

  getAnalyzedFilesUrl.searchParams.append('filters', filters.join(','));

  return getAnalyzedFilesUrl.href;
}
