export enum Status {
  'FAILED' = 'FAILED',
  'PASSED' = 'PASSED',
  'WARNING' = 'WARNING',
  'SKIPPED' = 'SKIPPED'
}

export enum Events {
  'APPROVE' = 'APPROVE',
  'COMMENT' = 'COMMENT',
  'REQUEST_CHANGES' = 'REQUEST_CHANGES'
}

export enum ChangeType {
  ADDED = 'added',
  CHANGED = 'changed',
  COPIED = 'copied',
  DELETED = 'removed',
  MODIFIED = 'modified',
  RENAMED = 'renamed'
}
