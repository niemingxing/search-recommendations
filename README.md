# search-recommendations
插件名称: 搜索推荐词采集助手

插件介绍:
搜索推荐词采集助手是一款强大的Chrome插件，专为小红书、抖音、B站、知乎、百度、google用户设计。它能够自动收集并显示这些平台的搜索推荐词或联想词，保存下载为csv文件，帮助您更轻松地进行搜索、浏览和发现感兴趣的内容，可以根据提供的关键词利用ChatGpt自动生产文章发布到自己的wordpress个人站点(理论可以对接任意站点)，指数级提高网站内容生产效率。

主要特点:

一键采集: 搜索推荐词采集助手输入采集关键词，自动获取小红书、抖音、B站、知乎、百度、google的搜索推荐词或联想词。您只需点击插件图标，即可快速输入关键词自动化采集，省去手动采集的麻烦。

多平台支持: 插件支持小红书、抖音、B站、知乎、百度、google，覆盖了广泛的内容类型。不论您是在寻找美妆、旅行、美食、健身或娱乐方面的内容，该插件都能提供有价值的搜索推荐词，让您更快地找到感兴趣的内容。

ChatGpt自动生成和清洗文章发布：插件根据提供的主题关键词，可以自动化批量生成文章发布到wordpress站点，用以丰富站点内容，大大提高网站生产内容效率，同时也支持自动采集网站文章通过清洗prompt利用ChatGpt自动清洗发布。

用户友好界面: 插件提供简洁而直观的用户界面，使得操作更加轻松和便捷。搜索推荐词采集助手的图标会显示在Chrome浏览器的工具栏上，您可以随时启用或禁用插件，根据自己的需要自由使用。

![插件界面](https://i.ibb.co/cThZtqt/WX20230618-144632-2x.png)

![插件界面](https://i.ibb.co/bRfV4RM/WX20230701-172055-2x.png)

<img width="1284" alt="image" src="https://github.com/user-attachments/assets/008fd357-2f40-4eaa-acb2-7e7dfdb608c9">

<img width="1278" alt="image" src="https://github.com/user-attachments/assets/d84cdc70-4c80-4596-a8e1-d70269e67bfc">

使用说明:

安装插件: 在Chrome Web Store中搜索"搜索推荐词采集助手"插件，并点击安装按钮进行安装。[安装教程](https://www.bilibili.com/video/BV1514y1U7Uw/?vd_source=07bc57c14ff07a0d104533f8de5fb6d3) | [代码下载](https://github.com/niemingxing/search-recommendations/archive/refs/heads/master.zip)

使用插件: 安装完成后，在浏览器的工具栏上会显示该插件的图标。当您需要搜索特定内容时，点击插件图标，即可获取相关的搜索推荐词。[插件演示](https://www.bilibili.com/video/BV1TN411r7sp/?vd_source=07bc57c14ff07a0d104533f8de5fb6d3)

获取密钥：加V获取密钥

配置demo：

生成prompt:
你接下来会作为我的写作助手，围绕提供的关键词生成文章标题和文章内容，每篇文章不低于1500字，全部内容输出以'[START:keywords]'标签开始，'[END:keywords]'标签结束，keywords替换为我提供的关键词，文章标题放在'[TITLE]'标签和'[/TITLE]'标签中间，文章标题和文章内容都以纯文本形式输出，不包含任何特殊格式或标记，这样的格式可以方便我后面轻松地进行文本处理和提取关键信息。现在我提供的关键词是：```{keywords}```

清洗prompt:
根据下面提供的文章生成一个200字左右总结和新的标题，抓住文本的要点，使其易于阅读和理解。避免使用复杂的句子结构或专业术语。标题放在'[TITLE]'标签和'[/TITLE]'标签中间，总结的内容以'[START:{url}]'标签开始，以'[END:{url}]'标签结束。用中文回复。请首先参考以下文本：```{content}```

采集标签：
{"title":"div.art_left h1","content":"div.art_left div.art_content"}

采集站点：http://www.39.net/

### 交流方式(使用过程中有任何问题或者有很好的idea，非常欢迎一起交流共建)：

![vx:histargo](https://i.ibb.co/hMbTs1G/a3779b33-bfe2-4ff9-a592-f0ec090a3055-1-2.jpg)

### 赞赏鼓励(微信赞赏)

![微信赞赏](https://github.com/niemingxing/search-recommendations/assets/7400829/ddd8b306-9cd4-448c-9700-4eea9ce630fb)


