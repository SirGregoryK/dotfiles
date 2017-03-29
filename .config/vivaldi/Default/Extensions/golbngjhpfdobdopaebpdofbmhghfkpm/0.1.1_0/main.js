// Copyright (c) 2014
//
// Matt Levine
// Created: 12/9/14
//

// Create selection context
var title = "Search Urban Dictionary for 'selection'";
var id = chrome.contextMenus.create({"title": title, "contexts":["selection"], "onclick": genericOnClick});

// A generic onclick callback function.
function genericOnClick(info, tab) {
	var selection = info.selectionText;
	var newURL = "http://www.urbandictionary.com/define.php?term=" + selection;
	// Open the new tab with the search query
	chrome.tabs.create({ url: newURL, index: tab.index+1, selected: true });
}

// Update the contextMenus title
function updateContextMenu(id) {
	// Update contextMenus with highlighted selection
	chrome.contextMenus.update(id, {"title": "Search Urban Dictionary for '%s'"});
}

// Updates the contextMenus title each time the menu is opened.
updateContextMenu(id);