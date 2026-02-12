document.addEventListener('DOMContentLoaded', async () => {
    const useCustomCheckbox = document.getElementById('useCustom');
    const uploadBtn = document.getElementById('uploadBtn');
    const templateInput = document.getElementById('templateInput');
    const statusSpan = document.getElementById('status');
    const hintP = document.querySelector('.hint');

    // 初始化状态
    const data = await chrome.storage.local.get(['useCustom', 'customTemplateName']);
    useCustomCheckbox.checked = !!data.useCustom;
    if (data.customTemplateName) {
        hintP.innerText = `当前模板: ${data.customTemplateName}`;
    }

    // 切换自定义模板
    useCustomCheckbox.onchange = () => {
        chrome.storage.local.set({ useCustom: useCustomCheckbox.checked });
    };

    // 触发文件选择
    uploadBtn.onclick = () => {
        templateInput.click();
    };

    // 处理文件上传
    templateInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result.split(',')[1];
            chrome.storage.local.set({
                customTemplate: base64,
                customTemplateName: file.name,
                useCustom: true
            }, () => {
                useCustomCheckbox.checked = true;
                hintP.innerText = `当前模板: ${file.name}`;
                statusSpan.innerText = '已上传';
                setTimeout(() => statusSpan.innerText = '就绪', 2000);
            });
        };
        reader.readAsDataURL(file);
    };
});
