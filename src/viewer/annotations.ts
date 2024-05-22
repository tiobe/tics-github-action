import { ticsConfig } from '../configuration/config';
import { AnnotationApiLink, ExtendedAnnotation, AnnotationResponse, Annotation } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryErrorMessage } from '../helper/response';
import { httpClient } from './http-client';

/**
 * Gets the annotations from the TICS viewer.
 * @param apiLinks annotationsApiLinks url.
 * @returns TICS annotations.
 */
export async function getAnnotations(apiLinks: AnnotationApiLink[]): Promise<ExtendedAnnotation[]> {
  const annotations: ExtendedAnnotation[] = [];
  logger.header('Retrieving annotations.');

  for (const [index, link] of apiLinks.entries()) {
    const annotationsUrl = new URL(`${ticsConfig.baseUrl}/${link.url}`);

    const fields = annotationsUrl.searchParams.get('fields');
    const requiredFields = 'default,ruleHelp,synopsis';
    if (fields !== null) {
      annotationsUrl.searchParams.set('fields', fields + ',' + requiredFields);
    } else {
      annotationsUrl.searchParams.append('fields', requiredFields);
    }

    logger.debug(`From: ${annotationsUrl.href}`);

    try {
      const response = await httpClient.get<AnnotationResponse>(annotationsUrl.href);

      response.data.data.forEach((annotation: Annotation) => {
        const extendedAnnotation: ExtendedAnnotation = {
          ...annotation,
          instanceName: response.data.annotationTypes ? response.data.annotationTypes[annotation.type].instanceName : annotation.type
        };
        extendedAnnotation.gateId = index;

        logger.debug(JSON.stringify(extendedAnnotation));
        annotations.push(extendedAnnotation);
      });
    } catch (error: unknown) {
      const message = getRetryErrorMessage(error);
      throw Error(`An error occured when trying to retrieve annotations: ${message}`);
    }
  }

  if (apiLinks.length > 0) {
    logger.info('Retrieved all annotations.');
  } else {
    logger.info('No annotations to retrieve. Skipping this step.');
  }

  return annotations;
}
