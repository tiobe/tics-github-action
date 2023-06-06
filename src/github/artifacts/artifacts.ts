import { tmpdir } from 'os';
import { githubConfig, ticsConfig } from '../../configuration';
import { create } from '@actions/artifact';
import { logger } from '../../helper/logger';
import { readdirSync } from 'fs';
import { join } from 'canonical-path';

export async function uploadArtifact() {
  const artifactClient = create();

  try {
    logger.header('Uploading artifact');
    const tmpDir = getTmpDir() + '/ticstmpdir';
    const response = await artifactClient.uploadArtifact('ticstmpdir', getFilesInFolder(tmpDir), tmpDir);

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
    return `${tmpdir()}/tics`;
  } else {
    return '';
  }
}

function getFilesInFolder(directory: string): string[] {
  const files: string[] = [];

  function traverseDirectory(dir: string) {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDirectory(fullPath);
      } else {
        // Add file path to the list
        files.push(fullPath);
      }
    }
  }

  traverseDirectory(directory);
  return files;
}
