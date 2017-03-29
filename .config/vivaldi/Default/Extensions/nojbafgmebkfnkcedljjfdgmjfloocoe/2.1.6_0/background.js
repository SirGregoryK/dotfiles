function trackVkTabs() {
    chrome.windows.getAll({}, function(windows) {
        for(var i = 0; i < windows.length; i++) {
            var wId = windows[i].id;
            chrome.tabs.getAllInWindow( wId, function (tabs) {
                for(var j = 0; j < tabs.length; j++) {
                    var tab = tabs[j];
                    try {
                        if ( tab.url.indexOf('vk.com') ) {
                            chrome.tabs.executeScript( tab.id, { "file":'script.js' } );
                        }
                    } catch (e) {

                    }
                }
            } )
        }
    });
}

function onInstall() {
    trackVkTabs();
}

function onUpdate() {
    trackVkTabs();
}

function getVersion() {
    var details = chrome.app.getDetails();
    return details.version;
}

// Check if the version has changed.
var currVersion = getVersion();
var prevVersion = localStorage['version'];
if (currVersion != prevVersion) {
    // Check if we just installed this extension.
    if (typeof prevVersion == 'undefined') {
        onInstall();
    } else {
        onUpdate();
    }
    localStorage['version'] = currVersion;
}