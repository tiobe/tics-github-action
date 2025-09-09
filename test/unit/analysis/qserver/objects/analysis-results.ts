import { ExtendedAnnotation, QualityGate, TicsReviewComments } from '../../../../../src/helper/interfaces';

export const failedQualityGate: QualityGate = {
  passed: false,
  message: 'failed',
  url: 'url',
  gates: [
    {
      passed: false,
      name: 'gate 1',
      conditions: []
    }
  ],
  annotationsApiV1Links: []
};

export const passedQualityGate: QualityGate = {
  passed: true,
  passedWithWarning: true,
  message: '',
  url: 'url',
  gates: [
    {
      passed: true,
      name: 'gate 1',
      conditions: []
    }
  ],
  annotationsApiV1Links: []
};

export const annotationsMock: ExtendedAnnotation[] = [
  {
    instanceName: 'Coding Standard',
    fullPath: 'path/to/file.js',
    line: 1,
    level: 1,
    category: 'CS',
    rule: '123',
    msg: 'Failed just because',
    supp: false,
    type: 'CS',
    count: 1
  },
  {
    instanceName: 'Coding Standard',
    fullPath: 'path/to/file.js',
    line: 2,
    level: 1,
    category: 'CS',
    rule: '123',
    msg: 'Failed just because',
    supp: false,
    type: 'CS',
    count: 2
  }
];

export const ticsReviewComments: TicsReviewComments = {
  postable: annotationsMock,
  unpostable: []
};
