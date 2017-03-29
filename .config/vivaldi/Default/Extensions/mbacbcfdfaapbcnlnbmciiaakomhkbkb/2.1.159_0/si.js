(function() {
  (function(modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
      if (installedModules[moduleId]) {
        return installedModules[moduleId].exports;
      }
      var module = installedModules[moduleId] = {exports:{}, id:moduleId, loaded:false};
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      module.loaded = true;
      return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = "";
    return __webpack_require__(0);
  })([function(module, exports, __webpack_require__) {
    __webpack_require__(26);
  }, , , , , , , , , , , , , , , , , , , , , , , , , , function(module, exports, __webpack_require__) {
    var messaging = __webpack_require__(27);
    var injectScript = __webpack_require__(29);
    var canUseSovetnik = __webpack_require__(31);
    var postMessageParser = __webpack_require__(32);
    var postMessage = __webpack_require__(33);
    var sovetnikRE = /^https?:\/\/sovetnik/;
    var sovetnikInfo = undefined;
    function initListeners() {
      messaging.sendMessage({type:"getSovetnikInfo"}, function(info) {
        sovetnikInfo = info;
        if (sovetnikInfo) {
          canUseSovetnik(document.URL, document.referrer, function() {
            if (typeof startSovetnik !== "undefined") {
              startSovetnik(sovetnikInfo.settings);
            } else {
              injectScript(document, sovetnikInfo.url, sovetnikInfo.settings);
            }
          });
        }
      });
      postMessage.on(onMessage);
    }
    var commandHandlers = {getDomainData:function getDomainData(message, origin) {
      messaging.sendMessage({type:"getDomainData", domain:message.data.domain}, function(domainData) {
        message.response = domainData;
        postMessage.trigger(JSON.stringify(message), origin);
      });
    }, getSovetnikInfo:function getSovetnikInfo(message, origin) {
      message.response = sovetnikInfo.settings;
      postMessage.trigger(JSON.stringify(message), origin);
    }, serverMessage:function serverMessage(message) {
      messaging.sendMessage({type:message.data.type, domain:message.data.domain || window.location.host});
    }, showSettingsPage:function showSettingsPage() {
      messaging.sendMessage({type:"showSettingsPage"});
    }, showNotification:function showNotification(message) {
      messaging.sendMessage({type:"showNotification", notification:message.data});
    }, sovetnikProductResponse:function sovetnikProductResponse(message) {
      messaging.sendMessage({type:"sovetnikProductResponse", response:message.data});
    }};
    function onMessage(event) {
      var message = postMessageParser.getMessageFromEvent(event);
      if (message && sovetnikInfo && sovetnikInfo.settings) {
        if (sovetnikInfo.settings.clid) {
          if (sovetnikInfo.settings.clid != message.clid) {
            return;
          }
        } else {
          if (sovetnikInfo.settings.affId != message.affId) {
            return;
          }
        }
        if (message.command) {
          commandHandlers[message.command](message, event.origin);
        }
      }
    }
    if (window && window.document && (window.self === window.top || sovetnikRE.test(window.location.href))) {
      if (window.opera) {
        if (window.document.readyState === "complete" || window.document.readyState === "interactive") {
          initListeners();
        } else {
          window.document.addEventListener("DOMContentLoaded", initListeners, false);
        }
      } else {
        initListeners();
      }
    }
  }, function(module, exports, __webpack_require__) {
    var messaging = undefined;
    messaging = __webpack_require__(28);
    module.exports = messaging;
  }, function(module, exports) {
    var messaging = {sendMessage:function sendMessage(msg, responseCallback) {
      responseCallback = responseCallback || function() {
      };
      chrome.runtime.sendMessage(msg, function() {
        var args = arguments;
        setTimeout(function() {
          responseCallback.apply(this, args);
        }, 0);
      });
      return this;
    }, onMessage:function onMessage(listener) {
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        return listener(request, sendResponse);
      });
    }};
    module.exports = messaging;
  }, function(module, exports, __webpack_require__) {
    var injectScript = undefined;
    injectScript = __webpack_require__(30);
    module.exports = injectScript;
  }, function(module, exports) {
    function injectScript(doc, url, settings) {
      var script = doc.createElement("script");
      var params = [];
      params.push("mbr=true");
      params.push("settings=" + encodeURIComponent(JSON.stringify(settings)));
      params = params.join("&");
      url += "?" + params;
      script.setAttribute("src", url);
      script.setAttribute("type", "text/javascript");
      script.setAttribute("charset", "UTF-8");
      doc.body.appendChild(script);
    }
    module.exports = injectScript;
  }, function(module, exports, __webpack_require__) {
    var messaging = __webpack_require__(27);
    function canUseSovetnik(url, referrer, successCallback) {
      messaging.sendMessage({type:"canUseSovetnik", url:url, referrer:referrer}, function(res) {
        if (res) {
          successCallback();
        }
      });
    }
    module.exports = canUseSovetnik;
  }, function(module, exports) {
    var postMessageParser = {getMessageFromEvent:function getMessageFromEvent(event) {
      if (!event.data) {
        return null;
      }
      var message = event.data;
      if (typeof message === "string") {
        try {
          message = JSON.parse(message);
        } catch (ex) {
          return null;
        }
      }
      var isOurMessage = message && message.type === "MBR_ENVIRONMENT" && !message.hasOwnProperty("response") && (message.clid || message.affId);
      if (isOurMessage) {
        return message;
      }
      return null;
    }};
    module.exports = postMessageParser;
  }, function(module, exports) {
    function addMessageListener(listener) {
      var forceUseOriginalPostMessage = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      if (window.svtPostMessage && !forceUseOriginalPostMessage) {
        window.svtPostMessage.on(listener);
      } else {
        if (window.addEventListener) {
          window.addEventListener("message", listener);
        } else {
          window.attachEvent("onmessage", listener);
        }
      }
    }
    function triggerPostMessage(message, origin) {
      var forceUseOriginalPostMessage = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      if (window.svtPostMessage && !forceUseOriginalPostMessage) {
        window.svtPostMessage.trigger(message);
      } else {
        if (window.wrappedJSObject && window.wrappedJSObject.postMessage) {
          window.wrappedJSObject.postMessage(message, origin);
        } else {
          window.postMessage(message, origin);
        }
      }
    }
    module.exports = {on:addMessageListener, trigger:triggerPostMessage};
  }]);
})();

