import * as core from '@actions/core';
import { ticsConfig } from '../github/configuration';

export default class Logger {
  private static _instance: Logger;
  called: string = '';

  public static get Instance() {
    return this._instance || (this._instance = new this());
  }

  /**
   * Uses core.info to print to the console with a purple color.
   * @param {string} string
   */
  header(string: string) {
    this.addNewline('header');
    core.info(`\u001b[35m${string}`);
    this.called = 'header';
  }

  /**
   * Uses core.info to print to the console.
   *
   * @param {string} string
   */
  info(string: string) {
    if (ticsConfig.logLevel !== 'none') {
      core.info(string);
      this.called = 'info';
    }
  }

  /**
   * Uses core.debug to print to the console.
   *
   * @param {string} string
   */
  debug(string: string) {
    if (ticsConfig.logLevel === 'debug') {
      core.debug(string);
      this.called = 'debug';
    }
  }

  /**
   * Uses core.warning to print to the console.
   *
   * @param {string} string
   */
  warning(string: string) {
    core.warning(`\u001b[33m${string}`);
    this.called = 'warning';
  }

  /**
   * Uses core.error to print to the console with a red color.
   *
   * @param {any} error
   */
  error(error: any) {
    this.addNewline('error');
    core.error(`\u001b[31m${error}`);
    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   *
   * @param {any} error
   */
  setFailed(error: any) {
    this.addNewline('error');
    core.setFailed(`\u001b[31m${error}`);
    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   *
   * @param {any} error
   */
  exit(error: any) {
    this.addNewline('error');
    core.setFailed(`\u001b[31m${error}`);
    process.exit(1);
  }

  /**
   * Add newline above header, error and setFailed if the logger has been called before.
   * @param {string} type the type of call to add a newline for.
   */
  addNewline(type: string) {
    if (this.called) {
      if (type === 'header') {
        core.info('');
      }
    }
  }
}
