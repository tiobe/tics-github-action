import { PullRequestChangedFile } from '@octokit/graphql-schema';
import { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods';
import { ExtendedAnnotation } from '../viewer/interfaces.js';

export interface ChangedFile {
  sha?: string | null;
  filename: string;
  status: 'added' | 'changed' | 'copied' | 'removed' | 'modified' | 'renamed' | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url?: string;
  raw_url?: string;
  contents_url?: string;
  patch?: string;
  previous_filename?: string;
}

export interface RateLimit {
  rate: {
    limit: number;
    used: number;
    remaining: number;
    reset: number;
  };
}

export interface ChangedFilesQueryResponse {
  rateLimit: {
    remaining: number;
  };
  repository?: {
    pullRequest?: {
      files?: {
        totalCount: number;
        nodes?: PullRequestChangedFile[];
        pageInfo: {
          hasNextPage: boolean;
          endCursor?: string;
        };
      };
    };
  };
}

export interface ActionOutput {
  conditions: string[];
  annotations: ExtendedAnnotation[];
}

export type AnnotationLevel = 'notice' | 'warning' | 'failure';
export interface GithubAnnotation {
  path: string;
  start_line: number;
  end_line: number;
  start_column?: number;
  end_column?: number;
  annotation_level: AnnotationLevel;
  message: string;
  title?: string;
  raw_details?: string;
}

export type ReviewComment = RestEndpointMethodTypes['pulls']['listReviewComments']['response']['data'][number];
export type Comment = RestEndpointMethodTypes['issues']['listComments']['response']['data'][number];
export type CreateCheckRunParams = RestEndpointMethodTypes['checks']['create']['parameters'];
export type UpdateCheckRunParams = RestEndpointMethodTypes['checks']['update']['parameters'];
