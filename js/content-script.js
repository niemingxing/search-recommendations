(function() {
	let kwIndex = 0;
	// 创建一个空字符串用于拼接 CSV 内容
	let csvContent = "";
	let keywords = '';
	let keywordList = [];
	let currentDomain = window.location.hostname;

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
			let inputEvent = new InputEvent('input', {
				bubbles: true,
				cancelable: true,
				inputType: 'insertText',
				data: q
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
			searchInput.value = q;
			searchInput.focus();
			searchInput.dispatchEvent(inputEvent);
			searchInput.dispatchEvent(changeEvent);
			searchInput.dispatchEvent(keyUpEvent);

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

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		if (message.keywords) {
			// 将关键词信息展示在页面的搜索框中
			//console.log(message)
			window.focus();
			csvContent = "";
			kwIndex = 0;
			keywords = message.keywords;
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
	});

})();

