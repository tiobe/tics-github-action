import {
  ArtifactClient,
  DeleteArtifactResponse,
  DownloadArtifactOptions,
  DownloadArtifactResponse,
  FindOptions,
  GetArtifactResponse,
  ListArtifactsOptions,
  ListArtifactsResponse,
  UploadArtifactOptions,
  UploadArtifactResponse
} from '@actions/artifact';
import { Dirent } from 'fs';

export class MockArtifactClient implements ArtifactClient {
  uploadArtifact(name: string, files: string[], rootDirectory: string, options?: UploadArtifactOptions): Promise<UploadArtifactResponse> {
    const response: UploadArtifactResponse = {
      size: files.length,
      id: name.length,
      digest: rootDirectory
    };
    return new Promise(resolve => {
      resolve(response);
    });
  }
  listArtifacts(options?: ListArtifactsOptions & FindOptions): Promise<ListArtifactsResponse> {
    throw new Error('Method not implemented.');
  }
  getArtifact(artifactName: string, options?: FindOptions): Promise<GetArtifactResponse> {
    throw new Error('Method not implemented.');
  }
  downloadArtifact(artifactId: number, options?: DownloadArtifactOptions & FindOptions): Promise<DownloadArtifactResponse> {
    throw new Error('Method not implemented.');
  }
  deleteArtifact(artifactName: string, options?: FindOptions): Promise<DeleteArtifactResponse> {
    throw new Error('Method not implemented.');
  }
}

export class MockDirent implements Dirent {
  file: boolean;
  name: string;
  path: string;
  parentPath: string;

  constructor(file: boolean, name: string, path: string) {
    this.file = file;
    this.name = name;
    this.path = path;
    this.parentPath = path;
  }

  isFile(): boolean {
    return this.file;
  }
  isDirectory(): boolean {
    return !this.file;
  }
  isBlockDevice(): boolean {
    return false;
  }
  isCharacterDevice(): boolean {
    return false;
  }
  isSymbolicLink(): boolean {
    return false;
  }
  isFIFO(): boolean {
    return false;
  }
  isSocket(): boolean {
    return false;
  }
}
