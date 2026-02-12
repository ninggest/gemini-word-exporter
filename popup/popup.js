document.addEventListener('DOMContentLoaded', async () => {
    const mottoInput = document.getElementById('motto');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    const fontSelect = document.getElementById('fontSelect');
    const fontSizeInput = document.getElementById('fontSize');
    const tableFontSizeInput = document.getElementById('tableFontSize');
    const logoFileInput = document.getElementById('logoFile');
    const saveBtn = document.getElementById('saveBtn');
    const statusSpan = document.getElementById('status');

    // 初始化状态 (获取保存的设置或使用默认值)
    const data = await chrome.storage.local.get(['motto', 'address', 'phone', 'font', 'fontSize', 'tableFontSize', 'logoDataUrl']);

    // 这里的默认值应与 docx-generator.js 中的 BRAND_ASSETS 一致或稍后由 generator 处理
    mottoInput.value = data.motto || "全国优秀律师事务所 全国文明单位";
    addressInput.value = data.address || "地址：南宁市青秀区中心路 9 号九洲国际 27 层";
    phoneInput.value = data.phone || "电话：0771-2854881";
    fontSelect.value = data.font || "仿宋";
    fontSizeInput.value = data.fontSize || "16";
    tableFontSizeInput.value = data.tableFontSize || "12";

    logoFileInput.onchange = () => {
        const file = logoFileInput.files && logoFileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            chrome.storage.local.set({ logoDataUrl: reader.result }, () => {
                statusSpan.innerText = 'Logo 已更新';
                setTimeout(() => statusSpan.innerText = '就绪', 2000);
            });
        };
        reader.readAsDataURL(file);
    };

    // 保存设置
    saveBtn.onclick = () => {
        chrome.storage.local.set({
            motto: mottoInput.value.trim(),
            address: addressInput.value.trim(),
            phone: phoneInput.value.trim(),
            font: fontSelect.value,
            fontSize: fontSizeInput.value,
            tableFontSize: tableFontSizeInput.value
        }, () => {
            statusSpan.innerText = '已保存';
            setTimeout(() => statusSpan.innerText = '就绪', 2000);
        });
    };
});
