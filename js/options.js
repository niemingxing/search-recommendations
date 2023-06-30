// options.js
document.addEventListener('DOMContentLoaded', function() {
    var mKeyInput = document.getElementById('mKey');
    var wpUserNameInput = document.getElementById('wpUserName');
    var wpAppPasswordInput = document.getElementById('wpAppPassword');
    var wpPostApiInput = document.getElementById('wpPostApi');
    var createPrompt = document.getElementById('createPrompt');
    var cleanPrompt = document.getElementById('cleanPrompt');
    var collectTag = document.getElementById('collectTag');
    var saveButton = document.getElementById('saveButton');

    // 获取保存的密钥值并设置输入框的默认值
    chrome.storage.local.get('setting', function(result) {
        let setting = result.setting;
        if (setting) {
            mKeyInput.value = setting.mkey;
            wpUserNameInput.value = setting.wp_username;
            wpAppPasswordInput.value = setting.wp_password;
            wpPostApiInput.value = setting.wp_post_api;
            createPrompt.value = setting.create_prompt;
            cleanPrompt.value = setting.clean_prompt;
            collectTag.value = setting.collect_tag;
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
            'create_prompt':createPrompt.value,
            'clean_prompt':cleanPrompt.value,
            'collect_tag':collectTag.value
        };
        chrome.storage.local.set({ 'setting': setting }, function() {
            alert('设置已保存');
        });
    });
});
