import { ticsConfig } from '../configuration/config';
import { ChangedFile } from '../github/interfaces';
import { AnnotationApiLink, ExtendedAnnotation, AnnotationResponse, FetchedAnnotation } from '../helper/interfaces';
import { logger } from '../helper/logger';
import { getRetryErrorMessage } from '../helper/response';
import { httpClient } from './http-client';

/**
 * Gets the annotations from the TICS viewer.
 * @param apiLinks annotationsApiLinks url.
 * @returns TICS annotations.
 */
export async function getAnnotations(apiLinks: AnnotationApiLink[], changedFiles: ChangedFile[]): Promise<ExtendedAnnotation[]> {
  const annotations = await fetchAnnotations(apiLinks);
  return groupAndExtendAnnotations(annotations, changedFiles);
}

export async function fetchAnnotations(apiLinks: AnnotationApiLink[]): Promise<FetchedAnnotation[]> {
  logger.header('Retrieving annotations.');
  const annotations: FetchedAnnotation[] = [];

  if (apiLinks.length === 0) {
    logger.info('No annotations to retrieve. Skipping this step.');
    return [];
  }

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

      for (const annotation of response.data.data) {
        const fetched: FetchedAnnotation = {
          ...annotation,
          gateId: index,
          line: annotation.line ?? 1,
          count: annotation.count ?? 1,
          instanceName: response.data.annotationTypes ? response.data.annotationTypes[annotation.type].instanceName : annotation.type
        };

        // In case complexity is given, the annotation does not have a message (should be fixed in newer Viewers #34866).
        // Present in Viewers <= 2024.2.0
        if (annotation.complexity && !annotation.msg) {
          fetched.msg = `Function ${annotation.functionName ?? ''} has a complexity of ${annotation.complexity.toString()}`;
        }

        annotations.push(fetched);
      }
    } catch (error: unknown) {
      const message = getRetryErrorMessage(error);
      throw Error(`An error occured when trying to retrieve annotations: ${message}`);
    }
  }

  logger.info('Retrieved all annotations.');
  return annotations;
}

/**
 * Groups and extend the annotations.
 * @param annotations Annotations retrieved from the viewer.
 * @param changedFiles List of files changed in the pull request.
 * @returns List of the review comments.
 */
export function groupAndExtendAnnotations(annotations: FetchedAnnotation[], changedFiles: ChangedFile[]): ExtendedAnnotation[] {
  const sortedAnnotations = sortAnnotations(annotations);
  const groupedAnnotations = groupAnnotations(sortedAnnotations, changedFiles);

  return groupedAnnotations
    .filter(a => a.blocking?.state !== 'no')
    .map(a => {
      const annotation: ExtendedAnnotation = {
        ...a,
        displayCount: a.count === 1 ? '' : `(${a.count.toString()}x) `,
        postable: changedFiles.find(c => a.fullPath.includes(c.filename)) !== undefined
      };

      logger.debug(`Annotation: ${JSON.stringify(annotation)}`);
      return annotation;
    });
}

/**
 * Sorts annotations based on file name and line number.
 * @param annotations annotations returned by TICS analyzer.
 * @returns sorted anotations.
 */
function sortAnnotations(annotations: FetchedAnnotation[]): FetchedAnnotation[] {
  return annotations.sort((a, b) => {
    if (a.fullPath === b.fullPath) return a.line - b.line;
    return a.fullPath > b.fullPath ? 1 : -1;
  });
}

/**
 * Groups annotations by file. Excludes annotations for files that have not been changed.
 * @param annotations sorted annotations by file and line.
 * @param changedFiles List of files changed in the pull request.
 * @returns grouped annotations.
 */
function groupAnnotations(annotations: FetchedAnnotation[], changedFiles: ChangedFile[]): FetchedAnnotation[] {
  const groupedAnnotations: FetchedAnnotation[] = [];
  annotations.forEach(annotation => {
    const file = changedFiles.find(c => annotation.fullPath.includes(c.filename));
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
      annotation.path = file ? file.filename : annotation.fullPath.split('/').slice(4).join('/');
      groupedAnnotations.push(annotation);
    } else if (groupedAnnotations[index].gateId === annotation.gateId) {
      groupedAnnotations[index].count += annotation.count;
    }
  });
  return groupedAnnotations;
}

/**
 * Finds an annotation in a list and returns the index.
 * @param list List to find the annotation in.
 * @param annotation Annotation to find.
 * @returns The index of the annotation found or -1
 */
function findAnnotationInList(list: FetchedAnnotation[], annotation: FetchedAnnotation) {
  return list.findIndex(a => {
    return (
      a.fullPath === annotation.fullPath &&
      a.type === annotation.type &&
      a.line === annotation.line &&
      a.rule === annotation.rule &&
      a.level === annotation.level &&
      a.category === annotation.category &&
      a.msg === annotation.msg
    );
  });
}
