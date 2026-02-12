// Gemini Word Exporter - Offscreen Script
// Version: 2.0 - Route A: Programmatic Generation
console.log('Offscreen: Document loaded (v2.0)');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateWordOffscreen') {
        handleGenerateWord(request.content, request.settings || {});
    }
});

async function handleGenerateWord(rawContent, settings) {
    try {
        console.log('Offscreen: Starting Brand-Specific Word generation (v2.0)');

        // Fetch logo as ArrayBuffer
        let logoBuffer = null;
        try {
            const logoUrl = chrome.runtime.getURL('assets/logo.png');
            console.log('Offscreen: Attempting to fetch logo from:', logoUrl);
            const response = await fetch(logoUrl);
            if (response.ok) {
                logoBuffer = await response.arrayBuffer();
                console.log('Offscreen: Logo loaded successfully, size:', logoBuffer.byteLength);
            } else {
                console.warn('Offscreen: Logo file not found or failed to load, status:', response.status);
            }
        } catch (e) {
            console.error('Offscreen: Failed to load logo from assets:', e);
        }

        // 1. 处理品牌设置 (来自 service-worker 的 message)
        const customBrand = {};
        if (settings.motto) customBrand.firmMotto = settings.motto;
        if (settings.address) customBrand.address = settings.address;
        if (settings.phone) customBrand.phone = settings.phone;

        // 2. 初始化生成器
        if (!window.DocxGenerator) {
            throw new Error('DocxGenerator not found. Check if scripts are loaded correctly.');
        }

        const generator = new window.DocxGenerator(window.docx, customBrand);

        // 2. 生成 Blob (包含品牌页眉页脚和样式)
        const blob = await generator.generate(rawContent, logoBuffer);

        // 3. 转换为 Data URL 并发送回 background
        const reader = new FileReader();
        reader.onloadend = () => {
            chrome.runtime.sendMessage({
                action: 'downloadFile',
                dataUrl: reader.result
            });
        };
        reader.readAsDataURL(blob);

    } catch (error) {
        console.error('Offscreen Error:', error);
        chrome.runtime.sendMessage({ action: 'logError', error: error.message });
    }
}
