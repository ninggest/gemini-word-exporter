/**
 * 清除 Markdown 格式，保留纯文本
 * @param {string} text 
 * @returns {string}
 */
function cleanMarkdown(text) {
    let cleaned = text;

    // 1. 清理代码块（```language ... ```）
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');

    // 2. 清理行内代码（`code`）
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // 3. 清理加粗（**text** 或 __text__）
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');

    // 4. 清理斜体（*text* 或 _text_）
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

    // 5. 清理标题符号（# ## ### 等）
    cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

    // 6. 清理列表符号（- * +）
    cleaned = cleaned.replace(/^[-*+]\s+/gm, '');

    // 7. 清理引用符号（>）
    cleaned = cleaned.replace(/^>\s+/gm, '');

    // 8. 清理链接（[text](url)）保留文字
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // 9. 清理多余空行（将3个以上的换行缩小为2个）
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // 10. 清理行首行尾空格
    cleaned = cleaned.trim();

    return cleaned;
}

// 导出供 Service Worker 使用（如果作为独立模块引入）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cleanMarkdown };
}
