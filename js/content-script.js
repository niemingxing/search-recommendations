
	let kwIndex = 0;
	// 创建一个空字符串用于拼接 CSV 内容
	let csvContent = "";
	let keywords = '';
	let keywordList = [];
	let currentDomain = window.location.hostname;
	let currentKeywords = "";
	let hasCompleteKeywords = [];
	let noCompleteKeywords = [];
	let statusMap = {0:"未处理",1:"已生成",2:"已发布",3:"生成中",4:"排队中"};
	let statusColorClassMap = {0:'unresolved',1:'generated',2:'published',3:'generating',4:'queuing'};
	let generateArticleTime = 0,generateArticleStartTime = 0;

	/**
	 * 获取必要的dom对象
	 * @param $type
	 * @returns {Element | NodeListOf<Element>}
	 */
	function getNeetElement($type)
	{
		let result;
		if($type == "search")
		{
			if(currentDomain.includes("douyin"))
			{
				result = document.querySelector('header form input[type=text]');
			}
			else if(currentDomain.includes("xiaohongshu"))
			{
				result = document.querySelector('.search-input');
			}
			else if(currentDomain.includes("bilibili"))
			{
				result = document.querySelector('.nav-search-input');
			}
			else if(currentDomain.includes("zhihu"))
			{
				result = document.querySelector('form.SearchBar-tool input[type=text]');
			}
			else if(currentDomain.includes("baidu"))
			{
				result = document.querySelector('#kw');
			}
			else if(currentDomain.includes("google"))
			{
				result = document.querySelector('form[role="search"] textarea');
			}

		}
		else if($type == "recommend")
		{
			if(currentDomain.includes("douyin"))
			{
				result = document.querySelectorAll("header div[data-index]");
			}
			else if(currentDomain.includes("xiaohongshu"))
			{
				result = document.querySelectorAll("div.sug-item");
			}
			else if(currentDomain.includes("bilibili"))
			{
				result = document.querySelectorAll("div.suggestions div.suggest-item");
			}
			else if(currentDomain.includes("zhihu"))
			{
				result = document.querySelectorAll('div.Menu-item');
			}
			else if(currentDomain.includes("baidu"))
			{
				result = document.querySelectorAll('ul li.bdsug-overflow');
			}
			else if(currentDomain.includes("google"))
			{
				result = document.querySelectorAll('ul[role="listbox"] li[role="presentation"] div[role="option"] div[role="presentation"]:first-child');
			}
		}

		return result;
	}

	/**
	 * 搜索关键词
	 * @param keywords
	 */
	function search(q)
	{
		let searchInput = getNeetElement("search");
		if (searchInput) {
			inputDispatchEventEvent(searchInput,q);
			setTimeout(function() {
				let recommendElements = getNeetElement("recommend");
				// 遍历每个 div 元素并输出其 TEXT 内容
				recommendElements.forEach(function(element) {
					let html = element.innerHTML;
					let text = html.replace(/<[^>]*>/g, "");
					csvContent += text + "\n";
					console.log(text);
				});
				kwIndex++;
				if(kwIndex >= keywordList.length)
				{
					saveCsv(csvContent);
					return;
				}
				searchByCharCode();
			}, 3000); // 3000 毫秒等于 3 秒
		}
	}

	/**
	 * 保存内容为csv文件
	 * @param csvContent
	 */
	function saveCsv(csvContent)
	{
		// 创建一个 Blob 对象，将内容保存为 CSV 文件
		var blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

		// 生成一个临时下载链接并下载文件
		var link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "data(" + currentDomain+ ").csv";
		link.click();
	}

	function searchByCharCode()
	{
		let kw = keywordList[kwIndex];
		search(kw);
	}

	/**
	 * 收集搜索推荐词
	 * @param data
	 */
	function collectSearchKeywords(data)
	{
		if (data.keywords) {
			// 将关键词信息展示在页面的搜索框中
			//console.log(message)
			window.focus();
			csvContent = "";
			kwIndex = 0;
			keywords = data.keywords;
			// 修改表头为 "推荐关键词"
			let headers = ["推荐关键词"];
			csvContent += headers.join(",") + "\n";

			let hasNewline = keywords.includes("\n");
			if(hasNewline)
			{
				keywordList = keywords.split("\n").filter(function(item) {
					return item.trim() !== "";
				});
			}
			else
			{
				keywordList.push(keywords);
				for (let i = 97; i <= 122; i++) {
					let character = String.fromCharCode(i);
					keywordList.push(keywords + character);
				}
			}
			console.log(keywordList);
			console.log(kwIndex);
			searchByCharCode();
		}
	}

	/**
	 * input对象输入、改变、键盘事件分发
	 * @param obj
	 * @param value
	 */
	function inputDispatchEventEvent(obj,value)
	{
		let inputEvent = new InputEvent('input', {
			bubbles: true,
			cancelable: true,
			inputType: 'insertText',
			data:value
		});
		let changeEvent = new Event('change', {
			bubbles: true,
			cancelable: true
		});
		let keyUpEvent = new KeyboardEvent('keyup', {
			key: '',
			bubbles: true,
			cancelable: true
		});
		obj.value = value;
		obj.focus();
		obj.dispatchEvent(inputEvent);
		obj.dispatchEvent(changeEvent);
		obj.dispatchEvent(keyUpEvent);
	}

	/**
	 * 利用ChatGpt根据关键词创建文章
	 * @param data
	 */
	function chatGptCreateArticle(data)
	{
		window.focus();
		//hasCompleteKeywords = [];
		//noCompleteKeywords = [];
		keywords = data.keywords;
		keywordList = keywords.split("\n").filter(function(value, index, self) {
			// 过滤掉空字符串和重复元素
			return value.trim() !== "" && self.indexOf(value) === index;
		});
		chrome.storage.local.get('pga_keywords_dolist', function(result) {
			let doList = result.pga_keywords_dolist;
			for (var i = 0; i < keywordList.length; i++) {
				//status:0-未处理，1-已完成，2-已发布
				if (!doList.hasOwnProperty(keywordList[i])) {
					doList[keywordList[i]] = {'keywords':keywordList[i],'status':0,'content':'','timestamp':new Date().getTime()}
					addKeywordListItemElement({'title':keywordList[i],'status_text':statusMap[0],'status':0});
				}
			}
			chrome.storage.local.set({ 'pga_keywords_dolist': doList }, function() {
				console.log('关键词组存储成功！');
				initCreateStatus();
			});
		});
	}

	/**
	 * 发送prompt请求
	 */
	function sendCreatePrompt(type = 1)
	{
		let prompt_textarea = document.querySelector('#prompt-textarea');
		if(prompt_textarea) {
			//点击按钮发送prompt
			let prompt_button = document.querySelector('#prompt-textarea + button');
			if(type ==1)
			{
				let prompt = "你接下来会作为我的写作助手，围绕提供的关键词生成文章标题和文章内容，每篇文章不低于1500字，全部内容输出以'[START:keywords]'标签开始，'[END:keywords]'标签结束，keywords替换为我提供的关键词，文章标题放在'[TITLE]'标签和'[/TITLE]'标签中间，文章标题和文章内容都以纯文本形式输出，不包含任何特殊格式或标记，这样的格式可以方便我后面轻松地进行文本处理和提取关键信息。现在我提供的关键词是：```{{keywords}}``"
				prompt = prompt.replace("{keywords}", currentKeywords);
				inputDispatchEventEvent(prompt_textarea, prompt);
				setTimeout(function (){
					prompt_button.click();
				},500);
				updateKeywordsListItemElement(currentKeywords,{'title':currentKeywords,'status':3,'status_text':statusMap[3]});
				generateArticleStartTime = new Date().getTime();
			}
			else if(type == 2)
			{
				if(prompt_textarea.value.trim() != "")
				{
					prompt_button.click();
					generateArticleStartTime = new Date().getTime();
				}
			}
		}
	}

	/**
	 * 初始化关键词文章创建状态
	 */
	function initCreateStatus()
	{
		let keywordsContent = {};
		for (var i = 0; i < keywordList.length; i++) {
			let keywords = keywordList[i];
			let hasComplete = false;
			let ckRes = checkHasCompleteKeywords(keywords);
			if(ckRes['has_complete'])
			{
				hasComplete = true;
				keywordsContent[keywords]=ckRes['content'];
			}
			if(hasComplete)
			{
				hasCompleteKeywords.push(keywords);
			}
			else
			{
				noCompleteKeywords.push(keywords);
				updateKeywordsListItemElement(keywords,{'title':keywords,'status_text':statusMap[4],'status':4});
			}
		}
		console.log(hasCompleteKeywords);
		console.log(noCompleteKeywords);
		chrome.storage.local.get('pga_keywords_dolist', function(result) {
			let doList = result.pga_keywords_dolist;
			for (var i = 0; i < hasCompleteKeywords.length; i++) {
				if(doList.hasOwnProperty(hasCompleteKeywords[i]))
				{
					if(doList[hasCompleteKeywords[i]]['status'] == 0)
					{
						doList[hasCompleteKeywords[i]]['status'] = 1;
						doList[hasCompleteKeywords[i]]['content'] = keywordsContent[hasCompleteKeywords[i]];
						updateKeywordsListItemElement(hasCompleteKeywords[i],{'title':hasCompleteKeywords[i],'status_text':statusMap[1],'status':1});
					}
				}
				else
				{
					doList[hasCompleteKeywords[i]]['status'] = 1;
					doList[hasCompleteKeywords[i]]['content'] = keywordsContent[hasCompleteKeywords[i]];
					doList[hasCompleteKeywords[i]]['timestamp'] = new Date().getTime();
					addKeywordListItemElement({'title':hasCompleteKeywords[i],'status_text':statusMap[1],'status':1});
				}
			}
			chrome.storage.local.set({ 'pga_keywords_dolist': doList }, function() {
				console.log("初始化关键词完成状态！");
				document.querySelector("#gpt-sr-toggleButton").click();
			});
		});
	}

	/**
	 * 查看关键字文章是否已经完成
	 * @param keywords
	 */
	function checkHasCompleteKeywords(keywords)
	{
		let items = document.querySelectorAll('div.group.w-full div.markdown.prose.w-full');
		let hasComplete = false;
		let content = '';
		//根据页面内容判断关键词文章是否生成
		for (var j = 0; j < items.length; j++) {
			let text = items[j].innerText;
			if (text.includes("[START:"+keywords+"]") && text.includes("[END:"+keywords+"]")) {
				hasComplete = true;
				content = text;
				console.log("["+keywords+"] 文章创建完成！",content);
			}
		}
		return {
			'has_complete':hasComplete,
			'content':content
		}
	}

	/**
	 * 解析GPT生成的内容
	 * @param keywords
	 * @param content
	 * @returns {{title: string, content}}
	 */
	function parseContent(keywords,content)
	{
		var regex = /\[TITLE\](.*?)\[\/TITLE\]/;
		var matches = content.match(regex);
		let title='';
		if (matches && matches.length > 1) {
			title = matches[1];
		} else {
			console.log("未找到匹配的内容");
		}
		let replaceStrArr = ["[START:"+keywords+"]","[END:"+keywords+"]","[TITLE]"+title+"[/TITLE]"];
		for(var i=0; i<replaceStrArr.length;i++)
		{
			content = content.replace(replaceStrArr[i],"");
		}
		return {
			'title':title,
			'content':content
		};
	}

	/**
	 * 定时检查关键词完成状况
	 */
	function checkCreateStatus()
	{
		let intervalId = setInterval(function(){
			let content = '';
			let ckRes = checkHasCompleteKeywords(currentKeywords);
			if(ckRes['has_complete'])
			{
				content = ckRes['content'];
				chrome.storage.local.get('pga_keywords_dolist', function(result) {
					let doList = result.pga_keywords_dolist;
					if(doList.hasOwnProperty(currentKeywords))
					{
						if(doList[currentKeywords]['status'] == 0)
						{
							doList[currentKeywords]['status'] = 1;
							doList[currentKeywords]['content'] = content;
							updateKeywordsListItemElement(currentKeywords,{'title':currentKeywords,'status_text':statusMap[1],'status':1});
						}
					}
					else
					{
						doList[currentKeywords]['status'] = 1;
						doList[currentKeywords]['content'] = content;
						doList[currentKeywords]['timestamp'] = new Date().getTime();
						addKeywordListItemElement({'title':currentKeywords,'status_text':statusMap[1],'status':1});
					}
					chrome.storage.local.set({ 'pga_keywords_dolist': doList }, function() {
						generateArticleTime = new Date().getTime() - generateArticleStartTime;
						console.log("["+currentKeywords+"] 完成持久化状态变更，消耗" + generateArticleTime/1000 +"秒！");
						let parseData = parseContent(currentKeywords,content);
						parseData['keywords'] = currentKeywords;
						sendArticlePublishRequest({'type':'publish_article',"data":parseData});
						while (true) {
							if(noCompleteKeywords.length === 0)
							{
								console.log("所有关键词文章全部生成完成！");
								document.querySelector("button.gpt-sr-starting-btn").disabled = false;
								clearInterval(intervalId);
								if(window.Notification && Notification.permission !== "denied") {
									Notification.requestPermission(function(status) {
										var n = new Notification('任务完成通知', { body: "所有关键词文章全部生成完成！" });
									});
								}
								return;
							}
							currentKeywords = noCompleteKeywords.shift();
							if(doList[currentKeywords]['status'] == 0)
							{
								sendCreatePrompt();
								return;
							}
						}
					});
				});
			}

			if(new Date().getTime() - generateArticleStartTime > 300000)
			{
				if(window.Notification && Notification.permission !== "denied") {
					Notification.requestPermission(function(status) {
						var n = new Notification('异常通知', { body: "[" + currentKeywords + "] 文章生成异常，请及时排查问题！" });
					});
				}
			}

			let buttons = document.querySelectorAll('form div button');
			for (var i = 0; i < buttons.length; i++) {
				let buttonText = buttons[i].innerText;
				if (buttonText.includes("Continue generating")) {
					console.log("存在按钮 'Continue generating' 自动点击继续!");
					buttons[i].click();
					break;
				}
				//"Stop generating"
			}
			//容错由于程序响应过快导致按钮没有及时触发
			sendCreatePrompt(2);
		},5000);
	}

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		console.log(message);
		if(message.type == 'collect_search_keywords')
		{
			collectSearchKeywords(message);
		}
		else if(message.type == 'chatgpt_create_article')
		{
			console.log("利用chatgpt生成文章");
			chatGptCreateArticle(message);
		}
		else if(message.type == 'pga_keywords_publish')
		{
			updateKeywordsListItemElement(message.data['keywords'],{'title':message.data['keywords'],'status':message.data['status'],'status_text':statusMap[message.data['status']]});
		}
	});

	/**
	 * 发送文章发布请求
	 * @param data
	 */
	function sendArticlePublishRequest(data) {
		chrome.runtime.sendMessage(data, function (response) {
			console.log(response.farewell)
		});
	}

	/**
	 * 初始化弹层
	 */
	function initKeywrodsPopup() {
		const keywrodsHtmlLayer = '<div class="gpt-sr-container">\n' +
			'    <div class="gpt-sr-sidebar">\n' +
			'      <button id="gpt-sr-toggleButton">显示弹层</button>\n' +
			'    </div>\n' +
			'  </div>\n' +
			'  \n' +
			'  <div id="gpt-sr-popup" class="gpt-sr-popup">\n' +
			'    <button class="gpt-sr-close-btn">&times;</button>\n' +
			'	 <button class="gpt-sr-starting-btn">开始执行</button>\n' +
			'    <div class="gpt-sr-content">\n' +
			'      <h2 class="gpt-sr-title">关键词列表</h2>\n' +
			'      <ul class="gpt-sr-list">\n' +
			'      </ul>\n' +
			'    </div>\n' +
			'  </div>';
		const popupElement = document.createElement("div");
		popupElement.innerHTML = keywrodsHtmlLayer;
		document.body.appendChild(popupElement);
		document.querySelector("#gpt-sr-toggleButton").addEventListener("click", function() {
			var popup = document.getElementById("gpt-sr-popup");
			popup.classList.toggle("gpt-sr-active");
		});

		document.querySelector("button.gpt-sr-close-btn").addEventListener("click", function() {
			var popup = document.getElementById("gpt-sr-popup");
			popup.classList.remove("gpt-sr-active");
		});

		document.querySelector("button.gpt-sr-starting-btn").addEventListener("click", function() {
			if(noCompleteKeywords.length == 0)
			{
				alert("没有待处理的关键词");
			}
			else
			{
				var currentElement = event.target;
				currentElement.disabled = true;
				currentKeywords = noCompleteKeywords.shift();
				sendCreatePrompt();
				checkCreateStatus();
			}
		});

		document.addEventListener('click', function(event) {
			var toggleButton = document.getElementById('gpt-sr-toggleButton');
			var popup = document.getElementById('gpt-sr-popup');

			// 判断点击的目标元素是否在弹层内部
			var isInsidePopup = popup.contains(event.target);

			// 判断点击的目标元素是否是弹层按钮
			var isToggleButton = (event.target === toggleButton);

			// 如果点击的目标元素不在弹层内部且不是弹层按钮，则隐藏弹层
			if (!isInsidePopup && !isToggleButton) {
				popup.classList.remove("gpt-sr-active");
			}
		});

		chrome.storage.local.get('pga_keywords_dolist', function(result) {
			let doList = result.pga_keywords_dolist;
			let sortedKeys = Object.keys(doList).sort(function(a, b) {
				let timestampA = doList[a].timestamp;
				let timestampB = doList[b].timestamp;
				return timestampA - timestampB;
			});

			sortedKeys.forEach(function(key) {
				if (doList.hasOwnProperty(key)) {
					let data = {
						'title' : key,
						'status_text' : statusMap[doList[key]['status']],
						'status':doList[key]['status']
					};
					addKeywordListItemElement(data);
				}
			});
		});
	}

	/**
	 * 创建关键词列表对象
	 * @param data
	 * @returns {HTMLLIElement}
	 */
	function addKeywordListItemElement(data)
	{
		let itemHtml = '<span class="gpt-sr-keyword" title="' + data.title + '">' + data.title + '</span>\n' +
			'<span class="gpt-sr-status ' + statusColorClassMap[data.status] + '">' + data.status_text + '</span>\n' +
			'<div class="gpt-sr-actions"><button class="gpt-sr-add" title="加入生成">+</button><button class="gpt-sr-delete" title="删除记录">-</button></div>';
		const itemElement = document.createElement("li");
		itemElement.classList.add("gpt-sr-list-item");
		itemElement.setAttribute("data-key", data.title);
		itemElement.innerHTML = itemHtml;
		itemElement.querySelector("div.gpt-sr-actions button.gpt-sr-delete").addEventListener("click", function() {
			var currentElement = event.target;
			currentElement.disabled = true;
			var liParentElement = currentElement.parentNode.parentNode;
			let liKeywords = liParentElement.getAttribute("data-key");
			chrome.storage.local.get('pga_keywords_dolist', function(result) {
				let doList = result.pga_keywords_dolist;
				delete doList[liKeywords];
				chrome.storage.local.set({ 'pga_keywords_dolist': doList }, function() {
					liParentElement.remove();
					updateKewordsListStatistics();
				});
			});
		});
		const addButton = itemElement.querySelector("div.gpt-sr-actions button.gpt-sr-add");
		addButton.addEventListener("click",function(){
			var currentElement = event.target;
			currentElement.disabled = true;
			var liParentElement = currentElement.parentNode.parentNode;
			let liKeywords = liParentElement.getAttribute("data-key");
			noCompleteKeywords.push(liKeywords);
			updateKeywordsListItemElement(liKeywords,{'title':liKeywords,'status_text':statusMap[4],'status':4});
		});

		if(data.status == 0)
		{
			addButton.disabled = false;
		}
		else
		{
			addButton.disabled = true;
		}

		let listPanel = document.querySelector("#gpt-sr-popup ul");
		listPanel.insertBefore(itemElement,listPanel.firstChild);
		updateKewordsListStatistics();
	}

	/**
	 * 更新关键词列表元素
	 * @param key
	 * @param data
	 */
	function updateKeywordsListItemElement(key,data)
	{
		let itemElement = document.querySelector("#gpt-sr-popup ul li[data-key='" + key + "']");
		if(itemElement)
		{
			let statusElement = itemElement.querySelector("span.gpt-sr-status");
			statusElement.textContent = data.status_text;

			for (let scl in statusColorClassMap) {
				statusElement.classList.remove(statusColorClassMap[scl]);
			}

			statusElement.classList.add(statusColorClassMap[data.status]);
			let addButton = itemElement.querySelector("div.gpt-sr-actions button.gpt-sr-add");
			if(data.status == 0)
			{
				addButton.setAttribute("disabled", false);
			}
			else
			{
				addButton.setAttribute("disabled", true);
			}
		}
		else
		{
			addKeywordListItemElement(data);
		}
		updateKewordsListStatistics();
	}

	function updateKewordsListStatistics()
	{
		let kwItems = document.querySelectorAll("#gpt-sr-popup ul li");
		document.querySelector("#gpt-sr-popup div.gpt-sr-content h2").textContent = "关键词列表(" + kwItems.length + ")";
	}

	// 引入CSS文件
	function addStylesheet(url) {
		const linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		linkElement.type = "text/css";
		linkElement.href = chrome.runtime.getURL(url);
		document.head.appendChild(linkElement);
	}
	// 在页面加载完成后插入弹层和引入CSS文件
	window.onload = function() {
		if(currentDomain.includes("chat.openai.com"))
		{
			initKeywrodsPopup();
			addStylesheet("css/gpt_keywords_list.css"); // 替换为您的CSS文件路径
		}
	};


