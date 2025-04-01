import * as core from '@actions/core';
import { AnnotationProperties } from '@actions/core';
import { escapeRegExp } from 'lodash';

class Logger {
  called = '';
  matched: string[] = [];

  private secretsFilter: string[] = [];

  setSecretsFilter(secretsFilter: string[]): void {
    this.secretsFilter = secretsFilter;
  }

  /**
   * Uses core.info to print to the console with a purple color.
   * @param string
   */
  header(string: string): void {
    const output = this.maskOutput(string);
    if (output) {
      this.addNewline('header');
      core.info(`\u001b[34m${output}`);
    }

    this.called = 'header';
  }

  /**
   * Uses core.info to print to the console.
   * @param string
   */
  info(string: string): void {
    const output = this.maskOutput(string);
    if (output) {
      core.info(output);
    }

    this.called = 'info';
  }

  /**
   * Uses core.debug to print to the console.
   * @param string
   */
  debug(string: string): void {
    const output = this.maskOutput(string);
    if (output) {
      core.debug(output);
    }

    this.called = 'debug';
  }

  /**
   * Uses core.notice to print to the console.
   * @param string
   * @param properties (optional) properties to annotate to file
   */
  notice(string: string, properties?: AnnotationProperties): void {
    const output = this.maskOutput(string);
    if (output) {
      core.notice(output, properties);
    }

    this.called = 'notice';
  }

  /**
   * Uses core.warning to print to the console.
   * @param string
   * @param properties (optional) properties to annotate to file
   */
  warning(string: string, properties?: AnnotationProperties): void {
    const output = this.maskOutput(string);
    if (output) {
      core.warning(`\u001b[33m${output}`, properties);
    }

    this.called = 'warning';
  }

  /**
   * Uses core.error to print to the console with a red color.
   * @param error
   * @param properties (optional) properties to annotate to file
   */
  error(error: string, properties?: AnnotationProperties): void {
    const output = this.maskOutput(error);
    if (output) {
      this.addNewline('error');
      core.error(`\u001b[31m${output}`, properties);
    }

    this.called = 'error';
  }

  /**
   * Uses core.setFailed to exit with error.
   * @param error
   */
  setFailed(error: string): void {
    const output = this.maskOutput(error);
    if (output) {
      this.addNewline('error');
      core.setFailed(`\u001b[31m${output}`);
    }

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
  maskOutput(data: string): string | undefined {
    // Filter JAVA_OPTIONS
    if (data.includes('Picked up') && data.includes('JAVA') && data.includes('OPTIONS')) {
      return undefined;
    }

    // Find secrets value and add them to this.matched
    this.secretsFilter.forEach((secret: string) => {
      const safeSecret = escapeRegExp(secret);
      if (data.match(new RegExp(safeSecret, 'gi'))) {
        const regex = new RegExp(`\\w*${safeSecret}\\w*(?:[ \\t]*[:=>]*[ \\t]*)(.*)`, 'gi');
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
