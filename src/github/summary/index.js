import {
  generateLinkMarkdown,
  generateStatusMarkdown,
  generateTableMarkdown,
  generateExpandableAreaMarkdown
} from './markdownGenerator.js';
import { getTiobeWebBaseUrlFromUrl } from '../../tics/ApiHelper.js';
import { ticsConfig } from '../configuration.js';

export const getErrorSummary = (errorList) => {
  let errorMessage = '## TICS Quality Gate\r\n\r\n### :x: Failed \r\n\r\n #### The following errors have occurred during analysis:\r\n\r\n';

  if (errorList && Array.isArray(errorList)) {
    errorList.forEach(item => errorMessage += `> :x: ${item}\r\n`);
  } else {
    errorMessage += `> :x: ${errorList}\r\n`;
  }

  return errorMessage;
};

export const getQualityGateSummary = (qualityGateObj) => {
  if (!qualityGateObj) {
    return '';
  }

  let gatesConditionsSummary = '';

  qualityGateObj.gates && qualityGateObj.gates.forEach(gate => {
    gatesConditionsSummary += `## ${gate.name} \n\n ${getQGCondtionsSummary(gate.conditions)}`;
  });

  return `## TICS Quality Gate \n\n ### ${generateStatusMarkdown(qualityGateObj.passed, true)} \n\n ${gatesConditionsSummary}\n`;
};

export const getLinkSummary = (link) => {
  return generateLinkMarkdown('See the results in the TICS Viewer', link) + '\n\n';
};

export const getFilesSummary = (fileList) => {
  let title = 'The following files have been checked:';
  let body = '';
  fileList.map((file) => {
    body += `- ${file}<br>`;
  });
  return generateExpandableAreaMarkdown(title, body);
};

export const getUnpostedSummary = (nonPostedComments) => {
  let title = 'Quality findings outside of the changes of this pull request:';
  let body = '';
  let previousPaths = [];
  nonPostedComments.sort((a, b) => {
    if (a.path === b.path) return a.line - b.line;
    return a.path > b.path ? 1 : -1;
  });
  nonPostedComments.map((comment) => {
    if (!previousPaths.find(x => x === comment.path)) {
      if (previousPaths.length > 0) {
        body += '</ul>';
      }
      body += `<b>File:</b> ${comment.path}<ul>`;
      previousPaths.push(comment.path);
    }
    body += `<li>${comment.body.replace('\r\n', '<br>').replace('**', '<b>').replace('**', '</b>')}</li>`;
  });
  return generateExpandableAreaMarkdown(title, body);
};

/**
* Helper methods to generate markdown
*/
const getQGCondtionsSummary = (conditions) => {
  let out = '';

  conditions.forEach(condition => {
    if (condition.skipped !== true) {
      const gateConditionWithIcon = `${generateStatusMarkdown(condition.passed, false)}  ${condition.message}`;

      if (condition.details !== null && condition.details.items.length > 0) {
        let headers = [];
        headers.push('File', condition.details.dataKeys.actualValue.title);
        let cells = getTableCellsDetails(condition.details.items.filter(item => item.itemType === 'file'));

        out += generateExpandableAreaMarkdown(gateConditionWithIcon, generateTableMarkdown(headers, cells)) + '\n\n\n';
      } else {
        out += gateConditionWithIcon + ' \n\n\n';
      }
    }
  });

  return out;
};

const getTableCellsDetails = (items) => {
  return items.map((item) => {
    return {
      name: item.name,
      link: getTiobeWebBaseUrlFromUrl(ticsConfig.ticsConfiguration) + '/' + item.link,
      score: item.data.actualValue.formattedValue
    };
  });
};
