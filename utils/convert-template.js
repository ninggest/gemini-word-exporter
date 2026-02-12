const fs = require('fs');
const path = require('path');

const templatePath = process.argv[2] || path.join(__dirname, '../templates/template.dotx');

if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template file not found at ${templatePath}`);
    console.log('Usage: node convert-template.js <path-to-dotx>');
    process.exit(1);
}

try {
    const templateBuffer = fs.readFileSync(templatePath);
    const base64 = templateBuffer.toString('base64');

    const outputContent = `const DEFAULT_TEMPLATE = "${base64}";`;
    const outputPath = path.join(__dirname, '../templates/default-template.js');

    fs.writeFileSync(outputPath, outputContent);
    console.log(`Success: Template converted and saved to ${outputPath}`);
} catch (err) {
    console.error('Error converting template:', err);
}
