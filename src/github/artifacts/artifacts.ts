import { tmpdir } from 'os';
import { githubConfig, ticsConfig } from '../../configuration';
import { create } from '@actions/artifact';
import { logger } from '../../helper/logger';

export async function uploadArtifact() {
  const artifactClient = create();

  try {
    logger.header('Uploading artifact');
    const response = await artifactClient.uploadArtifact('ticstmpdir', [getTmpDir()], '.');

    if (response.failedItems.length > 0) {
      logger.debug(`Failed to upload artifact: ${response.failedItems.join(', ')}`);
    }
  } catch (error: unknown) {
    let message = 'reason unknown';
    if (error instanceof Error) message = error.message;
    logger.debug('Failed to upload artifact: ' + message);
  }
}

export function getTmpDir() {
  if (ticsConfig.tmpDir) {
    return ticsConfig.tmpDir;
  } else if (githubConfig.debugger) {
    return `${tmpdir()}/ticstmpdir`;
  } else {
    return '';
  }
}
