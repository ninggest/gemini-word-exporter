/**
 * DocxGenerator (v4.0) - Programmatic Word Generation
 */
const BRAND_ASSETS = {
    firmName: "万 益 法 律 研 究 院",
    firmMotto: "全国优秀律师事务所 全国文明单位",
    address: "地址：南宁市青秀区中心路 9 号九洲国际 27 层",
    phone: "电话：0771-2854881",
    styles: {
        font: "仿宋",
        bodyFontSize: 32, // 16pt = 32 half-points
        tableFontSize: 24,
        headerFontSize: 18,
        footerFontSize: 15,
        lineSpacing: 360,
    }
};

class DocxGenerator {
    constructor(docxInstance, customBrand = {}) {
        this.assets = {
            ...BRAND_ASSETS,
            ...customBrand
        };

        // Apply dynamic font settings
        if (customBrand.font) {
            this.assets.styles.font = customBrand.font;
        }
        if (customBrand.fontSize) {
            // pt to half-points (e.g. 16pt = 32)
            this.assets.styles.bodyFontSize = parseInt(customBrand.fontSize) * 2;
        }
        if (customBrand.tableFontSize) {
            this.assets.styles.tableFontSize = parseInt(customBrand.tableFontSize) * 2;
        }

        // Robust detection of the docx library
        const globalDocx = (typeof window !== 'undefined' ? window.docx : null) || (typeof docx !== 'undefined' ? docx : null);
        this.docx = docxInstance || globalDocx;

        console.log('DocxGenerator: Initialized with dynamic styles:', this.assets.styles);
    }

