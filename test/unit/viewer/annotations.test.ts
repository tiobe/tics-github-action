import { describe, expect, it, jest } from '@jest/globals';
import { httpClient } from '../../../src/viewer/http-client';
import { actionConfigMock, githubConfigMock, ticsConfigMock } from '../../.setup/mock';
import { ChangedFile } from '../../../src/github/interfaces';
import { FetchedAnnotation, QualityGate } from '../../../src/helper/interfaces';
import { GithubEvent } from '../../../src/configuration/github-event';
import { fetchAllAnnotations, groupAndExtendAnnotations } from '../../../src/viewer/annotations';
import { TicsRunIdentifier } from '../../../src/viewer/interfaces';
import { SemVer } from 'semver';

describe('fetchAllAnnotations', () => {
  let httpClientSpy: jest.SpiedFunction<typeof httpClient.get>;
  let qualityGate: QualityGate;
  let identifier: TicsRunIdentifier;

  beforeEach(() => {
    ticsConfigMock.baseUrl = 'http://base.url';

    httpClientSpy = jest.spyOn(httpClient, 'get');

    qualityGate = {
      passed: false,
      message: '',
      url: '',
      gates: []
    };
    identifier = {
      project: 'project'
    };
  });

  afterAll(() => {
    httpClientSpy.mockRestore();
  });

  describe('viewers with versions < 2025.1.8', () => {
    beforeAll(() => {
      ticsConfigMock.getViewerVersion = () => {
        return new SemVer('2025.1.7');
      };
    });

    it('should return annotations from viewer', async () => {
      httpClientSpy.mockResolvedValueOnce({ data: { data: [{ type: 'CS' }] }, retryCount: 0, status: 200 });
      httpClientSpy.mockResolvedValueOnce({
        data: {
          data: [{ type: 'CS', line: 10, count: 2 }],
          annotationTypes: { CS: { instanceName: 'Coding Standard Violations' } }
        },
        retryCount: 0,
        status: 200
      });

      const response = await fetchAllAnnotations(
        { ...qualityGate, annotationsApiV1Links: [{ url: 'url?fields=default,blocking' }, { url: 'url' }] },
        identifier
      );

      expect(response).toEqual([
        { type: 'CS', gateId: 0, line: 1, count: 1, instanceName: 'CS' },
        { type: 'CS', gateId: 1, line: 10, count: 2, instanceName: 'Coding Standard Violations' }
      ]);
    });

    it('should return complexity annotations from the viewer', async () => {
      httpClientSpy.mockResolvedValueOnce({
        data: {
          data: [
            { type: 'COMPLEXITY', line: 10, complexity: 3, functionName: 'main' },
            { type: 'COMPLEXITY', line: 2, complexity: 2, functionName: 'test', msg: 'testing' }
          ]
        },
        retryCount: 0,
        status: 200
      });

      const response = await fetchAllAnnotations({ ...qualityGate, annotationsApiV1Links: [{ url: 'url' }] }, identifier);

      expect(response).toEqual([
        {
          type: 'COMPLEXITY',
          complexity: 3,
          functionName: 'main',
          gateId: 0,
          line: 10,
          count: 1,
          instanceName: 'COMPLEXITY',
          msg: 'Function main has a complexity of 3'
        },
        {
          type: 'COMPLEXITY',
          complexity: 2,
          functionName: 'test',
          gateId: 0,
          line: 2,
          count: 1,
          instanceName: 'COMPLEXITY',
          msg: 'testing'
        }
      ]);
    });

    it('should return no annotations when no urls are given', async () => {
      const response = await fetchAllAnnotations(qualityGate, identifier);

      expect(response).toEqual([]);
    });

    it('should throw error on faulty get in getAnnotations', async () => {
      httpClientSpy.mockRejectedValueOnce(new Error());

      let error: any;
      try {
        await fetchAllAnnotations({ ...qualityGate, annotationsApiV1Links: [{ url: 'url' }] }, identifier);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('viewers with versions >= 2025.1.8', () => {
    beforeAll(() => {
      ticsConfigMock.getViewerVersion = () => {
        return new SemVer('2025.1.8');
      };
    });

    it('should return annotations from viewer', async () => {
      httpClientSpy.mockResolvedValueOnce({
        data: { data: [{ type: 'CS' }, { type: 'CS', line: 10, count: 2 }], annotationTypes: { CS: { instanceName: 'Coding Standard Violations' } } },
        retryCount: 0,
        status: 200
      });

      identifier.cdtoken = 'test';
      const response = await fetchAllAnnotations(qualityGate, identifier);

      expect(httpClientSpy).toHaveBeenCalledWith(
        'http://base.url/api/public/v1/Annotations?metric=QualityGate%28%29&filters=Project%28project%29%2CClientData%28test%29%2CAnnotationSeverity%28blocking%29&fields=default%2CruleHelp%2Csynopsis%2Cruleset%2Cblocking'
      );
      expect(response).toEqual([
        { type: 'CS', line: 1, count: 1, instanceName: 'Coding Standard Violations' },
        { type: 'CS', line: 10, count: 2, instanceName: 'Coding Standard Violations' }
      ]);
    });

    it('should return complexity annotations from the viewer', async () => {
      httpClientSpy.mockResolvedValueOnce({
        data: {
          data: [
            { type: 'COMPLEXITY', line: 10, complexity: 3, functionName: 'main' },
            { type: 'COMPLEXITY', line: 2, complexity: 2, functionName: 'test', msg: 'testing' }
          ]
        },
        retryCount: 0,
        status: 200
      });

      identifier.date = 15984835158;
      actionConfigMock.showBlockingAfter = true;
      const response = await fetchAllAnnotations(qualityGate, identifier);

      expect(httpClientSpy).toHaveBeenCalledWith(
        'http://base.url/api/public/v1/Annotations?metric=QualityGate%28%29&filters=Project%28project%29%2CDate%2815984835158%29%2CAnnotationSeverity%28Set%28blocking%2Cafter%29%29&fields=default%2CruleHelp%2Csynopsis%2Cruleset%2Cblocking'
      );
      expect(response).toEqual([
        {
          type: 'COMPLEXITY',
          complexity: 3,
          functionName: 'main',
          line: 10,
          count: 1,
          instanceName: 'COMPLEXITY',
          msg: 'Function main has a complexity of 3'
        },
        {
          type: 'COMPLEXITY',
          complexity: 2,
          functionName: 'test',
          line: 2,
          count: 1,
          instanceName: 'COMPLEXITY',
          msg: 'testing'
        }
      ]);
    });

    it('should throw error on faulty get in getAnnotations', async () => {
      httpClientSpy.mockRejectedValueOnce(new Error());

      let error: any;
      try {
        await fetchAllAnnotations({ ...qualityGate, annotationsApiV1Links: [{ url: 'url' }] }, identifier);
      } catch (err) {
        error = err;
      }

      expect(error).toBeInstanceOf(Error);
    });
  });
});

describe('groupAndExtendAnnotations', () => {
  it('should return no review comments on empty input', async () => {
    const response = groupAndExtendAnnotations([], []);

    expect(response).toEqual([]);
  });

  it('should return one postable review comment', async () => {
    const changedFiles: ChangedFile[] = [
      {
        sha: 'sha',
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        blob_url: 'url',
        raw_url: 'url',
        contents_url: 'url',
        patch: '@@ -0,1 +0,1 @@'
      }
    ];
    const fetchedAnnotations: FetchedAnnotation[] = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        gateId: 0
      }
    ];

    const response = groupAndExtendAnnotations(fetchedAnnotations, changedFiles);

    expect(response).toEqual([{ ...fetchedAnnotations[0], postable: true, displayCount: '', path: 'src/test.js' }]);
  });

  it('should return one combined postable review comment for the same line', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
    const changedFiles: ChangedFile[] = [
      {
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        sha: '',
        blob_url: '',
        raw_url: '',
        contents_url: ''
      }
    ];
    const fetchedAnnotations: FetchedAnnotation[] = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        blocking: {
          state: 'yes'
        },
        gateId: 0
      },
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        blocking: {
          state: 'yes'
        },
        gateId: 0
      }
    ];

    const expected = [{ ...fetchedAnnotations[0], path: 'src/test.js', count: 2, displayCount: '(2x) ', postable: true }];

    const response = groupAndExtendAnnotations(fetchedAnnotations, changedFiles);

    expect(response).toEqual(expected);
  });

  it('should return one blocking now and a blocking after review comment for the same line', async () => {
    githubConfigMock.event = GithubEvent.PULL_REQUEST;
    const changedFiles: ChangedFile[] = [
      {
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        sha: '',
        blob_url: '',
        raw_url: '',
        contents_url: ''
      }
    ];
    const fetchedAnnotations: FetchedAnnotation[] = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'rule-now',
        msg: 'message-now',
        count: 1,
        supp: false,
        instanceName: 'test',
        blocking: {
          state: 'yes'
        },
        gateId: 0
      },
      {
        // testing one without a rule
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        msg: 'message-after',
        count: 1,
        supp: false,
        instanceName: 'test',
        blocking: {
          state: 'after',
          after: 1708356940000
        },
        gateId: 0
      }
    ];

    const expected = [
      { ...fetchedAnnotations[0], displayCount: '', path: 'src/test.js', postable: true },
      { ...fetchedAnnotations[1], displayCount: '', path: 'src/test.js', postable: true }
    ];

    const response = groupAndExtendAnnotations(fetchedAnnotations, changedFiles);

    expect(response).toEqual(expected);
  });

  it('should return one postable and one unpostable review comment', async () => {
    const changedFiles: ChangedFile[] = [
      {
        filename: 'src/test.js',
        status: 'modified',
        additions: 1,
        deletions: 1,
        changes: 2,
        sha: '',
        blob_url: '',
        raw_url: '',
        contents_url: ''
      }
    ];
    const fetchedAnnotations: FetchedAnnotation[] = [
      {
        fullPath: 'c:/src/test.js',
        line: 0,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        gateId: 0
      },
      {
        fullPath: 'HIE://project/branch/src/jest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        gateId: 0
      },
      {
        fullPath: 'HIE://project/branch/src/zest.js',
        line: 2,
        level: 1,
        category: 'test',
        type: 'test',
        rule: 'test',
        msg: 'test',
        count: 1,
        supp: false,
        instanceName: 'test',
        gateId: 0
      }
    ];

    const expected = [
      { ...fetchedAnnotations[1], postable: false, path: 'src/jest.js', displayCount: '' },
      { ...fetchedAnnotations[2], postable: false, path: 'src/zest.js', displayCount: '' },
      { ...fetchedAnnotations[0], postable: true, path: 'src/test.js', displayCount: '' }
    ];

    const response = groupAndExtendAnnotations(fetchedAnnotations, changedFiles);

    expect(response).toEqual(expected);
  });
});
