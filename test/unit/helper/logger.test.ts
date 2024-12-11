import { describe, expect, it, jest } from '@jest/globals';
import * as core from '@actions/core';
import { logger } from '../../../src/helper/logger';

let infoSpy: jest.SpiedFunction<typeof core.info>;
let debugSpy: jest.SpiedFunction<typeof core.debug>;
let noticeSpy: jest.SpiedFunction<typeof core.notice>;
let errorSpy: jest.SpiedFunction<typeof core.error>;
let warningSpy: jest.SpiedFunction<typeof core.warning>;
let setFailedSpy: jest.SpiedFunction<typeof core.setFailed>;

beforeEach(() => {
  infoSpy = jest.spyOn(core, 'info');
  debugSpy = jest.spyOn(core, 'debug');
  noticeSpy = jest.spyOn(core, 'notice');
  errorSpy = jest.spyOn(core, 'error');
  warningSpy = jest.spyOn(core, 'warning');
  setFailedSpy = jest.spyOn(core, 'setFailed');
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('info', () => {
  it('Should call core.info on info', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.info('string');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith('string');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toBe('info');
  });

  it('Should call core.info on header', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.info('error');
    logger.header('string');

    expect(infoSpy).toHaveBeenCalledTimes(2); // once for header, once for newline
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('string'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('header');
    expect(logger.called).toBe('header');
  });
});

describe('debug', () => {
  it('Should call core.debug on debug', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.setSecretsFilter(['token']);
    logger.debug('string token secret');

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith('string token ***');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toBe('debug');
  });
});

describe('notice', () => {
  it('Should call core.notice on notice', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.notice('string');

    expect(noticeSpy).toHaveBeenCalledTimes(1);
    expect(noticeSpy).toHaveBeenCalledWith('string', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toBe('notice');
  });
});

describe('warning', () => {
  it('Should call core.warning on warning', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.warning('string');

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith('\u001b[33mstring', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toBe('warning');
  });
});

describe('error', () => {
  it('Should call core.error on error', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.error('error');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error'), undefined);
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toBe('error');
  });
});

describe('setFailed', () => {
  it('Should call core.setFailed on setFailed', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.setFailed('error');

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toBe('error');
  });
});

describe('maskOutput', () => {
  it('Should filter out JAVA options', () => {
    const message = 'Picked up JAVA_OPTIONS testing once';

    logger.info(message);
    logger.notice(message);
    logger.debug(message);
    logger.warning(message);
    logger.error(message);
    logger.setFailed(message);

    expect(infoSpy).toHaveBeenCalledTimes(0);
    expect(noticeSpy).toHaveBeenCalledTimes(0);
    expect(debugSpy).toHaveBeenCalledTimes(0);
    expect(warningSpy).toHaveBeenCalledTimes(0);
    expect(errorSpy).toHaveBeenCalledTimes(0);
    expect(setFailedSpy).toHaveBeenCalledTimes(0);
  });
});
