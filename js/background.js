let wpUserName = '';
let wpPassword = '';
let wpApiUrl = '';
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.type === "init_setting")
        {
            //像发送方发送消息，表面已经收到了消息
            sendResponse({farewell: request.type});
            console.log(request.setting);
            wpUserName = (typeof request.setting.wp_username !== 'undefined') ? request.setting.wp_username : '';
            wpPassword = (typeof request.setting.wp_password !== 'undefined') ? request.setting.wp_password : '';
            wpApiUrl = (typeof request.setting.wp_post_api !== 'undefined') ? request.setting.wp_post_api : '';
            console.log(wpUserName,wpPassword,wpApiUrl);
        }
        else if(request.type == "publish_article")
        {
            request.data['status'] = "publish";
            publishArticle(request.data)
        }
        sendResponse({ farewell: "Background runtime onMessage!" });
    }
);

function publishArticle(data)
{
    if(!data.title || !data.content)
    {
        console.log("发布内容必要字段不可以为空！");
        return;
    }
    else if(wpUserName == '' || wpPassword == '' || wpApiUrl == '')
    {
        console.log("必要发布设置为空！");
        return;
    }
    const postData = {
        title: data.title,
        content: data.content,
        status: data.status
    };
    fetch(wpApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(wpUserName + ':' + wpPassword) // 替换为你的 WordPress 登录凭据
        },
        body: JSON.stringify(postData),
        credentials: 'omit'
    }).then(response => {
        if (response.ok) {
            chrome.storage.local.get('pga_keywords_dolist', function(result) {
                let doList = result.pga_keywords_dolist;
                doList[data.keywords]['status'] = 2;
                chrome.storage.local.set({ 'pga_keywords_dolist': doList }, function() {
                    console.log("["+data.keywords+"] 发布成功！");
                    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, {'data':doList[data.keywords],type:'pga_keywords_publish'});
                    });
                });
            });

        } else {
            console.log('发布帖子失败！');
        }
    }).catch(error => {
        console.error('发生错误:', error);
    });
}
