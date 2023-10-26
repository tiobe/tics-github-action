import { ArtifactClient, DownloadOptions, DownloadResponse, UploadOptions, UploadResponse } from '@actions/artifact';
import { Dirent } from 'fs';

export class MockArtifactClient implements ArtifactClient {
  failedItems: string[];
  constructor(failedItems: string[]) {
    this.failedItems = failedItems;
  }

  async uploadArtifact(name: string, files: string[], rootDirectory: string, options?: UploadOptions | undefined): Promise<UploadResponse> {
    const uploadResponse = {
      artifactName: name,
      artifactItems: files,
      size: files.length,
      failedItems: this.failedItems
    };

    return uploadResponse;
  }
  async downloadArtifact(name: string, path?: string | undefined, options?: DownloadOptions | undefined): Promise<DownloadResponse> {
    throw new Error('Method not implemented.');
  }
  async downloadAllArtifacts(path?: string | undefined): Promise<DownloadResponse[]> {
    throw new Error('Method not implemented.');
  }
}

export class MockDirent implements Dirent {
  file: boolean;
  name: string;
  path: string;

  constructor(file: boolean, name: string, path: string) {
    this.file = file;
    this.name = name;
    this.path = path;
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
