import { getRetryErrorMessage, getRetryMessage } from '../helper/response';
import { VersionResponse } from './interfaces';
import { logger } from '../helper/logger';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';
import { ticsConfig } from '../configuration/config';

export enum ViewerFeature {
  GITHUB_ACTION = '2022.4.0',
  NEW_ANNOTATIONS = '2025.1.8',
  PROJECT_CREATION = '2026.1.2.54221'
}

class ViewerVersion {
  private viewerVersion?: string;

  async viewerSupports(feature: ViewerFeature): Promise<boolean> {
    if (this.viewerVersion !== undefined) {
      logger.debug(`Getting version from cache: ${this.viewerVersion}`);
      return this.satisfies(this.viewerVersion, feature);
    }

    const viewerVersion = await this.fetchViewerVersion();
    if (!viewerVersion.fullVersion) {
      throw Error(`Viewer returned empty version.`);
    }
    this.viewerVersion = viewerVersion.fullVersion;
    logger.info(`Found viewer with version: ${this.viewerVersion}`);

    return this.satisfies(this.viewerVersion, feature);
  }

  private async fetchViewerVersion(): Promise<VersionResponse> {
    const getViewerVersionUrl = joinUrl(ticsConfig.baseUrl, '/api/v1/version');

    try {
      logger.header('Retrieving the viewer version');
      logger.debug(`From ${getViewerVersionUrl}`);
      const response = await httpClient.get<VersionResponse>(getViewerVersionUrl);
      logger.info(getRetryMessage(response, 'Retrieved the Viewer Version.'));
      logger.debug(JSON.stringify(response));
      return response.data;
    } catch (error: unknown) {
      const message = getRetryErrorMessage(error);
      throw Error(`There was an error retrieving the Viewer version: ${message}`);
    }
  }

  /**
   * Checks if version given is at least as high as the minimum version given.
   */
  private satisfies(version: string, minimum: string): boolean {
    const v = this.parseVersion(version);
    const m = this.parseVersion(minimum);
    const len = Math.max(v.length, m.length);

    for (let i = 0; i < len; i++) {
      const a = v[i] ?? 0;
      const b = m[i] ?? 0;
      if (a !== b) return a > b;
    }
    return true;
  }

  private parseVersion(version: string): number[] {
    return version
      .replace(/^[^\d]+|[^\d]+$/g, '')
      .split('.')
      .map(Number);
  }
}
export const viewerVersion = new ViewerVersion();
