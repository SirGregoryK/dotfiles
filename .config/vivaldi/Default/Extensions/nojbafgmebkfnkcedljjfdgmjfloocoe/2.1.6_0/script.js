function insertScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    var menuImage = chrome.extension.getURL("images/menu.png");
    if (window.devicePixelRatio >= 2) {
        menuImage = chrome.extension.getURL("images/menu_2x.png");
    }
    s.setAttribute('data-menu', menuImage);
    s.id = 'ex-vk-tpls';
    var notifyIcon = chrome.extension.getURL("images/alert9.png");
    if (window.devicePixelRatio >= 2) {
        notifyIcon = chrome.extension.getURL("images/alert9_2x.png");
    }
    s.setAttribute('data-notify', notifyIcon);
    th.appendChild(s);
}
var localStorageMessageKey = 'ex-message-tpls-v2';
var localStorageConfigKey = 'ex-message-config';
var editTimes = 1;

var script = 'content.js';

chrome.storage.local.get( ['data', 'zero', 'config'], function (x) {
    var d = x['data'];
    var z = x['zero'];
    var c = x['config'];
    localStorage.setItem(localStorageMessageKey+'et', editTimes);
    if (d) {
        localStorage.setItem(localStorageMessageKey, d);
        chrome.storage.local.remove(['data']);
    }
    if (z) {
        localStorage.setItem(localStorageMessageKey+'z', z);
        chrome.storage.local.remove(['zero']);
    }
    if (c) {
        localStorage.setItem(localStorageConfigKey, JSON.stringify(c));
    } else {
        localStorage.setItem(localStorageConfigKey, JSON.stringify({'tpls':[],'defaultTpl':false,'v':1,'tmp':1}));
    }

    insertScript(chrome.extension.getURL(script), 'body');

} );

setInterval(function () {
    var c = localStorage.getItem(localStorageConfigKey);
    try {
        c = JSON.parse(c);
        if (!c.tmp || c.tmp != editTimes) {
            editTimes = c.tmp;
            chrome.storage.local.set({ 'config': c }, function () {});
        }
    } catch (e) {

    }
}, 200);