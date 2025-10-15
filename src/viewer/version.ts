import { getRetryErrorMessage, getRetryMessage } from '../helper/response';
import { VersionResponse } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { joinUrl } from '../helper/url';
import { httpClient } from './http-client';
import { ticsConfig } from '../configuration/config';
import { coerce, satisfies, SemVer } from 'semver';

export enum ViewerFeature {
  GITHUB_ACTION = '2022.4.0',
  NEW_ANNOTATIONS = '2025.1.8'
}

class ViewerVersion {
  private viewerVersion?: SemVer;

  /**
   * Gets the version of the TICS viewer used.
   * @returns Version of the used TICS viewer.
   */
  async viewerSupports(feature: ViewerFeature): Promise<boolean> {
    if (this.viewerVersion !== undefined) {
      logger.debug(`Getting version from cache: ${this.viewerVersion.version}`);
      return satisfies(this.viewerVersion, `>=${feature}`);
    }

    const viewerVersion = await this.fetchViewerVersion();
    const cleanVersion = coerce(viewerVersion.version);

    if (cleanVersion !== null) {
      logger.info(`Found viewer with version: ${cleanVersion.version}`);
      this.viewerVersion = cleanVersion;
    } else {
      throw Error(`Could not compute version received by the viewer, got: ${viewerVersion.version}.`);
    }

    return satisfies(cleanVersion, `>=${feature}`);
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
}
export const viewerVersion = new ViewerVersion();
