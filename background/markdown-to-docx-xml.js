/**
 * 将 Markdown 转换为标准的 Word XML 段落和表格片段 (v1.8)
 * 不包含“越狱”标签，由 offscreen.js 负责插入环境。
 */
function markdownToWordXml(md) {
    if (!md) return "";

    // 1. 预处理：规范化换行，处理表格中的 <br>
    // 注意：Gemini 经常在表格单元格中使用 <br> 或 <br>\n
    let content = md.replace(/\r\n/g, '\n');
    const lines = content.split('\n');

    let blocksXml = "";
    let currentTableRows = [];
    let consecutiveEmptyLines = 0;

    for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i];
        const trimmed = lineText.trim();

        if (trimmed.startsWith('|')) {
            // Placeholder for tables to match Route A logic
            if (consecutiveEmptyLines >= 2) {
                blocksXml += renderTextBlock("", false);
            }
            blocksXml += renderTextBlock("[此处需手工插入表格]", true);
            consecutiveEmptyLines = 0;
            continue;
        } else {
            if (!trimmed) {
                consecutiveEmptyLines++;
                continue;
            }

            if (consecutiveEmptyLines >= 2) {
                blocksXml += renderTextBlock("", false);
            }
            consecutiveEmptyLines = 0;

            // Title recognition and auto-bold (v4.0 logic)
            const titlePattern = /^(\s*)([一二三四五六七八九十百\d]+[、\.]|[（\(\uff08{［\[\u3010][一二三四五六七八九十百千万\d]+[）\)\uff09}］\]\u3011])(\s*)/;
            const isAutoTitle = titlePattern.test(trimmed) && trimmed.length < 20;

            blocksXml += renderTextBlock(lineText, isAutoTitle);
        }
    }

    if (currentTableRows.length > 0) {
        blocksXml += renderTableBlock(currentTableRows);
    }

    return blocksXml;
}

/**
 * 渲染普通段落
 */
function renderTextBlock(text, forceBold = false) {
    let runXml = parseFormattedText(text, forceBold);
    // Aligning logic with Route A: 1.5 line spacing (360 twips) and justified alignment
    return `<w:p><w:pPr>
        <w:jc w:val="both"/>
        <w:ind w:firstLine="640"/>
        <w:spacing w:line="360" w:lineRule="auto" w:before="0" w:after="0"/>
    </w:pPr>${runXml}</w:p>`;
}

/**
 * 解析带格式（加粗、换行）的文本为 <w:r> 序列
 */
function parseFormattedText(text, forceBold = false) {
    if (!text) return '<w:r><w:t/></w:r>';

    // 处理内部 <br> 标签
    let segments = text.split(/<br\s*\/?>/gi);
    let resultXml = "";

    segments.forEach((segment, index) => {
        let safe = escapeXml(segment);
        // 处理加粗 **text**
        const parts = safe.split(/(\*\*[^*]+\*\*)/g);
        for (const part of parts) {
            if (part.startsWith('**') && part.endsWith('**')) {
                const boldText = part.slice(2, -2);
                resultXml += `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${boldText}</w:t></w:r>`;
            } else if (part.length > 0) {
                resultXml += `<w:r><w:rPr>${forceBold ? '<w:b/>' : ''}</w:rPr><w:t xml:space="preserve">${part}</w:t></w:r>`;
            }
        }
        // 如果不是最后一部分，添加换行
        if (index < segments.length - 1) {
            resultXml += '<w:r><w:br/></w:r>';
        }
    });

    return resultXml || '<w:r><w:t/></w:r>';
}

/**
 * 渲染表格块
 */
function renderTableBlock(rows) {
    // 过滤掉分隔线行 (|---|---|)
    const dataRows = rows.filter(r => !/^[|\s:-]+$/.test(r.trim()));
    if (dataRows.length === 0) return "";

    let xml = '<w:tbl>';
    // 表格属性：居中对齐，设置边框
    xml += '<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/></w:tblBorders></w:tblPr>';

    for (const rowText of dataRows) {
        xml += '<w:tr>';
        // 分割单元格并移除首尾空元素
        const cells = rowText.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
        for (const cell of cells) {
            xml += '<w:tc><w:p>';
            xml += parseFormattedText(cell);
            xml += '</w:p></w:tc>';
        }
        xml += '</w:tr>';
    }
    xml += '</w:tbl>';
    return xml;
}

function escapeXml(unsafe) {
    if (!unsafe) return "";
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}
