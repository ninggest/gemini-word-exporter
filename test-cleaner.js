const { cleanMarkdown } = require('./background/markdown-cleaner.js');

const testCases = [
    {
        name: 'Bold and Italic',
        input: 'This is **bold** and this is *italic*. Also __bold__ and _italic_.',
        expected: 'This is bold and this is italic. Also bold and italic.'
    },
    {
        name: 'Headers',
        input: '# Header 1\n## Header 2\n### Header 3',
        expected: 'Header 1\nHeader 2\nHeader 3'
    },
    {
        name: 'Code Blocks and Inline Code',
        input: 'Inline `code` and a block:\n```javascript\nconsole.log("hello");\n```\nAfter code.',
        expected: 'Inline code and a block:\n\nAfter code.'
    },
    {
        name: 'Lists',
        input: '- Item 1\n* Item 2\n+ Item 3',
        expected: 'Item 1\nItem 2\nItem 3'
    },
    {
        name: 'Quotes',
        input: '> This is a quote.\n> Second line.',
        expected: 'This is a quote.\nSecond line.'
    },
    {
        name: 'Links',
        input: 'Check this [Link Text](https://example.com) for more.',
        expected: 'Check this Link Text for more.'
    },
    {
        name: 'Multiple Newlines',
        input: 'Line 1\n\n\nLine 2',
        expected: 'Line 1\n\nLine 2'
    }
];

testCases.forEach(tc => {
    const result = cleanMarkdown(tc.input);
    if (result === tc.expected) {
        console.log(`[PASS] ${tc.name}`);
    } else {
        console.log(`[FAIL] ${tc.name}`);
        console.log(`  Expected: ${JSON.stringify(tc.expected)}`);
        console.log(`  Actual:   ${JSON.stringify(result)}`);
    }
});
