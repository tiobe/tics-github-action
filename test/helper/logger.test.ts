import * as core from '@actions/core';
import { ticsConfig } from '../../src/configuration';
import Logger from '../../src/helper/logger';

describe('info', () => {
  test('Should call core.info on header', () => {
    const info = jest.spyOn(core, 'info');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.header('string');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('\u001b[35mstring');
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('header');
    expect(Logger.Instance.called).toEqual('header');
  });

  test('Should call core.info on info', () => {
    const info = jest.spyOn(core, 'info');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.info('string');

    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('string');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(Logger.Instance.called).toEqual('info');
  });

  test('Should not call core.info on info if logLevel is none', () => {
    ticsConfig.logLevel = 'none';
    const info = jest.spyOn(core, 'info');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.info('string');

    expect(info).toHaveBeenCalledTimes(0);
    expect(addNewline).toHaveBeenCalledTimes(0);
  });
});

describe('debug', () => {
  test('Should call core.debug on debug', () => {
    const debug = jest.spyOn(core, 'debug');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.debug('string');

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('string');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(Logger.Instance.called).toEqual('debug');
  });
});

describe('warning', () => {
  test('Should call core.warning on warning', () => {
    const debug = jest.spyOn(core, 'warning');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.warning('string');

    expect(debug).toHaveBeenCalledTimes(1);
    expect(debug).toHaveBeenCalledWith('\u001b[33mstring');
    expect(addNewline).toHaveBeenCalledTimes(0);
    expect(Logger.Instance.called).toEqual('warning');
  });
});

describe('error', () => {
  test('Should call core.error on error', () => {
    const error = jest.spyOn(core, 'error');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.error('error');

    expect(error).toHaveBeenCalledTimes(1);
    expect(error).toHaveBeenCalledWith('\u001b[31merror');
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(Logger.Instance.called).toEqual('error');
  });
});

describe('setFailed', () => {
  test('Should call core.setFailed on setFailed', () => {
    const setFailed = jest.spyOn(core, 'setFailed');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.setFailed('error');

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith('\u001b[31merror');
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
    expect(Logger.Instance.called).toEqual('error');
  });
});

describe('exit', () => {
  test('Should call core.setFailed on exit', () => {
    jest.spyOn(process, 'exit').mockImplementationOnce(() => undefined as never);
    const setFailed = jest.spyOn(core, 'setFailed');
    const addNewline = jest.spyOn(Logger.Instance, 'addNewline');

    Logger.Instance.exit('error');

    expect(setFailed).toHaveBeenCalledTimes(1);
    expect(setFailed).toHaveBeenCalledWith('\u001b[31merror');
    expect(addNewline).toHaveBeenCalledTimes(1);
    expect(addNewline).toHaveBeenCalledWith('error');
  });
});
