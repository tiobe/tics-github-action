import { LabelInfo, QiVersion } from './interfaces';
import { getMeasureApiData } from './measure';

export async function getTqiLabel(project: string, cdtoken?: string): Promise<LabelInfo[]> {
  const labelInfo = new Map<string, LabelInfo>();

  const metrics = await getMetrics(project, cdtoken);
  const currentData = await getMeasureApiData(metrics, project, { cdtoken });
  const deltaData = await getMeasureApiData(metrics, project, { deltaPrevious: true, cdtoken });

  currentData.data.forEach((d, i) => {
    const metric = currentData.metrics[i];
    labelInfo.set(metric.expression, {
      metric: metric.fullName.split(' for client data')[0],
      status: d.status,
      letter: d.letter ?? 'F',
      score: Number(d.value),
      deltaValue: Number(deltaData.data[i].value)
    });
  });

  return Array.from(labelInfo.values());
}

async function getMetrics(project: string, cdtoken?: string) {
  const response = await getMeasureApiData(['tqiVersion'], project, { cdtoken });
  let majorVersion = 5;
  if (response.data.length > 0) {
    if ((response.data[0].value as QiVersion).major) {
      majorVersion = (response.data[0].value as QiVersion).major;
    }
  }

  switch (majorVersion) {
    case 3:
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiDeadCode'];
    case 4:
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiSecurity'];
    case 5:
    default:
      return ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiSecurity', 'tqiCompWarn', 'tqiCodingStd', 'tqiComplexity', 'tqiDupCode', 'tqiFanOut'];
  }
}
