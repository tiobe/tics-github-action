import core from '@actions/core';
import fs from 'fs';
import { TicsAnalyzer } from './tics/TicsAnalyzer.js';
import { ticsConfig, githubConfig } from './github/configuration.js';
import { createPRReview, getAllPRReviewComments, deletePRReviewComments } from './github/pulls/reviews.js';
import { getPRChangedFiles, changeSetToFileList } from './github/pulls/pulls.js';
import { getErrorSummary, getQualityGateSummary, getLinkSummary, getFilesSummary } from './github/summary/index.js';
import { TicsPublisher } from './tics/TicsPublisher.js';
import { getTiobeWebBaseUrlFromUrl } from './tics/ApiHelper.js';
import { createIssueComment } from './github/issues/issues.js';


if (githubConfig.eventName == 'pull_request') {
  run();
} else {
  core.setFailed('This action is running only on pull request events.');
}

export async function run() {
  try {
    const changeSet = await getPRChangedFiles();
    const fileListPath = changeSetToFileList(changeSet);

    if (!isCheckedOutPerformed()) {
      core.setFailed('No checkout found to analyze. Please perform a checkout before running the TiCS Action.');
    }

    const basePath = fileListPath.replace('changeSet.txt', '');

    const ticsAnalyzer = new TicsAnalyzer();
    let { err, stdout, stderr } = await ticsAnalyzer.run(fileListPath);

    if (err && err.code != 0) {
      core.info(stderr);
      core.info(stdout);
      let errorList = stdout.match(/\[ERROR.*/g);

      if (errorList) {
        postSummary(errorList, true);
      } else {
        postSummary(stderr, true);
      }
      core.setFailed('There is a problem while running TICS Client Viewer. Please check that TICS is configured and all required parameters have been set in your workflow.');
      return;
    } else {
      core.info(stdout);
      let locateExplorerUrl = stdout.match(/http.*Explorer.*/g);
      let explorerUrl = '';

      let filesAnalyzed = stdout.match(/\[INFO 30.*\] Analyzing.*/g);
      let filteredFiles = [];
      for (let i = 0; i < filesAnalyzed?.length; i++) {
        let file = filesAnalyzed[i].split(basePath)[1];
        if (!filteredFiles.find(x => x === file)) {
          filteredFiles.push(file);
        }
      }

      if (locateExplorerUrl) {
        explorerUrl = locateExplorerUrl.slice(-1).pop();
        core.info('\u001b[35mExplorer url retrieved');
        core.info(`${explorerUrl}\n`);
      } else {
        postSummary('There is a problem while running TICS Client Viewer', true);
        core.setFailed('There is a problem while running TICS Client Viewer.');
        return;
      }

      const ticsPublisher = new TicsPublisher();
      let qualitygates = await ticsPublisher.run(explorerUrl);

      let results = {
        explorerUrl: explorerUrl,
        changeSet: filteredFiles,
        qualitygates: qualitygates
      };
      postSummary(results, false, ticsPublisher);
    }

  } catch (error) {
    core.error('Failed to run TiCS Github Action');
    core.error(error);
    core.setFailed(error.message);
  }
}

async function postSummary(summary, isError, ticsPublisher) {
  let review = {};

  if (isError) {
    review.event = 'COMMENT';
    review.body = getErrorSummary(summary);
    createIssueComment(review);
  } else {
    review.event = summary.qualitygates.passed ? 'COMMENT' : 'COMMENT'; // 'APPROVE' : 'REQUEST_CHANGES'; 
    review.body = getQualityGateSummary(summary.qualitygates) + getLinkSummary(summary.explorerUrl) + getFilesSummary(summary.changeSet);
    review.comments = ticsConfig.showAnnotations === 'true' ? await getAnnotations(summary.qualitygates, ticsPublisher) : [];
    createPRReview(review);
    deletePreviousAnnotations();
  }
}

async function getAnnotations(qualitygates, ticsPublisher) {
  core.info('\u001b[35mCreating the annotations for this Pull Request.');
  let annotations = await Promise.all(qualitygates.annotationsApiV1Links && qualitygates.annotationsApiV1Links.map(async (link) => {
    let fullLink = getTiobeWebBaseUrlFromUrl(ticsConfig.ticsConfiguration) + '/' + link.url;
    return await ticsPublisher.getAnnotations(fullLink);
  }));

  let annotationsWithSummary = [];
  annotations && annotations.map((annotationObj) => {
    annotationsWithSummary = createAnnotationsSummary(annotationObj);
  });

  return annotationsWithSummary;
}

function createAnnotationsSummary(annotationsObj) {
  let annotations = [];
  // group same annotation on the same line
  annotationsObj.data && annotationsObj.data.map((annotation) => {
    let annotationIndex = findAnnotationInArray(annotations, annotation);
    if (annotationIndex === -1) {
      annotations.push(annotation);
    } else {
      annotations[annotationIndex].count += annotation.count;
    }
  });

  let annotationsWithSummary = [];
  annotations.map((annotation) => {
    let displayCount = annotation.count === 1 ? '' : `(${annotation.count}x)`;
    let annotation_temp = {
      body: `:warning: **TiCS: ${annotation.type} violation: ${annotation.msg}** \r\n ${displayCount} Line: ${annotation.line}, Rule: ${annotation.rule}, Level: ${annotation.level}, Category: ${annotation.category} \r\n`,
      path: (annotation.fullPath).replace(`HIE://${ticsConfig.projectName}/${ticsConfig.branchName}/`, ''),
      line: annotation.line
    };
    annotationsWithSummary.push(annotation_temp);
  });
  return annotationsWithSummary;
}

function findAnnotationInArray(array, annotation) {
  return array.findIndex(a => {
    return (a.fullPath === annotation.fullPath) && (a.type === annotation.type) && (a.line === annotation.line) && (a.rule === annotation.rule) && (a.level === annotation.level) && (a.category === annotation.category) && (a.message === annotation.message);
  });
}

async function deletePreviousAnnotations() {
  let pastReviews = await getAllPRReviewComments();
  let reviewCommentIds = [];
  pastReviews.map((reviewComment) => {
    if (reviewComment.body.substring(0, 17) === ':warning: **TiCS:') {
      reviewCommentIds.push(reviewComment.id);
    }
  });
  deletePRReviewComments(reviewCommentIds);
}

export function isCheckedOutPerformed() {
  // Check if .git directory exists to see if a checkout has been performed
  if (!fs.existsSync('.git')) {
    core.debug('No git checkout found');
    return false;
  }
  return true;
}