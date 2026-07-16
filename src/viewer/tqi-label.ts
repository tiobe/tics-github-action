import { logger } from '../helper/logger.js';
import { LabelInfo, QiVersion } from './interfaces.js';
import { getMeasureApiData } from './measure.js';

export async function getTqiLabel(project: string, cdtoken?: string): Promise<LabelInfo[]> {
  const labelInfo: LabelInfo[] = [];

  const metrics = await getMetrics(project, cdtoken);
  const currentData = await getMeasureApiData(metrics, project, { cdtoken });
  const deltaData = await getMeasureApiData(metrics, project, { deltaPrevious: true, cdtoken });

  if (currentData.data.length !== deltaData.data.length) {
    logger.warning('Could not create TQI label information');
    return [];
  }

  currentData.data.forEach((d, i) => {
    const deltaValue = deltaData.data[i].value;
    labelInfo.push({
      metric: currentData.metrics[i].fullName.split(' for client data')[0],
      status: d.status,
      letter: d.letter ?? 'F',
      score: typeof d.value == 'number' ? d.value : 0,
      deltaValue: typeof deltaValue == 'number' ? deltaValue : 0
    });
  });

  return labelInfo;
}

async function getMetrics(project: string, cdtoken?: string) {
  const response = await getMeasureApiData(['tqiVersion'], project, { cdtoken });
  let majorVersion = null;
  if (response.data.length > 0) {
    const qiVersion = response.data[0].value as QiVersion;
    if (qiVersion.major) {
      majorVersion = qiVersion.major;
    }
  }

  switch (majorVersion) {
    case 3:
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiDeadCode'];
    case 4:
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiSecurity'];
    case 5:
    default: // If TQI version cannot be determined, assume it is version 5
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiSecurity', 'tqiCompWarn', 'tqiCodingStd', 'tqiComplexity', 'tqiDupCode', 'tqiFanOut'];
  }
}