    async generate(mdContent, logoBuffer = null) {
        const { Document, Packer, Paragraph, TextRun, Header, Footer, ImageRun, AlignmentType, LineRuleType, PageNumber, BorderStyle } = this.docx;
        const styles = this.assets.styles;

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: { font: styles.font, size: styles.bodyFontSize },
                        paragraph: {
                            spacing: {
                                line: styles.lineSpacing,
                                lineRule: LineRuleType.AUTO,
                                before: 0, after: 0,
                            },
                        },
                    },
                },
            },
            sections: [{
                properties: { page: { margin: { top: 1440, bottom: 1440, right: 1800, left: 1800 } } },
                headers: {
                    default: new Header({
                        children: [
                            new Paragraph({
                                border: {
                                    bottom: { color: "666666", space: 0, style: BorderStyle.SINGLE, size: 6 }
                                },
                                children: [
                                    logoBuffer ? new ImageRun({
                                        data: logoBuffer,
                                        transformation: { width: 144, height: 30 },
                                    }) : new TextRun({ text: "[Logo]", color: "999999" }),
                                    new TextRun({
                                        text: "\t" + this.assets.firmMotto,
                                        size: styles.headerFontSize,
                                    }),
                                ],
                                tabStops: [{ type: "right", position: 8640 }],
                                spacing: { after: 0, line: 240, lineRule: LineRuleType.AUTO }
                            }),
                        ],
                    }),
                },
                footers: {
                    default: new Footer({
                        children: [
                            new Paragraph({
                                border: {
                                    top: { color: "666666", space: 1, style: BorderStyle.SINGLE, size: 6 }
                                },
                                children: [
                                    new TextRun({ text: this.assets.address, size: styles.footerFontSize }),
                                    new TextRun({ text: "\t" + this.assets.phone, size: styles.footerFontSize }),
                                ],
                                tabStops: [{ type: "right", position: 8640 }],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        children: [PageNumber.CURRENT],
                                        size: styles.footerFontSize,
                                    }),
                                ],
                            }),
                        ],
                    }),
                },
                children: this.parseMarkdown(mdContent),
            }],
        });

        return await Packer.toBlob(doc);
    }

    parseMarkdown(md) {
        if (!this.docx) {
            console.error('DocxGenerator: Cannot parse markdown, docx library missing.');
            return [];
        }
        const { Paragraph, HeadingLevel, AlignmentType } = this.docx;
        if (!md) return [new Paragraph({ text: "" })];

        const normalizedMd = md.replace(/<br\s*\/?>/gi, '\n');
        const rawLines = normalizedMd.split(/\r?\n/);
        const children = [];
        const firstLineIndent = this.assets.styles.bodyFontSize * 20;
        let consecutiveEmptyLines = 0;
        let i = 0;
        while (i < rawLines.length) {
            const line = rawLines[i];
            const trimmed = line.trim();

            if (trimmed.startsWith("|")) {
                const tableLines = [];
                while (i < rawLines.length && rawLines[i].trim().startsWith("|")) {
                    tableLines.push(rawLines[i].trim());
                    i++;
                }
                const table = this.renderTable(tableLines);
                if (table) {
                    children.push(table);
                }
                consecutiveEmptyLines = 0;
                continue;
            }

            if (!trimmed) {
                consecutiveEmptyLines++;
                i++;
                continue;
            }

            if (consecutiveEmptyLines >= 2) {
                children.push(new Paragraph({ text: "" }));
            }
            consecutiveEmptyLines = 0;

            const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
            if (hMatch) {
                children.push(new Paragraph({
                    children: this.parseInlineStyles(hMatch[2], true),
                    heading: HeadingLevel["HEADING_" + hMatch[1].length] || HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 },
                }));
                i++;
                continue;
            }

            const titlePattern = /^(\s*)(第[一二三四五六七八九十百千万\d]+[章节条款]|[一二三四五六七八九十百\d]+[、\.．\)]|[（\(\uff08{［\[\u3010][一二三四五六七八九十百千万\d]+[）\)\uff09}］\]\u3011])(\s*)/;
            const isAutoTitle = titlePattern.test(trimmed);

            children.push(new Paragraph({
                children: this.parseInlineStyles(line, isAutoTitle),
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: firstLineIndent },
                spacing: { line: 360, before: 0, after: 0 }
            }));
            i++;
        }

        return children.length > 0 ? children : [new Paragraph({ text: "" })];
    }

    parseInlineStyles(text, forceBold = false, fontSize) {
        if (!this.docx) return [];
        const { TextRun } = this.docx;
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        const runs = [];
        const effectiveSize = fontSize || this.assets.styles.bodyFontSize;

        for (const part of parts) {
            if (!part) continue;
            if (part.startsWith("**") && part.endsWith("**")) {
                runs.push(new TextRun({
                    text: part.slice(2, -2),
                    bold: true,
                    size: effectiveSize
                }));
            } else {
                runs.push(new TextRun({
                    text: part,
                    bold: forceBold,
                    size: effectiveSize
                }));
            }
        }
        return runs;
    }

    renderTable(lines) {
        if (!this.docx || !lines || lines.length === 0) return null;
        const { Table, TableRow, TableCell, Paragraph, WidthType, BorderStyle, AlignmentType } = this.docx;

        const separatorIndex = lines.findIndex((line, index) => index > 0 && this.isSeparatorLine(line));
        const headerRowCount = separatorIndex === 1 ? 1 : 0;

        const parsedRows = lines
            .map(line => this.parseTableLine(line))
            .filter(row => row && !row.isSeparator);

        if (parsedRows.length === 0) return null;

        const columnCount = Math.max(...parsedRows.map(row => row.cells.length));
        if (!Number.isFinite(columnCount) || columnCount === 0) return null;

        const rows = parsedRows.map((row, rowIndex) => {
            const padded = row.cells.slice();
            while (padded.length < columnCount) padded.push("");
            return new TableRow({
                children: padded.map(cellText => new TableCell({
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "000000" }
                    },
                    children: [
                        new Paragraph({
                            children: this.parseInlineStyles(cellText, rowIndex < headerRowCount, this.assets.styles.tableFontSize),
                            alignment: AlignmentType.JUSTIFIED,
                            spacing: { line: 360, before: 0, after: 0 }
                        })
                    ]
                }))
            });
        });

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows
        });
    }

    parseTableLine(line) {
        const trimmed = (line || "").trim();
        if (!trimmed.startsWith("|")) return null;
        if (this.isSeparatorLine(trimmed)) {
            return { isSeparator: true, cells: [] };
        }
        const parts = trimmed.split("|");
        const cells = parts.slice(1, -1).map(cell => cell.trim());
        return { isSeparator: false, cells };
    }

    isSeparatorLine(line) {
        const trimmed = (line || "").trim();
        if (!trimmed.startsWith("|")) return false;
        const parts = trimmed.split("|").slice(1, -1).map(cell => cell.trim());
        if (parts.length === 0) return false;
        return parts.every(cell => /^:?-{3,}:?$/.test(cell));
    }

    // Simplified extraction logic for v3.0
}

window.DocxGenerator = DocxGenerator;
