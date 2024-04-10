export enum Status {
  'FAILED' = 'FAILED',
  'PASSED' = 'PASSED',
  'PASSED_WITH_WARNING' = 'PASSED_WITH_WARNING',
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

export enum Mode {
  CLIENT = 'client',
  QSERVER = 'qserver',
  DIAGNOSTIC = 'diagnostic'
}
