import logger from './helper/logger';
import { githubConfig } from './github/configuration';
import { changeSetToFile, getChangedFiles } from './github/pulls/pulls';

if (githubConfig.eventName === 'pull_request') {
  run();
} else {
  logger.Instance.setFailed('This action can only run on pull requests.');
}

async function run() {
  try {
    const changeSet: string[] = await getChangedFiles();
    const changeSetFilePath = changeSetToFile(changeSet);
    logger.Instance.info(changeSetFilePath);
  } catch (error: any) {
    logger.Instance.error('Failed to run TiCS Github Action');
    logger.Instance.setFailed(error.message);
  }
}
