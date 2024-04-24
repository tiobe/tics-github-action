import * as core from '@actions/core';
import { AnnotationProperties } from '@actions/core';

import { actionConfig } from '../configuration/_config';

class Logger {
  called = '';
  matched: string[] = [];

  /**
   * Uses core.info to print to the console with a purple color.
   * @param string
   */
  header(string: string): void {
    string = this.maskSecrets(string);
    this.addNewline('header');
    core.info(`\u001b[34m${string}`);
    this.called = 'header';
  }

  /**
   * Uses core.info to print to the console.
   * @param string
   */
  info(string: string): void {
    string = this.maskSecrets(string);
    core.info(string);
    this.called = 'info';
  }

  /**
   * Uses core.debug to print to the console.
   * @param string
   */
  debug(string: string): void {
    string = this.maskSecrets(string);
    core.debug(string);
    this.called = 'debug';
  }

  /**
   * Uses core.notice to print to the console.
   * @param string
   * @param properties (optional) properties to annotate to file
   */
  notice(string: string, properties?: AnnotationProperties): void {
    string = this.maskSecrets(string);
    core.notice(string, properties);
    this.called = 'notice';
  }

  /**
   * Uses core.warning to print to the console.
   * @param string
   * @param properties (optional) properties to annotate to file
   */
  warning(string: string, properties?: AnnotationProperties): void {
    string = this.maskSecrets(string);
    core.warning(`\u001b[33m${string}`, properties);
    this.called = 'warning';
  }

  /**
   * Uses core.error to print to the console with a red color.
   * @param error
   * @param properties (optional) properties to annotate to file
   */
  error(error: string, properties?: AnnotationProperties): void {
    error = this.maskSecrets(error);
    this.addNewline('error');
    core.error(`\u001b[31m${error}`, properties);
    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   * @param error
   */
  setFailed(error: string): void {
    error = this.maskSecrets(error);
    this.addNewline('error');
    core.setFailed(`\u001b[31m${error}`);
    this.called = 'error';
  }

  /**
   * Add newline above header, error and setFailed if the logger has been called before.
   * @param type the type of call to add a newline for.
   */
  addNewline(type: string): void {
    if (this.called) {
      if (type === 'header') {
        core.info('');
      }
    }
  }

  /**
   * Masks the secrets defined in ticsConfig secretsFilter from the
   * @param data string that is going to be logged to the console.
   * @returns the message with the secrets masked.
   */
  maskSecrets(data: string): string {
    // Find secrets value and add them to this.matched
    actionConfig.secretsFilter.forEach((secret: string) => {
      if (data.match(new RegExp(secret, 'gi'))) {
        const regex = new RegExp(`\\w*${secret}\\w*(?:[ \\t]*[:=>]*[ \\t]*)(.*)`, 'gi');
        let match: RegExpExecArray | null = null;
        while ((match = regex.exec(data))) {
          if (match[1] !== '') {
            this.matched.push(match[1]);
          }
        }
      }
    });
    // Filter out the values from the output
    this.matched.forEach(match => {
      data = data.replaceAll(match, '***');
    });
    return data;
  }
}

export const logger: Logger = new Logger();
