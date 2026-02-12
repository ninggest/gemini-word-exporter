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
        // Robust detection of the docx library
        const globalDocx = (typeof window !== 'undefined' ? window.docx : null) || (typeof docx !== 'undefined' ? docx : null);
        this.docx = docxInstance || globalDocx;

        console.log('DocxGenerator: Initialized with docx library (v4.0):', !!this.docx);
        console.log('DocxGenerator: Using motto:', this.assets.firmMotto);
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

        // Replace <br> with newlines to standardize splitting
        const normalizedMd = md.replace(/<br\s*\/?>/gi, '\n');
        const rawLines = normalizedMd.split(/\r?\n/);
        const children = [];
        let consecutiveEmptyLines = 0;
        let inTable = false;

        for (const line of rawLines) {
            const trimmed = line.trim();

            if (trimmed.startsWith("|")) {
                if (!inTable) {
                    children.push(new Paragraph({
                        children: [new this.docx.TextRun({
                            text: "[此处需手工插入表格]",
                            color: "FF0000",
                            bold: true
                        })],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 240, after: 240 }
                    }));
                    inTable = true;
                }
                consecutiveEmptyLines = 0; // Reset empty line counter when a table is encountered
                continue;
            } else {
                inTable = false;
            }

            if (!trimmed) {
                consecutiveEmptyLines++;
                continue;
            }

            // If we have 2 or more consecutive empty lines, insert one empty paragraph
            if (consecutiveEmptyLines >= 2) {
                children.push(new Paragraph({ text: "" }));
            }
            consecutiveEmptyLines = 0; // Reset counter for non-empty lines

            const hMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
            if (hMatch) {
                children.push(new Paragraph({
                    text: hMatch[2],
                    heading: HeadingLevel["HEADING_" + hMatch[1].length] || HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 },
                }));
                continue;
            }

            // Title recognition and auto-bold
            // Patterns: 一、, （一）, 1. , 1、
            // Supporting standard, full-width brackets, and various numbering formats
            const titlePattern = /^(\s*)([一二三四五六七八九十百\d]+[、\.]|[（\(\uff08{［\[\u3010][一二三四五六七八九十百千万\d]+[）\)\uff09}］\]\u3011])(\s*)/;
            const isAutoTitle = titlePattern.test(trimmed) && trimmed.length < 20;

            children.push(new Paragraph({
                children: this.parseInlineStyles(line, isAutoTitle),
                alignment: AlignmentType.JUSTIFIED,
                indent: { firstLine: 640 }, // 2 characters (approx 32pt = 640 twips)
                spacing: { line: 360, before: 0, after: 0 }
            }));
        }

        return children.length > 0 ? children : [new Paragraph({ text: "" })];
    }

    parseInlineStyles(text, forceBold = false) {
        if (!this.docx) return [];
        const { TextRun } = this.docx;
        // Since we handle <br> as paragraphs now, we don't need to split here for breaks
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        const runs = [];

        for (const part of parts) {
            if (!part) continue;
            if (part.startsWith("**") && part.endsWith("**")) {
                runs.push(new TextRun({
                    text: part.slice(2, -2),
                    bold: true,
                    size: this.assets.styles.bodyFontSize
                }));
            } else {
                runs.push(new TextRun({
                    text: part,
                    bold: forceBold,
                    size: this.assets.styles.bodyFontSize
                }));
            }
        }
        return runs;
    }

    // Simplified extraction logic for v3.0
}

window.DocxGenerator = DocxGenerator;
