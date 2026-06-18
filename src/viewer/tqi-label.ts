import { LabelInfo } from './interfaces';
import { getMeasureApiData } from './measure';

// const METRICS_3 = ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiDeadCode'];
// const METRICS_4 = ['tqi', 'tqiTestCoverage', 'tqiAbstrInt', 'tqiComplexity', 'tqiCompWarn', 'tqiCodingStd', 'tqiDupCode', 'tqiFanOut', 'tqiSecurity'];
export const METRICS_5 = [
  'tqi',
  'tqiTestCoverage',
  'tqiAbstrInt',
  'tqiSecurity',
  'tqiCompWarn',
  'tqiCodingStd',
  'tqiComplexity',
  'tqiDupCode',
  'tqiFanOut'
];

export async function getTqiLabel(metrics: string[], cdtoken?: string): Promise<LabelInfo[]> {
  const labelInfo = new Map<string, LabelInfo>();

  const [currentData, deltaData] = await Promise.all([
    getMeasureApiData(metrics, { cdtoken }),
    getMeasureApiData(metrics, { deltaPrevious: true, cdtoken })
  ]);

  currentData.data.forEach((d, i) => {
    const metric = currentData.metrics[i];
    labelInfo.set(metric.expression, {
      metric: metric.fullName.split(' for client data')[0],
      status: d.status,
      letter: d.letter ?? '-',
      score: d.value,
      deltaValue: deltaData.data[i].value
    });
  });

  return Array.from(labelInfo.values());
}
