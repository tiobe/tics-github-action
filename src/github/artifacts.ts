import { readdirSync } from 'fs';
import { tmpdir } from 'os';

import { DefaultArtifactClient } from '@actions/artifact';
import { create } from '@actions/artifact-v1';
import { join } from 'canonical-path';

import { githubConfig, ticsCli, ticsConfig } from '../configuration/config';
import { logger } from '../helper/logger';
import { handleOctokitError } from '../helper/response';

export async function uploadArtifact(): Promise<void> {
  logger.header('Uploading artifact');

  const tmpdir = getTmpDir() + '/ticstmpdir';
  // Example TICS_tics-github-action_2_qserver_ticstmpdir
  const name = sanitizeArtifactName(`${githubConfig.job}_${githubConfig.action}_${ticsConfig.mode}_ticstmpdir`);

  logger.info(`Logs taken from ${tmpdir}`);

  if (isGhes()) {
    await uploadGhes(name, tmpdir);
  } else {
    await uploadGithub(name, tmpdir);
  }
}

async function uploadGhes(name: string, tmpdir: string): Promise<void> {
  const artifactClient = create();

  try {
    const response = await artifactClient.uploadArtifact(name, getFilesInFolder(tmpdir), tmpdir);

    if (response.failedItems.length > 0) {
      logger.debug(`Failed to upload file(s): ${response.failedItems.join(', ')}`);
    }
    logger.info(`Uploaded artifact "${name}" (size: ${createSize(response.size)})`);
  } catch (error: unknown) {
    const message = handleOctokitError(error);
    logger.debug('Failed to upload artifact: ' + message);
  }
}

async function uploadGithub(name: string, tmpdir: string): Promise<void> {
  const artifactClient = new DefaultArtifactClient();

  try {
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

function isGhes(): boolean {
  const ghUrl = new URL(process.env.GITHUB_SERVER_URL ?? 'https://github.com');

  const hostname = ghUrl.hostname.trimEnd().toUpperCase();
  const isGitHubHost = hostname === 'GITHUB.COM';
  const isGheHost = hostname.endsWith('.GHE.COM');
  const isLocalHost = hostname.endsWith('.LOCALHOST');

  return !isGitHubHost && !isGheHost && !isLocalHost;
}
