import { tmpdir } from 'os';
import { githubConfig, ticsConfig } from '../configuration';
import { create } from '@actions/artifact';
import { logger } from '../helper/logger';
import { readdirSync } from 'fs';
import { join } from 'canonical-path';
import { handleOctokitError } from '../helper/error';

export async function uploadArtifact(): Promise<void> {
  const artifactClient = create();

  try {
    logger.header('Uploading artifact');
    const tmpDir = getTmpDir() + '/ticstmpdir';
    logger.info(`Logs written to ${tmpDir}`);
    const response = await artifactClient.uploadArtifact('ticstmpdir', getFilesInFolder(tmpDir), tmpDir);

    if (response.failedItems.length > 0) {
      logger.debug(`Failed to upload file(s): ${response.failedItems.join(', ')}`);
    }
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.debug('Failed to upload artifact: ' + message);
  }
}

export function getTmpDir(): string {
  if (ticsConfig.tmpDir) {
    return `${ticsConfig.tmpDir}/${githubConfig.id}`;
  } else if (githubConfig.debugger) {
    return `${tmpdir()}/tics/${githubConfig.id}`;
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
