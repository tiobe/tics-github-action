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
        if (!annotation.line) {
          annotation.line = 1;
          const rule = annotation.rule ? ` ${annotation.rule} ` : ' ';
          logger.notice(
            `No line number reported for ${annotation.type} violation${rule}in file ${annotation.fullPath}. Reporting the annotation on line 1.`
          );
        }

        // In case complexity is given, the annotation does not have a message (should be fixed in newer Viewers #34866).
        // Present in Viewers <= 2024.2.0
        if (annotation.complexity && !annotation.msg) {
          annotation.msg = `Function ${annotation.functionName ?? ''} has a complexity of ${annotation.complexity.toString()}`;
        }

        const extendedAnnotation: ExtendedAnnotation = {
          ...annotation,
          gateId: index,
          line: annotation.line,
          count: annotation.count ?? 1,
          instanceName: response.data.annotationTypes ? response.data.annotationTypes[annotation.type].instanceName : annotation.type
        };

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
