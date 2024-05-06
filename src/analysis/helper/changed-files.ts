import { githubConfig, ticsConfig } from '../../configuration/_config';
import { Mode } from '../../configuration/tics';
import { getChangedFilesOfCommit } from '../../github/commits';
import { ChangedFile } from '../../github/interfaces';
import { getChangedFilesOfPullRequest, changedFilesToFile } from '../../github/pulls';
import { ChangedFiles } from '../../helper/interfaces';

export async function getChangedFiles(): Promise<ChangedFiles> {
  let changedFilesFilePath: string;
  let changedFiles: ChangedFile[];

  if (githubConfig.eventName === 'pull_request') {
    changedFiles = await getChangedFilesOfPullRequest();
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
