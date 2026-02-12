// Gemini Word Exporter - Service Worker
importScripts('./markdown-cleaner.js');

console.log('SW: Service Worker loaded (v2.0)');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'exportWord') {
        startExportProcess(request.content)
            .then(() => sendResponse({ status: 'ok' }))
            .catch(err => sendResponse({ status: 'error', message: err.message }));
        return true;
    }

    if (request.action === 'downloadFile') {
        handleDownload(request.dataUrl);
        return false;
    }

    if (request.action === 'logError') {
        console.error('SW: Error from Offscreen:', request.error);
        return false;
    }
});

async function startExportProcess(content) {
    try {
        await setupOffscreenDocument();

        const settings = await chrome.storage.local.get(['motto', 'address', 'phone', 'font', 'fontSize', 'tableFontSize', 'logoDataUrl']);

        chrome.runtime.sendMessage({
            action: 'generateWordOffscreen',
            content: content,
            settings: settings
        });
    } catch (error) {
        console.error('SW Export Failed:', error);
        throw error;
    }
}

function handleDownload(dataUrl) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    chrome.downloads.download({
        url: dataUrl,
        filename: `gemini-export-${timestamp}.docx`,
        saveAs: false
    });
}

async function setupOffscreenDocument() {
    const OFFSCREEN_PATH = 'background/offscreen.html';

    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length > 0) {
        return;
    }

    await chrome.offscreen.createDocument({
        url: OFFSCREEN_PATH,
        reasons: ['DOM_PARSER'],
        justification: 'Word generation'
    });
}
