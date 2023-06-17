$("#submit").click(function (){
   let keywords = $("#keywords").val();
   if(keywords.trim() == '')
   {
      alert("输入不可以为空！");
      return;
   }
    // 向 content-scripts.js 发送消息，包含关键词信息
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { keywords: keywords , closePopup: true});
    });
});