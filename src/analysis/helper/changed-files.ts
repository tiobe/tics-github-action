import { githubConfig, ticsConfig } from '../../configuration/config';
import { Mode } from '../../configuration/tics';
import { getChangedFilesOfCommit } from '../../github/commits';
import { ChangedFile } from '../../github/interfaces';
import { getChangedFilesOfPullRequestQL, changedFilesToFile, getChangedFilesOfPullRequestRest } from '../../github/pulls';
import { ChangedFiles } from '../../helper/interfaces';
import { logger } from '../../helper/logger';

export async function getChangedFiles(): Promise<ChangedFiles> {
  let changedFilesFilePath: string;
  let changedFiles: ChangedFile[];

  if (githubConfig.event.isPullRequest) {
    try {
      changedFiles = await getChangedFilesOfPullRequestQL();
    } catch (error: unknown) {
      logger.warning(error instanceof Error ? error.message : 'Could not retrieve the changed files, trying another way.');
      changedFiles = await getChangedFilesOfPullRequestRest();
    }
  } else {
    changedFiles = await getChangedFilesOfCommit();
  }

  if (ticsConfig.filelist !== '') {
    changedFilesFilePath = ticsConfig.filelist;
  } else if (changedFiles.length > 0 && ticsConfig.mode === Mode.CLIENT) {
    changedFilesFilePath = changedFilesToFile(changedFiles);
  } else {
    changedFilesFilePath = '';
  }

  return {
    files: changedFiles,
    path: changedFilesFilePath
  };
}
