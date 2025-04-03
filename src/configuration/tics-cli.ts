import { getInput } from '@actions/core';

import { CliOption } from './interfaces';
import { Mode } from './tics';
import { logger } from '../helper/logger';

export class TicsCli {
  readonly project: string;
  readonly branchname: string;
  readonly branchdir: string;
  readonly cdtoken: string;
  readonly codetype: string;
  readonly calc: string;
  readonly nocalc: string;
  readonly norecalc: string;
  readonly recalc: string;
  readonly tmpdir: string;
  readonly additionalFlags: string;

  constructor(mode: Mode) {
    this.project = getInput('project');
    this.branchname = getInput('branchname');
    this.branchdir = getInput('branchdir');
    this.cdtoken = getInput('cdtoken');
    this.codetype = getInput('codetype');
    this.calc = this.getCalc(getInput('calc'), mode);
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');
    this.recalc = getInput('recalc');
    this.tmpdir = getInput('tmpdir');
    this.additionalFlags = getInput('additionalFlags');

    this.validateCliOptions(this, mode);

    // if no branchdir has been set for QServer, set it to the GitHub workspace.
    if (mode === Mode.QSERVER && this.branchdir === '') {
      if (!process.env.GITHUB_WORKSPACE) {
        throw Error('Parameter `branchdir` is not set and environment variable `GITHUB_WORKSPACE` is empty. TICSQServer cannot run.');
      }
      this.branchdir = process.env.GITHUB_WORKSPACE;
    }
  }

  /**
   * Get the calc option or the default if not set by the user
   * @returns the calc option set by user or thedefault.
   */
  private getCalc(input: string, mode: Mode): string {
    if (input) {
      return input;
    } else if (mode === Mode.CLIENT) {
      return 'GATE';
    } else {
      return '';
    }
  }

  /**
   * Validates if the given cli options are valid.
   * @throws error if project auto is used incorrectly.
   */
  private validateCliOptions(cli: TicsCli, mode: Mode) {
    // validate project
    if (mode === Mode.QSERVER) {
      if (cli.project === 'auto') {
        throw Error(`Running TICS with project 'auto' is not possible with QServer`);
      }
    }

    for (const option of CliOptions) {
      const key = option.action as keyof TicsCli;
      if (cli[key] !== '' && !option.modes.includes(mode)) {
        logger.warning(`Parameter '${option.action}' is not applicable to mode '${mode}' and will therefore not be used`);
      }
    }
  }
}

export const CliOptions: CliOption[] = [
  {
    action: 'project',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'branchdir',
    modes: [Mode.QSERVER]
  },
  {
    action: 'branchname',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'cdtoken',
    modes: [Mode.CLIENT]
  },
  {
    action: 'codetype',
    modes: [Mode.CLIENT]
  },
  {
    action: 'calc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'nocalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'norecalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'recalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    action: 'tmpdir',
    modes: [Mode.CLIENT, Mode.QSERVER, Mode.DIAGNOSTIC]
  },
  {
    action: 'additionalFlags',
    modes: [Mode.CLIENT, Mode.QSERVER, Mode.DIAGNOSTIC]
  }
];
