import * as core from '@actions/core';
import { logger } from '../../../src/helper/logger';

let infoSpy: jest.SpyInstance;
let debugSpy: jest.SpyInstance;
let noticeSpy: jest.SpyInstance;
let errorSpy: jest.SpyInstance;
let warningSpy: jest.SpyInstance;
let setFailedSpy: jest.SpyInstance;

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
  test('Should call core.info on info', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.info('string');

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith('string');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('info');
  });

  test('Should call core.info on header', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.info('error');
    logger.header('string');

    expect(infoSpy).toHaveBeenCalledTimes(2); // once for header, once for newline
    expect(infoSpy).toHaveBeenCalledWith(expect.stringContaining('string'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('header');
    expect(logger.called).toEqual('header');
  });
});

describe('debug', () => {
  test('Should call core.debug on debug', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.setSecretsFilter(['token']);
    logger.debug('string token secret');

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith('string token ***');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('debug');
  });
});

describe('notice', () => {
  test('Should call core.notice on notice', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.notice('string');

    expect(noticeSpy).toHaveBeenCalledTimes(1);
    expect(noticeSpy).toHaveBeenCalledWith('string', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('notice');
  });
});

describe('warning', () => {
  test('Should call core.warning on warning', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.warning('string');

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy).toHaveBeenCalledWith('\u001b[33mstring', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('warning');
  });
});

describe('error', () => {
  test('Should call core.error on error', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.error('error');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('error'), undefined);
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toEqual('error');
  });
});

describe('setFailed', () => {
  test('Should call core.setFailed on setFailed', () => {
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.setFailed('error');

    expect(setFailedSpy).toHaveBeenCalledTimes(1);
    expect(setFailedSpy).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toEqual('error');
  });
});

describe('maskOutput', () => {
  test('Should filter out JAVA options', () => {
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
