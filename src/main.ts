import { satisfies } from 'semver';
import { Mode } from './configuration/tics';
import { existsSync } from 'fs';
import { logger } from './helper/logger';
import { githubConfig, ticsCli, ticsConfig } from './configuration/config';
import { postCliSummary } from './action/cli/summary';
import { summary } from '@actions/core';
import { Verdict } from './helper/interfaces';
import { uploadArtifact } from './github/artifacts';
import { diagnosticAnalysis } from './analysis/diagnostic';
import { qServerAnalysis } from './analysis/qserver';
import { clientAnalysis } from './analysis/client';

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'TICS failed with unknown reason';
  logger.setFailed(message);
});

// exported for testing
export async function main(): Promise<void> {
  // logging this to instantiate the configs and validate before running the rest.
  logger.info(`Running action on event: ${githubConfig.event.name} with mode: ${ticsConfig.mode}`);

  await meetsPrerequisites();

  let verdict: Verdict;
  switch (ticsConfig.mode) {
    case Mode.DIAGNOSTIC:
      verdict = await diagnosticAnalysis();
      break;
    case Mode.CLIENT:
      verdict = await clientAnalysis();
      break;
    case Mode.QSERVER:
      verdict = await qServerAnalysis();
      break;
  }

  if (ticsCli.tmpdir || githubConfig.debugger) {
    await uploadArtifact();
  }

  if (!verdict.passed) {
    logger.setFailed(verdict.message);
  }

  postCliSummary(verdict);

  // Write the summary made to the action summary.
  await summary.write({ overwrite: true });
}

/**
 * Checks if prerequisites are met to run the Github Plugin.
 * If any of these checks fail it returns a message.
 */
async function meetsPrerequisites(): Promise<void> {
  const viewerVersion = await ticsConfig.getViewerVersion();

  if (satisfies(viewerVersion, '>=2022.4.0')) {
    throw Error(`Minimum required TICS Viewer version is 2022.4. Found version ${viewerVersion.toString()}.`);
  } else if (ticsConfig.mode === Mode.DIAGNOSTIC) {
    /* No need for checked out repository. */
  } else if (ticsConfig.mode === Mode.CLIENT && !githubConfig.event.isPullRequest && ticsConfig.filelist === '') {
    throw Error('If the the action is run outside a pull request it should be run with a filelist.');
  } else if (!existsSync('.git')) {
    throw Error('No checkout found to analyze. Please perform a checkout before running the TICS Action.');
  }
}
