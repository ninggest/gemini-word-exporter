document.addEventListener('DOMContentLoaded', async () => {
    const mottoInput = document.getElementById('motto');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    const saveBtn = document.getElementById('saveBtn');
    const statusSpan = document.getElementById('status');

    // 初始化状态 (获取保存的设置或使用默认值)
    const data = await chrome.storage.local.get(['motto', 'address', 'phone']);

    // 这里的默认值应与 docx-generator.js 中的 BRAND_ASSETS 一致或稍后由 generator 处理
    mottoInput.value = data.motto || "";
    addressInput.value = data.address || "";
    phoneInput.value = data.phone || "";

    // 保存设置
    saveBtn.onclick = () => {
        chrome.storage.local.set({
            motto: mottoInput.value.trim(),
            address: addressInput.value.trim(),
            phone: phoneInput.value.trim()
        }, () => {
            statusSpan.innerText = '已保存';
            setTimeout(() => statusSpan.innerText = '就绪', 2000);
        });
    };
});
