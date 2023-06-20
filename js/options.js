// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var saveButton = document.getElementById('saveButton');

    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.sync.get('mkey', function(result) {
        var mk = result.mkey;
        if (mk) {
            mKeyInput.value = mk;
            console.log(mk);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        var newMKey = mKeyInput.value;
        chrome.storage.sync.set({ 'mkey': newMKey }, function() {
            alert('密钥已保存');
        });
    });
});
