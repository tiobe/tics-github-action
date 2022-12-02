import { githubConfig } from './github/configuration';
import { changeSetToFile, getChangedFiles } from './github/pulls/pulls';
import Logger from './helper/logger';
import { runTiCSAnalyzer } from './tics/tics_analyzer';

if (githubConfig.eventName === 'pull_request') {
  run();
} else {
  Logger.Instance.setFailed('This action can only run on pull requests.');
}

async function run() {
  try {
    const changeSet = await getChangedFiles();
    const changeSetFilePath = changeSetToFile(changeSet);
    await runTiCSAnalyzer(changeSetFilePath);
  } catch (error: any) {
    Logger.Instance.error('Failed to run TiCS Github Action');
    Logger.Instance.setFailed(error.message);
  }
}
