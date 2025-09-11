import { ExtendedAnnotation, QualityGate, TicsReviewComments } from '../../../../src/helper/interfaces';

export const passedQualityGate: QualityGate = {
  passed: true,
  passedWithWarning: true,
  message: '',
  url: 'url',
  gates: [
    {
      passed: true,
      name: 'gate 1',
      conditions: [
        {
          passed: true,
          passedWithWarning: false,
          error: false,
          message: 'No new Coding Standard Violations for levels 1, 2, 3 with respect to previous analysis'
        },
        {
          passed: true,
          passedWithWarning: false,
          error: false,
          message: 'No new Security Violations for levels 1, 2, 3 with respect to previous analysis'
        }
      ]
    }
  ],
  annotationsApiV1Links: []
};

export const failedQualityGate: QualityGate = {
  passed: true,
  passedWithWarning: true,
  message: '',
  url: 'url',
  gates: [
    {
      passed: true,
      name: 'gate 2',
      conditions: [
        {
          passed: false,
          passedWithWarning: false,
          error: false,
          message: 'No new Coding Standard Violations for levels 1, 2, 3 with respect to previous analysis'
        },
        {
          passed: true,
          passedWithWarning: false,
          error: false,
          message: 'No new Security Violations for levels 1, 2, 3 with respect to previous analysis'
        }
      ]
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
  unpostable: annotationsMock
};
