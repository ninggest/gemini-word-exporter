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

- **v1.5.0**：支持表格导出为 Word 表格；新增表格字号设置；设置中支持选择 Logo；优化标题自动加粗识别与首行缩进为 2ch；设置默认页眉/页脚文案。

## 安装说明

1. 下载本项目代码。
2. 打开 Chrome 浏览器，进入 `chrome://extensions/`。
3. 开启右上角的“开发者模式”。
4. 点击“加载已解压的扩展程序”，选择本项目所在的文件夹。

## 自定义 Logo

为了保证导出文档的专业性，您可以替换自己的 Logo：
1. 准备一张名为 `logo.png` 的图片。
2. 将图片放入插件目录下的 `assets/` 文件夹内。
3. 在 `chrome://extensions/` 页面点击刷新插件即可。

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

- **v1.5.0**: Word table export; table font size setting; logo selection in settings; improved auto-title bolding; first-line indent set to 2ch; default header/footer texts.

## Installation

1. Download the repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right.
4. Click "Load unpacked" and select the extension folder.

## Custom Logo

To use your own branding:
1. Prepare an image named `logo.png`.
2. Place it in the `assets/` directory of the extension.
3. Refresh the extension on the `chrome://extensions/` page.

## Author Info

Developed by Zane from **[Jus Team](https://jus.team)** .

## License

MIT License [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
