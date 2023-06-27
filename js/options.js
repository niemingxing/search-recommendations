// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var wpUserNameInput = document.getElementById('wpUserName');
    var wpAppPasswordInput = document.getElementById('wpAppPassword');
    var wpPostApiInput = document.getElementById('wpPostApi');
    var saveButton = document.getElementById('saveButton');

    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.local.get('setting', function(result) {
        let setting = result.setting;
        if (setting) {
            mKeyInput.value = setting.mkey;
            wpUserNameInput.value = setting.wp_username;
            wpAppPasswordInput.value = setting.wp_password;
            wpPostApiInput.value = setting.wp_post_api;
            console.log(setting);
        }
    });

    // 保存按钮点击事件处理程序
    saveButton.addEventListener('click', function() {
        let setting = {
            'mkey':  mKeyInput.value,
            'wp_username':wpUserNameInput.value,
            'wp_password':wpAppPasswordInput.value,
            'wp_post_api':wpPostApiInput.value,
        };
        chrome.storage.local.set({ 'setting': setting }, function() {
            alert('设置已保存');
        });
    });
});
