import { ChangedFile } from './github/interfaces';

export interface ChangedFiles {
  files: ChangedFile[];
  path: string;
}
