let mKey = '';
let keywords = '';
let submitButton;
document.getElementById('openOptions').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});

document.addEventListener('DOMContentLoaded', function () {
    // 获取存储的值
    chrome.storage.sync.get('mkey', function (data) {
        mKey = data.mkey;
        // 在这里使用存储的值
        console.log(mKey);
    });

    chrome.storage.sync.get('keywords', function (data) {
        $("#keywords").val(data.keywords);
        console.log("keywords:"+data.keywords);
    });
});
// 获取弹窗元素
const popup = document.getElementById('popup');

// 获取关闭按钮元素
const closeButton = document.getElementById('closePopupBtn');

// 获取错误提示元素
const errorText = document.getElementById('message');

// 显示弹窗并设置错误提示文字
function showPopup(message) {
    errorText.textContent = message;
    popup.style.display = 'block';
}

// 关闭弹窗
function closePopup() {
    popup.style.display = 'none';
}

// 点击关闭按钮关闭弹窗
closeButton.addEventListener('click', closePopup);

/**
 * 发送搜索消息
 */
function sendSearchMessage()
{
    // 向 content-scripts.js 发送消息，包含关键词信息
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { keywords: keywords});
    });
}
/**
 * 检查mkey合法性
 */
function checkMKey(callback)
{
    fetch('https://idnsl.xyz/code/check_mkey',{
        method: 'POST',
        headers: {
            'Accept': 'application/json, */*',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'cache': 'default',
            'x-ajax': 'true'
        },
        'credentials': 'include', //表示请求是否携带cookie
        body: "mkey=" + mKey
    })
    // fetch()接收到的response是一个 Stream 对象
    // response.json()是一个异步操作，取出所有内容，并将其转为 JSON 对象
    .then(response => response.json())
    .then(json => {
        console.log(json)
        submitButton.disabled = false;
        if(json.hasOwnProperty("code") && json.code !=0)
        {
            showPopup(json.message);
        }
        else if(json.hasOwnProperty("code") && json.code ==0)
        {
            if(callback) callback();
        }
    })
    .catch(err => {
        submitButton.disabled = false;
        alert('Request Failed', err);
    });
}

$("#submit").click(function (){
    submitButton = this;
    submitButton.disabled = true;
    keywords = $("#keywords").val();
    if(keywords.trim() == '')
    {
        showPopup("输入不可以为空！");
        submitButton.disabled = false;
        return;
    }
    else if(mKey == '')
    {
        showPopup("没有配置密钥,请点击右上角设置！");
        submitButton.disabled = false;
        return;
    }

    chrome.storage.sync.set({ 'keywords': keywords }, function() {
        checkMKey(sendSearchMessage);
    });
});