chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method == "getLocalStorage")
      sendResponse({data: localStorage[request.key]});
});
(function () {
    if (localStorage['is_installed']){
        return;
	}
    localStorage.setItem('is_installed', 1);
    chrome.tabs.create({url: "options.html#welcome"});
})();