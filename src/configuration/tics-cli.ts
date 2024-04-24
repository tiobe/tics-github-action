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
    this.project = getInput('projectName');
    this.branchname = getInput('branchName');
    this.branchdir = getInput('branchDir');
    this.cdtoken = getInput('clientData');
    this.codetype = getInput('codetype');
    this.calc = this.getCalc(getInput('calc'), mode);
    this.nocalc = getInput('nocalc');
    this.norecalc = getInput('norecalc');
    this.recalc = getInput('recalc');
    this.tmpdir = getInput('tmpDir');
    this.additionalFlags = getInput('additionalFlags');

    this.validateCliOptions(this, mode);
  }

  readonly cliOptions: CliOption[] = [
    {
      action: 'projectName',
      cli: 'project',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'branchDir',
      cli: 'branchdir',
      modes: [Mode.QSERVER]
    },
    {
      action: 'branchName',
      cli: 'branchname',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'clientData',
      cli: 'cdtoken',
      modes: [Mode.CLIENT]
    },
    {
      action: 'codetype',
      cli: 'codetype',
      modes: [Mode.CLIENT]
    },
    {
      action: 'calc',
      cli: 'calc',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'nocalc',
      cli: 'nocalc',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'norecalc',
      cli: 'norecalc',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'recalc',
      cli: 'recalc',
      modes: [Mode.CLIENT, Mode.QSERVER]
    },
    {
      action: 'tmpDir',
      cli: 'tmpdir',
      modes: [Mode.CLIENT, Mode.QSERVER, Mode.DIAGNOSTIC]
    },
    {
      action: 'additionalFlags',
      modes: [Mode.CLIENT, Mode.QSERVER, Mode.DIAGNOSTIC]
    }
  ];

  /**
   * Get the calc option or the default if not set by the user
   * @returns the calc option set by user or thedefault.
   */
  getCalc(input: string, mode: Mode): string {
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
  validateCliOptions(cli: TicsCli, mode: Mode) {
    // validate project
    if (mode === Mode.QSERVER) {
      if (cli.project === 'auto') {
        throw Error(`Running TICS with project 'auto' is not possible with QServer`);
      }
    }

    for (const option of this.cliOptions) {
      const key = option.cli as keyof TicsCli;
      if (cli[key] !== '' && !option.modes.includes(mode)) {
        logger.warning(`Parameter '${option.action}' is not applicable to mode '${mode}' and will therefore not be used`);
      }
    }
  }
}
