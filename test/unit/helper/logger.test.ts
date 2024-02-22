import * as core from '@actions/core';
import { ticsConfig } from '../../../src/configuration';
import { logger } from '../../../src/helper/logger';

describe('info', () => {
  test('Should call core.info on info', () => {
    const info = jest.spyOn(core, 'info');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.info('string');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('string');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('info');
  });

  test('Should call core.info on header', () => {
    const info = jest.spyOn(core, 'info');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.header('string');

    expect(info).toHaveBeenCalledTimes(2); // once for header, once for newline
    expect(info).toHaveBeenCalledWith(expect.stringContaining('string'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('header');
    expect(logger.called).toEqual('header');
  });
});

describe('debug', () => {
  test('Should call core.debug on debug', () => {
    const debug = jest.spyOn(core, 'debug');
    const addNewline = jest.spyOn(logger, 'addNewline');

    ticsConfig.secretsFilter = ['token'];
    logger.debug('string token secret');

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('string token ***');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('debug');
  });
});

describe('notice', () => {
  test('Should call core.notice on notice', () => {
    const debug = jest.spyOn(core, 'notice');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.notice('string');

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('string', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('notice');
  });
});

describe('warning', () => {
  test('Should call core.warning on warning', () => {
    const debug = jest.spyOn(core, 'warning');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.warning('string');

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('\u001b[33mstring', undefined);
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(logger.called).toEqual('warning');
  });
});

describe('error', () => {
  test('Should call core.error on error', () => {
    const error = jest.spyOn(core, 'error');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.error('error');

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('error'), undefined);
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toEqual('error');
  });
});

describe('setFailed', () => {
  test('Should call core.setFailed on setFailed', () => {
    const setFailed = jest.spyOn(core, 'setFailed');
    const addNewline = jest.spyOn(logger, 'addNewline');

    logger.setFailed('error');

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith(expect.stringContaining('error'));
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(logger.called).toEqual('error');
  });
});
