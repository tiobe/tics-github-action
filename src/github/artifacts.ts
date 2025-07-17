import { tmpdir } from 'os';
import { readdirSync } from 'fs';

import { create } from '@actions/artifact';
import { join } from 'canonical-path';

import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig, ticsCli } from '../configuration/config';

export async function uploadArtifact(): Promise<void> {
  const artifactClient = create();

  try {
    logger.header('Uploading artifact');
    const tmpdir = getTmpDir() + '/ticstmpdir';
    logger.info(`Logs gotten from ${tmpdir}`);
    const response = await artifactClient.uploadArtifact(
      // Example TICS_tics-github-action_2_qserver_ticstmpdir
      'upload',
      getFilesInFolder(tmpdir),
      tmpdir
    );

    if (response.failedItems.length > 0) {
      logger.debug(`Failed to upload file(s): ${response.failedItems.join(', ')}`);
    }
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.debug('Failed to upload artifact: ' + message);
  }
}

export function getTmpDir(): string {
  if (ticsCli.tmpdir) {
    return `${ticsCli.tmpdir}/${githubConfig.id}`;
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
