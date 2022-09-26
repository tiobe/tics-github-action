export const generateLinkMarkdown = (text, link) => {
    return Boolean(text) && Boolean(link) ? `[${text}](${link})` : '';
}

export const generateStatusMarkdown = (passed, hasSuffix) => {
    if (passed) {
        return ':heavy_check_mark: ' + (hasSuffix ? 'Passed ' : '');
    } else {
        return ':x: ' + (hasSuffix ? 'Failed ' : '');
    }
}

/**
*  To properly render a table markdown, the table should start with a blank line.
*  Hyphens(-) are used to create each column's header, while pipes(|) separate each column.
*  For example:
*  
*  | First Header  | Second Header |
*  | ------------- | ------------- |
*  | Content Cell  | Content Cell  |
*  | Content Cell  | Content Cell  |
*/
export const generateTableMarkdown = (headers, cells) => {
    let row = `\n ${generateTableHeaders(headers, true)} ${generateTableHeaders(headers, false)}`;
    
    cells.forEach(cell => {
        row += `|  ${generateLinkMarkdown(cell.name, cell.link)} | ${cell.score} | \n`
    })
    
    return row;
}

const generateTableHeaders = (array, isHeader) => {
    return '|' + array.map((header) => {
       return isHeader ? header : '---';
    }).join('|') + '|' + '\n';
}

export const generateExpandableAreaMarkdown = (title, body) => {
    return `<details><summary>${title}</summary> \n ${body} </details> \n`;
}
