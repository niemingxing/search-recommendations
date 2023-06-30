let wpUserName = '';
let wpPassword = '';
let wpApiUrl = '';
let collectTag = '';
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request.type);
        if (request.type === "init_setting")
        {
            //像发送方发送消息，表面已经收到了消息
            wpUserName = (typeof request.setting.wp_username !== 'undefined') ? request.setting.wp_username : '';
            wpPassword = (typeof request.setting.wp_password !== 'undefined') ? request.setting.wp_password : '';
            wpApiUrl = (typeof request.setting.wp_post_api !== 'undefined') ? request.setting.wp_post_api : '';
            collectTag = (typeof request.setting.collect_tag !== 'undefined') ? request.setting.collect_tag : '';
            console.log(request.setting);
            sendResponse({ farewell: "Background runtime onMessage!" });
        }
        else if(request.type == "publish_article")
        {
            request.data['status'] = "publish";
            publishArticle(request.data)
            sendResponse({ farewell: "Background runtime onMessage!" });
        }
        else if(request.type == "web_spider_collect")
        {
            openTabSpiderColletc(request.url)
        }
        else if(request.type == "web_spider_complete")
        {
            chrome.tabs.remove(sender.tab.id);
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {'data':request.data,type:'web_spider_complete'});
            });
        }
    }
);

function openTabSpiderColletc(url)
{
    chrome.tabs.create({ url: url ,active: false}, (tab) => {
        // 监听标签页加载完成事件
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {

            if (tabId === tab.id && changeInfo.status === "complete") {
                // 从标签页中执行脚本以获取 DOM 内容
                console.log(collectTag);
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        function: (collectTag) => {;
                            let collectSetting = JSON.parse(collectTag);
                            const titleElement = document.querySelector(collectSetting.title);
                            const contentElement = document.querySelector(collectSetting.content);
                            chrome.runtime.sendMessage({ 'type': 'web_spider_complete',"data":{"title":titleElement.innerText,'content':contentElement.innerText} });
                        },
                        args:[collectTag]
                    },
                    () => {
                        // 关闭标签页
                        chrome.tabs.remove(tab.id);
                    }
                );

                // 移除监听器
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });
    });

}

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
