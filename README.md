# Gemini Word Exporter

一个用于将 Gemini 对话内容导出为专业格式 Word 文档的 Chrome 扩展程序。

## 主要功能

- **自动化导出**：一键将 Gemini 聊天记录转换为 `.docx` 格式。
- **专业格式化**：
  - 自动识别标题并加粗。
  - 智能处理 Markdown 格式（加粗、换行等）。
  - 支持表格保留与占位符提示。
- **品牌定制**：
  - 尊享页眉设计：包含律所/公司 Logo 与格言（Motto）。
  - 规范页脚：包含联系地址及电话。
  - 标准字体：默认使用“仿宋”字体，符合法律文书规范。
- **高密度排版**：智能过滤单行回车，使文档排版更紧凑、专业。

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
  - Table support with placeholder warnings.
- **Branding Customization**:
  - Premium Header: Includes Firm/Company Logo and Motto.
  - Standard Footer: Address and phone contact information.
  - Standard Typography: Default "FangSong" font for legal/official standards.
- **High-Density Layout**: Smart filtering of extra line breaks for a compact, professional look.

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

## License

MIT License
