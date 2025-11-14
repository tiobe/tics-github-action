import { actionConfig, ticsConfig } from '../configuration/config';
import { ChangedFile } from '../github/interfaces';
import { logger } from '../helper/logger';
import { getRetryErrorMessage } from '../helper/response';
import { httpClient } from './http-client';
import { AnnotationApiLink, ExtendedAnnotation, AnnotationResponse, FetchedAnnotation, QualityGate, TicsRunIdentifier } from './interfaces';
import { ViewerFeature, viewerVersion } from './version';

/**
 * Gets the annotations from the TICS viewer.
 * @param qualityGate qualityGate containing annotation links
 * @param changedFiles the changed files used to group the annotations
 * @param identifier identifier (project + date or cdtoken) of the run
 * @returns TICS annotations
 */
export async function getAnnotations(
  qualityGate: QualityGate,
  changedFiles: ChangedFile[],
  identifier: TicsRunIdentifier
): Promise<ExtendedAnnotation[]> {
  try {
    const annotations = await fetchAllAnnotations(qualityGate, identifier);
    return groupAndExtendAnnotations(annotations, changedFiles);
  } catch (error) {
    logger.warning(error instanceof Error ? error.message : 'Something went wrong fetching the annotations: reason unknown');
    return [];
  }
}

export async function fetchAllAnnotations(qualityGate: QualityGate, identifier: TicsRunIdentifier): Promise<FetchedAnnotation[]> {
  logger.header('Retrieving annotations.');

  let annotations: FetchedAnnotation[];
  if (await viewerVersion.viewerSupports(ViewerFeature.NEW_ANNOTATIONS)) {
    annotations = await fetchAnnotationsByRun(identifier);
  } else {
    annotations = await fetchAnnotationsWithApiLinks(qualityGate.annotationsApiV1Links ?? []);
  }

  logger.info('Retrieved all annotations.');
  return annotations;
}

async function fetchAnnotationsWithApiLinks(apiLinks: AnnotationApiLink[]): Promise<FetchedAnnotation[]> {
  if (apiLinks.length === 0) {
    logger.info('No annotations to retrieve.');
    return [];
  }

  const annotations: FetchedAnnotation[] = [];
  for (const [index, link] of apiLinks.entries()) {
    const annotationsUrl = new URL(`${ticsConfig.baseUrl}/${link.url}`);
    annotations.push(...(await fetchAnnotations(annotationsUrl, index)));
  }
  return annotations;
}

async function fetchAnnotationsByRun(identifier: TicsRunIdentifier): Promise<FetchedAnnotation[]> {
  const annotationsUrl = new URL(`${ticsConfig.baseUrl}/api/public/v1/Annotations?metric=QualityGate()`);

  let filters = `Project(${identifier.project}),${actionConfig.showAnnotationSeverity.getAnnotationSeverityFilter()}`;
  if (identifier.cdtoken) {
    filters += `,ClientData(${identifier.cdtoken})`;
  } else if (identifier.date) {
    filters += `,Date(${identifier.date.toString()})`;
  }
  filters += ',Window(-1)';
  annotationsUrl.searchParams.set('filters', filters);

  return fetchAnnotations(annotationsUrl);
}

async function fetchAnnotations(annotationsUrl: URL, gateId?: number): Promise<FetchedAnnotation[]> {
  const fields = annotationsUrl.searchParams.get('fields');
  const requiredFields = 'default,ruleHelp,synopsis,ruleset,blocking';
  if (fields !== null) {
    annotationsUrl.searchParams.set('fields', fields + ',' + requiredFields);
  } else {
    annotationsUrl.searchParams.append('fields', requiredFields);
  }

  logger.debug(`From: ${annotationsUrl.href}`);

  try {
    const response = await httpClient.get<AnnotationResponse>(annotationsUrl.href);

    return response.data.data.map(annotation => {
      const fetched: FetchedAnnotation = {
        ...annotation,
        gateId: gateId,
        line: annotation.line ?? 1,
        count: annotation.count ?? 1,
        path: annotation.path ?? annotation.fullPath.split('/').slice(4).join('/'),
        instanceName: response.data.annotationTypes ? response.data.annotationTypes[annotation.type].instanceName : annotation.type
      };

      // In case complexity is given, the annotation does not have a message (should be fixed in newer Viewers #34866).
      // Present in Viewers <= 2024.2.0
      if (annotation.complexity && !annotation.msg) {
        fetched.msg = `Function ${annotation.functionName ?? ''} has a complexity of ${annotation.complexity.toString()}`;
      }

      return fetched;
    });
  } catch (error: unknown) {
    const message = getRetryErrorMessage(error);
    throw Error(`An error occured when trying to retrieve annotations: ${message}`);
  }
}

/**
 * Groups and extend the annotations.
 * @param annotations Annotations retrieved from the viewer.
 * @param changedFiles List of files changed in the pull request.
 * @returns List of the review comments.
 */
export function groupAndExtendAnnotations(annotations: FetchedAnnotation[], changedFiles: ChangedFile[]): ExtendedAnnotation[] {
  const sortedAnnotations = sortAnnotations(annotations);
  const groupedAnnotations = groupAnnotations(sortedAnnotations);

  const changedSet = new Set<string>(changedFiles.map(c => c.filename)); // optimization
  return groupedAnnotations.map(a => {
    const annotation: ExtendedAnnotation = {
      ...a,
      displayCount: a.count === 1 ? '' : `(${a.count.toString()}x) `,
      postable: changedSet.has(a.path)
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
function groupAnnotations(annotations: FetchedAnnotation[]): FetchedAnnotation[] {
  const groupedAnnotations: FetchedAnnotation[] = [];
  annotations.forEach(annotation => {
    const index = findAnnotationInList(groupedAnnotations, annotation);
    if (index === -1) {
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
