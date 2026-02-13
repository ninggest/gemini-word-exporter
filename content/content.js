/**
 * 改进的 Gemini 内容抓取脚本 (v3.0)
 * 增加：更精准的 Markdown 提取逻辑，尝试获取源数据
 */
function extractMarkdown(container) {
    // 尝试寻找 Gemini 内部存储 Markdown 的地方
    // 有时它在某些隐藏的元素或 data 属性中
    const copyButton = container.closest('.answer-content-container')?.querySelector('[aria-label*="复制"], [aria-label*="Copy"]');

    // 如果没有找到更优源，我们使用结构化提取
    // 遍历节点，确保段落和换行被正确捕获
    let text = "";

    // 简单高效的方法：提取 innerHTML 并进行预处理，或者使用结构化的 innerText
    // 之前使用 clone.innerText，现在我们尝试直接处理
    const items = container.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, pre, table');
    if (items.length > 0) {
        items.forEach(el => {
            if (el.tagName === 'P' || el.tagName.startsWith('H')) {
                if (el.closest('li')) return;
                text += el.innerText + "\n\n";
            } else if (el.tagName === 'LI') {
                const parentList = el.parentElement;
                let prefix = "- ";
                if (parentList && parentList.tagName === 'OL') {
                    const siblings = Array.from(parentList.children).filter(child => child.tagName === 'LI');
                    const index = siblings.indexOf(el);
                    prefix = `${index + 1}. `;
                }
                const cloned = el.cloneNode(true);
                const nestedLists = cloned.querySelectorAll('ul, ol');
                nestedLists.forEach(list => list.remove());
                text += prefix + cloned.innerText + "\n";
            } else if (el.tagName === 'PRE') {
                text += "```\n" + el.innerText + "\n```\n\n";
            } else if (el.tagName === 'TABLE') {
                const tableMarkdown = tableToMarkdown(el);
                if (tableMarkdown) {
                    text += tableMarkdown + "\n\n";
                }
            }
        });
    } else {
        // 退而求其次
        text = container.innerText;
    }

    return text.trim();
}

function tableToMarkdown(table) {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return "";

    const parsedRows = rows.map(row => {
        const cells = Array.from(row.children).filter(cell => cell.tagName === 'TD' || cell.tagName === 'TH');
        const expanded = [];
        cells.forEach(cell => {
            const text = cell.innerText.replace(/\n+/g, ' ').trim();
            const span = Math.max(1, parseInt(cell.getAttribute('colspan') || '1', 10));
            expanded.push(text);
            for (let i = 1; i < span; i++) {
                expanded.push("");
            }
        });
        return expanded;
    });

    const columnCount = Math.max(...parsedRows.map(row => row.length));
    if (!Number.isFinite(columnCount) || columnCount === 0) return "";

    const normalizedRows = parsedRows.map(row => {
        const padded = row.slice();
        while (padded.length < columnCount) padded.push("");
        return padded;
    });

    const lines = normalizedRows.map(row => `| ${row.join(' | ')} |`);
    const separator = `| ${new Array(columnCount).fill('---').join(' | ')} |`;
    lines.splice(1, 0, separator);
    return lines.join("\n");
}

function injectExportButtons() {
    const responseContainers = document.querySelectorAll('.model-response-text, [data-test-id="model-response-text"], article');

    responseContainers.forEach(container => {
        if (container.querySelector('.gemini-word-exporter-btn')) return;

        const footer = container.closest('.answer-content-container')?.querySelector('.response-executor-actions') ||
            container.parentElement.querySelector('footer') ||
            (container.nextElementSibling?.classList.contains('actions') ? container.nextElementSibling : null);

        const btn = document.createElement('button');
        btn.className = 'gemini-word-exporter-btn';
        btn.innerHTML = '<span>导出 Word</span>';
        btn.style.margin = '5px';
        btn.style.zIndex = '9999';

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (btn.classList.contains('loading')) return;

            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span>导出中...</span>';
            btn.classList.add('loading');

            // 使用改进的提取逻辑
            const rawText = extractMarkdown(container);
            console.log('Gemini Word Exporter: Extracted content length:', rawText.length);

            chrome.runtime.sendMessage({
                action: 'exportWord',
                content: rawText
            }, (response) => {
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('loading');
                }, 1000);

                if (chrome.runtime.lastError) {
                    console.error('Gemini Word Exporter: SW error:', chrome.runtime.lastError);
                    alert('导出连接错误，请刷新页面。');
                }
            });
        }, true);

        if (footer) {
            footer.appendChild(btn);
        } else {
            container.appendChild(btn);
        }
    });
}

// 启动执行
if (window.location.hostname.includes('gemini.google.com')) {
    injectExportButtons();
    const observer = new MutationObserver(() => injectExportButtons());
    observer.observe(document.body, { childList: true, subtree: true });
}
