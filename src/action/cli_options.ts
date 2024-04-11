import { Mode } from '../helper/enums';

export interface CliOption {
  action: string;
  cli?: string;
  modes: Mode[];
}

export const CliOptions: CliOption[] = [
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
