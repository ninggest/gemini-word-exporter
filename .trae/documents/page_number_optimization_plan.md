# 页码优化计划

本计划旨在优化导出 Word 文档的页码显示，具体包括：
1. **调大页码字号**：将页脚字号从目前的 15 (7.5pt) 调整为 20 (10pt)，使其更清晰。
2. **修改页码格式**：将页码格式从单一的“当前页”改为“当前页 / 总页数”格式（例如：1 / 5）。

## 修改文件
- `background/docx-generator.js`

## 详细步骤

### 1. 调整样式配置
在 `BRAND_ASSETS` 常量中，修改 `styles.footerFontSize` 的值。
- 原值：15
- 新值：20 (对应 10pt)

### 2. 修改页脚生成逻辑
在 `DocxGenerator` 类的 `generate` 方法中，找到 `footers` 的定义部分。
- 定位到包含 `PageNumber.CURRENT` 的 `TextRun`。
- 修改 `children` 数组，加入 `PageNumber.TOTAL_PAGES` 和分隔符。
- 代码变更示意：
  ```javascript
  // 修改前
  children: [PageNumber.CURRENT],
  
  // 修改后
  children: [
      PageNumber.CURRENT,
      " / ",
      PageNumber.TOTAL_PAGES
  ],
  ```

## 验证
- 确认代码无语法错误。
- 确保 `docx` 库支持 `PageNumber.TOTAL_PAGES`（标准 docx.js 功能）。
