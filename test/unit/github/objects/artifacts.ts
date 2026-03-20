import * as Artifact from '@actions/artifact';
import * as ArtifactV1 from '@actions/artifact-v1';
import { Dirent } from 'fs';

export class MockArtifactClient implements Artifact.ArtifactClient {
  uploadArtifact(
    name: string,
    files: string[],
    rootDirectory: string,
    options?: Artifact.UploadArtifactOptions
  ): Promise<Artifact.UploadArtifactResponse> {
    const response: Artifact.UploadArtifactResponse = {
      size: files.length,
      id: name.length,
      digest: rootDirectory
    };
    return new Promise(resolve => {
      resolve(response);
    });
  }
  listArtifacts(options?: Artifact.ListArtifactsOptions & Artifact.FindOptions): Promise<Artifact.ListArtifactsResponse> {
    throw new Error('Method not implemented.');
  }
  getArtifact(artifactName: string, options?: Artifact.FindOptions): Promise<Artifact.GetArtifactResponse> {
    throw new Error('Method not implemented.');
  }
  downloadArtifact(
    artifactId: number,
    options?: Artifact.DownloadArtifactOptions & Artifact.FindOptions
  ): Promise<Artifact.DownloadArtifactResponse> {
    throw new Error('Method not implemented.');
  }
  deleteArtifact(artifactName: string, options?: Artifact.FindOptions): Promise<Artifact.DeleteArtifactResponse> {
    throw new Error('Method not implemented.');
  }
}

export class MockArtifactClientV1 implements ArtifactV1.ArtifactClient {
  uploadArtifact(name: string, files: string[], rootDirectory: string, options?: ArtifactV1.UploadOptions): Promise<ArtifactV1.UploadResponse> {
    const response: ArtifactV1.UploadResponse = {
      size: files.length,
      artifactName: name,
      artifactItems: files,
      failedItems: []
    };
    return new Promise(resolve => {
      resolve(response);
    });
  }
  downloadArtifact(name: string, path?: string, options?: ArtifactV1.DownloadOptions): Promise<ArtifactV1.DownloadResponse> {
    throw new Error('Method not implemented.');
  }
  downloadAllArtifacts(path?: string): Promise<ArtifactV1.DownloadResponse[]> {
    throw new Error('Method not implemented.');
  }
}

export class MockDirent implements Dirent<NonSharedBuffer> {
  file: boolean;
  name: NonSharedBuffer;
  path: string;
  parentPath: string;

  constructor(file: boolean, name: string, path: string) {
    this.file = file;
    this.name = Buffer.from(name);
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
