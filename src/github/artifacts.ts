import { tmpdir } from 'os';
import { readdirSync } from 'fs';

import { DefaultArtifactClient } from '@actions/artifact';
import { join } from 'canonical-path';

import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';
import { githubConfig, ticsCli, ticsConfig } from '../configuration/config';

export async function uploadArtifact(): Promise<void> {
  const artifactClient = new DefaultArtifactClient();
  const tmpdir = getTmpDir() + '/ticstmpdir';
  // Example TICS_tics-github-action_2_qserver_ticstmpdir
  const name = sanitizeArtifactName(`${githubConfig.job}_${githubConfig.action}_${ticsConfig.mode}_ticstmpdir`);

  try {
    logger.header('Uploading artifact');
    logger.info(`Logs gotten from ${tmpdir}`);
    const response = await artifactClient.uploadArtifact(name, getFilesInFolder(tmpdir), tmpdir);

    if (response.id && response.size) {
      logger.info(`Uploaded artifact "${name}" with id "${response.id.toString()}" (size: ${createSize(response.size)})`);
    }
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.debug('Failed to upload artifact: ' + message);
  }
}

function sanitizeArtifactName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Keep only safe characters
    .slice(0, 100); // Ensure max length
}

function createSize(size: number): string {
  const sizeInKb = size / 1024;

  if (sizeInKb > 1024 * 1024) {
    return `${(sizeInKb / (1024 * 1024)).toFixed(2)} GiB`;
  } else if (sizeInKb > 1024) {
    return `${(sizeInKb / 1024).toFixed(2)} MiB`;
  } else {
    return `${sizeInKb.toFixed(2)} KiB`;
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
