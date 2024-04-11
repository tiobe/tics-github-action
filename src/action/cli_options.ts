import { Mode } from '../helper/enums';

export const CLI_OPTIONS = [
  {
    name: 'projectName',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'branchName',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'branchDir',
    modes: [Mode.QSERVER]
  },
  {
    name: 'clientData',
    modes: [Mode.CLIENT]
  },
  {
    name: 'codetype',
    modes: [Mode.CLIENT]
  },
  {
    name: 'calc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'nocalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'norecalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'recalc',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'tmpDir',
    modes: [Mode.CLIENT, Mode.QSERVER]
  },
  {
    name: 'additionalFlags',
    modes: [Mode.CLIENT, Mode.QSERVER]
  }
];
