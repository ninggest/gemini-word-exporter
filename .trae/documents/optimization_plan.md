# Gemini Word Exporter 优化方案

基于对现有代码库的分析，提出以下针对性能、功能和代码质量的优化建议。

## 1. 性能优化 (Performance Optimization)

### 1.1 内容提取优化 (Content Extraction)
- **问题**: 在 `content/content.js` 中，使用 `text += ...` 进行大量的字符串拼接，在处理长对话时会导致频繁的内存分配和性能下降。
- **建议**:
  - 改用数组收集内容片段 (`const chunks = []; chunks.push(...)`)，最后使用 `chunks.join('')` 合并。
  - 减少 DOM 查询次数，缓存常用的选择器结果。

### 1.2 文档生成优化 (Document Generation)
- **问题**: `background/docx-generator.js` 中的 `parseMarkdown` 方法是同步执行的，对于长文档可能会阻塞主线程（尽管在 Service Worker/Offscreen 中执行，但仍可能导致消息处理延迟）。
- **建议**:
  - **分片处理**: 将大文本分割成小块进行解析，使用 `setTimeout` 或 `requestAnimationFrame` (如果在 UI 线程) 让出执行权。
  - **Web Worker**: 考虑将 Markdown 解析和文档生成逻辑完全移至 Web Worker 中运行（目前已在 Offscreen 文档中，符合此方向，但代码逻辑仍需优化以支持异步流式处理）。

### 1.3 减少正则开销
- **问题**: `docx-generator.js` 中对每一行文本重复创建和执行复杂的正则表达式。
- **建议**:
  - 预编译正则表达式。
  - 优化正则逻辑，避免回溯陷阱。

## 2. 功能增强 (Functional Enhancements)

### 2.1 图片支持 (Image Support) - **高优先级**
- **现状**: 目前 `content.js` 忽略 `<img>` 标签，导致生成的文档中丢失所有图片（包括 Gemini 生成的图表和用户上传的图片）。
- **建议**:
  - **提取端 (`content.js`)**:
    - 在遍历 DOM 时捕获 `<img>` 标签。
    - 获取图片的 `src` (URL) 或 Base64 数据。
    - 将图片转换为 Markdown 图片语法 `![alt](url)` 或自定义占位符。
  - **生成端 (`docx-generator.js`)**:
    - 解析 Markdown 图片语法。
    - 在 Offscreen Document 中下载图片数据（处理 CORS 问题）。
    - 使用 `docx` 库的 `ImageRun` 将图片插入到 Word 文档中。
    - 自动调整图片大小以适应页面宽度。

### 2.2 增强 Markdown 支持
- **现状**: 仅支持粗体、标题、简单列表和表格。缺失斜体、行内代码、超链接、引用块等。
- **建议**:
  - **引入 AST 解析器**: 考虑引入轻量级的 Markdown 解析库（如 `marked` 或 `markdown-it`）生成 AST（抽象语法树），而不是依赖简单的行正则匹配。这将极大提高解析的准确性和扩展性。
  - **支持更多格式**:
    - 斜体 (`*text*` -> `Italics`)
    - 行内代码 (`` `code` `` -> `TextRun({ font: "Courier New" })`)
    - 超链接 (`[text](url)` -> `ExternalHyperlink`)
    - 引用块 (`> quote` -> 缩进样式)
    - 嵌套列表 (支持多级缩进)

### 2.3 表格处理增强
- **现状**: 表格内容被展平为纯文本，单元格内的格式丢失。
- **建议**:
  - 在 `content.js` 中保留单元格内的 HTML 结构或将其转换为更丰富的中间格式。
  - 在 `docx-generator.js` 中递归解析单元格内容，支持单元格内的加粗、换行等格式。

## 3. 用户体验优化 (User Experience)

### 3.1 进度反馈
- **现状**: 点击导出后，用户只能等待，对于长文档没有进度提示。
- **建议**:
  - 在 `content.js` 和 `service-worker.js` 之间建立进度通信机制。
  - 在页面上显示简单的进度条或百分比（"正在解析...", "正在生成图片...", "打包下载中..."）。

### 3.2 自定义设置
- **现状**: 样式硬编码在 `docx-generator.js` 中。
- **建议**:
  - 在 `popup.html` 中添加设置选项：
    - 字体大小 (正文/标题)
    - 页面边距
    - 纸张大小 (A4/Letter)
    - 是否包含图片
  - 将设置保存到 `chrome.storage` 并在生成时读取。

## 4. 代码质量与维护 (Code Quality)

### 4.1 模块化
- **建议**: 将 `docx-generator.js` 拆分：
  - `MarkdownParser`: 负责将 Markdown 文本转换为中间对象结构（或 AST）。
  - `DocxBuilder`: 负责将中间对象结构转换为 `docx` 库的配置对象。
  - `ImageHandler`: 专门处理图片的下载和处理。

### 4.2 错误处理
- **建议**:
  - 添加全局错误捕获，确保在一个部分失败（如某张图片下载失败）时，整个文档生成不会崩溃，而是记录错误并继续生成剩余部分。

## 实施路线图 (Implementation Roadmap)

1.  **阶段一（基础优化）**: 修复 `content.js` 字符串拼接性能问题；添加基础图片提取和展示支持。
2.  **阶段二（格式增强）**: 改进 Markdown 解析逻辑（引入 AST 或优化正则），支持链接、斜体和代码块。
3.  **阶段三（体验升级）**: 添加进度条和用户设置面板。
