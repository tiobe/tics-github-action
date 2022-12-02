import { changeSetToFile } from './github/pulls/pulls';
import Logger from './helper/logger';
import { runTiCSAnalyzer } from './tics/tics_analyzer';

run();

async function run() {
  try {
    const changeSetFilePath = changeSetToFile(['hello']);
    await runTiCSAnalyzer(changeSetFilePath);
  } catch (error: any) {
    Logger.Instance.error('Failed to run TiCS Github Action');
    Logger.Instance.setFailed(error.message);
  }
}
