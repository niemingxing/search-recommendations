// options.js
document.addEventListener('DOMContentLoaded', function() {
    var apiKeyInput = document.getElementById('apiKey');
    var saveButton = document.getElementById('saveButton');

    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.sync.get('apiKey', function(result) {
        var apiKey = result.apiKey;
        if (apiKey) {
            apiKeyInput.value = apiKey;
            console.log(apiKey);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        var newApiKey = apiKeyInput.value;
        chrome.storage.sync.set({ 'apiKey': newApiKey }, function() {
            alert('密钥已保存');
        });
    });
});
