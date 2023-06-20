let mKey = '';
let keywords = '';
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
});

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
        if(json.hasOwnProperty("code") && json.code !=0)
        {
            alert(json.message);
        }
        else if(json.hasOwnProperty("code") && json.code ==0)
        {
            if(callback) callback();
        }
    })
    .catch(err => alert('Request Failed', err));
}

$("#submit").click(function (){
    keywords = $("#keywords").val();
    if(keywords.trim() == '')
    {
        alert("输入不可以为空！");
        return;
    }
    else if(mKey == '')
    {
        alert("没有配置mKey，请点击右上角设置配置！");
        return;
    }
    checkMKey(sendSearchMessage)
});