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
    this.tmpdir = getInput('tmpdir');
    this.additionalFlags = getInput('additionalFlags');

    [this.calc, this.recalc] = this.getCalcAndRecalc(getInput('calc'), getInput('recalc'), mode);
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');

    this.validateCliOptions(this, mode);
  }

  /**
   * Get the calc option or the default if not set by the user
   * @returns the calc option set by user or thedefault.
   */
  private getCalcAndRecalc(calc: string, recalc: string, mode: Mode): [string, string] {
    switch (mode) {
      case Mode.DIAGNOSTIC:
        return [calc, recalc];
      case Mode.CLIENT:
        if (calc === '' && recalc === '') {
          calc = 'GATE';
        }
        return [calc, recalc];
      case Mode.QSERVER:
        if (recalc !== '') {
          recalc = this.addBeginEnd(recalc);
        } else if (calc !== '') {
          calc = this.addBeginEnd(calc);
        }

        return [calc, recalc];
    }
  }

  /**
   * In case of QServer runs, BEGIN and END need to be added if they are not included.
   * @param input (re)calc option to add BEGIN and END to.
   * @returns the input with BEGIN and END added if needed.
   */
  private addBeginEnd(input: string) {
    if (!input.includes('BEGIN,')) {
      input = 'BEGIN,' + input;
    }
    if (!input.includes(',END')) {
      input = input + ',END';
    }
    return input;
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
