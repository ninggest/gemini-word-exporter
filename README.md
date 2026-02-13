# Gemini Word Exporter

一个用于将 Gemini 对话内容导出为专业格式 Word 文档的 Chrome 扩展程序。

## 主要功能

- **自动化导出**：一键将 Gemini 聊天记录转换为 `.docx` 格式。
- **专业格式化**：
  - 自动识别标题并加粗。
  - 智能处理 Markdown 格式（加粗、换行等）。
  - 支持 Markdown 表格转 Word 表格。
- **支持格式定制**：
  - 页眉设计：支持在插件设置中自定义页眉右侧文案。
  - 规范页脚：支持自定义页脚左侧与页脚右侧文案。
  - 样式自定义：支持选择字体与正文、表格字号设定。
  - Logo 选择：支持在设置中选择 Logo，未选择时使用默认 Logo。
  - 标准字体：默认使用“仿宋”字体，符合法律文书规范。


## 更新记录

- **v1.6.0**：修复了列表内容（有序/无序列表）导出时出现重复的 Bug；优化了列表抓取逻辑，支持正确识别有序列表序号。
- **v1.5.0**：支持表格导出为 Word 表格；新增表格字号设置；设置中支持选择 Logo；优化标题自动加粗识别与首行缩进为 2ch；设置默认页眉/页脚文案。

## 安装说明

1. 下载本项目代码。
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`。
3. 开启右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本项目所在的文件夹。

## 自定义 Logo

您可以在插件设置中直接选择本地图片作为 Logo：
1. 打开插件设置，点击“Logo 选择”上传图片。
2. 保存设置后即可导出使用；未选择时默认使用广西万益律师事务所的 Logo。
3. 如需恢复默认 Logo，清空设置或不选择图片即可。

## 作者

由 **[Jus Team](https://jus.team)** 的 Zane开发。

## 技术栈

- **JavaScript (ES6+)**
- **docx.js**: 用于编程式生成 Word 文档。
- **Chrome Extension API** (Offscreen, Service Worker)

---

A Chrome extension for exporting Gemini chat content into professionally formatted Word documents.

## Key Features

- **Automated Export**: One-click conversion of Gemini chat history to `.docx` format.
- **Professional Formatting**:
  - Automatic title recognition and bolding.
  - Intelligent Markdown parsing (bold, line breaks, etc.).
  - Markdown tables render as Word tables.
- **Support Format Customization**:
  - Premium Header: Customize header-right text in extension settings.
  - Standard Footer: Customize footer-left and footer-right text in extension settings.
  - Style Selection: Choose fonts and set body/table font sizes.
  - Custom Logo: Select a logo in settings (falls back to default).
  - Standard Typography: Default "FangSong" font for legal/official standards.


## Changelog

- **v1.6.0**: Fixed a bug where list items (ordered/unordered) were duplicated during export; optimized list extraction logic to correctly identify ordered list numbering.
- **v1.5.0**: Word table export; table font size setting; logo selection in settings; improved auto-title bolding; first-line indent set to 2ch; default header/footer texts.

## Installation

1. Download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the extension folder.

## Custom Logo

You can select a local image in the extension settings:
1. Open the popup settings and choose a file under “Logo 选择”.
2. Save settings to apply; if not selected, the default logo is used.
3. To revert, clear the setting or leave the logo unselected.

## Author Info

Developed by Zane from **[Jus Team](https://jus.team)** .

## License

MIT License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
