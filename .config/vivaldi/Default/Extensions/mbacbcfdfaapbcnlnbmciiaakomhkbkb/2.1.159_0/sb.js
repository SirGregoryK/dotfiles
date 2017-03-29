(function(SOVETNIK_SETTINGS, SCRIPT_URL) {
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
    __webpack_require__(1);
    __webpack_require__(22);
    __webpack_require__(23);
    __webpack_require__(25);
  }, function(module, exports, __webpack_require__) {
    var background = undefined;
    background = __webpack_require__(2);
    module.exports = background;
  }, function(module, exports, __webpack_require__) {
    var messaging = __webpack_require__(3);
    var siteInfo = __webpack_require__(5);
    var sovetnikInfo = __webpack_require__(13);
    var backend = __webpack_require__(8);
    var disabledDomains = __webpack_require__(12);
    var settingsPage = __webpack_require__(14);
    var notifications = __webpack_require__(15);
    messaging.onMessage(function(message, callback, tabInfo) {
      if (message.type) {
        switch(message.type) {
          case "getDomainData":
            callback && callback(siteInfo.getDomainData(message.domain));
            break;
          case "getSovetnikInfo":
            callback && callback(sovetnikInfo);
            break;
          case "canUseSovetnik":
            callback && callback(siteInfo.canUseSovetnik(message.url, message.referrer));
            break;
          case "secondScript":
            var _sovetnikInfo$settings = sovetnikInfo.settings, clid = _sovetnikInfo$settings.clid, affId = _sovetnikInfo$settings.affId;
            backend.isSecondScript(clid, affId, function(isSecondScript) {
              if (isSecondScript) {
                sovetnikInfo.setSecondScript();
              }
            });
            break;
          case "sovetnikRemoved":
            backend.isSovetnikRemoved(function(isRemoved) {
              if (isRemoved) {
                sovetnikInfo.setSovetnikRemovedState(true);
              }
            });
            break;
          case "offerRejected":
            backend.isOfferRejected(function(isOfferRejected) {
              if (isOfferRejected) {
                sovetnikInfo.setOfferRejected();
              }
            });
            break;
          case "domainDisabled":
            setTimeout(function() {
              backend.isDomainDisabled(message.domain, function(domainDisabled) {
                if (domainDisabled) {
                  disabledDomains.disableDomain(message.domain);
                }
              });
            }, 1500);
            break;
          case "domainEnabled":
            disabledDomains.enableDomain(message.domain);
            break;
          case "showSettingsPage":
            settingsPage.open();
            break;
          case "showNotification":
            notifications && notifications.showNotification(message.notification, tabInfo);
            break;
          case "sovetnikProductResponse":
            messaging.sendMessage && messaging.sendMessage(message, tabInfo);
            break;
        }
      }
    });
  }, function(module, exports, __webpack_require__) {
    var messaging = undefined;
    messaging = __webpack_require__(4);
    module.exports = messaging;
  }, function(module, exports) {
    var messaging = {onMessage:function onMessage(listener) {
      var _this = this;
      if (!chrome.runtime) {
        setTimeout(function() {
          return _this.onMessage(listener);
        }, 500);
        return;
      }
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        var fromTab = sender && sender.tab && sender.tab.id && sender.tab.url;
        if (fromTab) {
          return listener(request, sendResponse, {tabId:sender.tab.id, tabUrl:sender.tab.url});
        } else {
          listener(request, sendResponse);
        }
      });
    }, sendMessage:function sendMessage(msg, tabInfo) {
      if (tabInfo && tabInfo.tabId) {
        chrome.tabs.sendMessage(tabInfo.tabId, msg);
      }
    }};
    module.exports = messaging;
  }, function(module, exports, __webpack_require__) {
    var storage = __webpack_require__(6);
    var backend = __webpack_require__(8);
    var disabledDomains = __webpack_require__(12);
    var sovetnikInfo = __webpack_require__(13);
    var MD5 = __webpack_require__(18);
    var punycode = __webpack_require__(20);
    var SITE_INFO_UPDATE_INTERVAL = 24 * 60 * 60 * 1E3;
    var domainRE = /(https?):\/\/([^\/]+)/;
    var yandexRE = /ya(ndex)?\./;
    var sovetnikRE = /^https?:\/\/sovetnik/;
    var siteInfo = {_domainsInfo:null, _customCheckFunction:null, _init:function _init() {
      var domains = storage.get("domains") || "null";
      if (domains) {
        this._domainsInfo = JSON.parse(domains);
      }
      var lastUpdateTime = parseInt(storage.get("lastUpdateTime"), 10) || 0;
      if (Date.now() - lastUpdateTime > SITE_INFO_UPDATE_INTERVAL) {
        this._loadData();
      }
    }, _loadData:function _loadData() {
      var _this = this;
      backend.loadDomainsInfo(function(domainsInfo) {
        if (domainsInfo) {
          _this._domainsInfo = domainsInfo;
          storage.set("domains", JSON.stringify(domainsInfo));
          storage.set("lastUpdateTime", Date.now());
        }
      });
    }, getDomainData:function getDomainData(domain) {
      domain = punycode.toASCII(domain || "");
      while (this._domainsInfo && domain && domain.indexOf(".") !== -1) {
        var currentHash = MD5(domain).toString();
        if (this._domainsInfo[currentHash]) {
          return this._domainsInfo[currentHash];
        }
        domain = domain.replace(/^[^\.]+\./, "");
      }
      return null;
    }, canUseSovetnik:function canUseSovetnik(url, referrerUrl) {
      if (sovetnikInfo.withButton) {
        return true;
      }
      if (sovetnikInfo.isSecondScript || sovetnikInfo.isOfferRejected || sovetnikInfo.isSovetnikRemoved) {
        return false;
      }
      if (this._customCheckFunction && !this._customCheckFunction(url, referrerUrl)) {
        return false;
      }
      if (sovetnikRE.test(url)) {
        return true;
      }
      if (domainRE.test(url)) {
        var domain = RegExp.$2;
        var referrerDomain = undefined;
        if (domainRE.test(referrerUrl)) {
          referrerDomain = RegExp.$2;
        }
        var domainInfo = this.getDomainData(domain);
        var referrerInfo = this.getDomainData(referrerDomain);
        if (disabledDomains.isDomainDisabled(domain)) {
          return false;
        }
        if (domainInfo && domainInfo.rules && domainInfo.rules.length) {
          if (domainInfo.rules.indexOf("blacklisted") !== -1) {
            return false;
          }
          if (domainInfo.rules.indexOf("yandex-web-partner") !== -1) {
            return false;
          }
        }
        if (referrerInfo && referrerInfo.rules && referrerInfo.rules.length) {
          if (referrerInfo.rules.indexOf("blacklisted-by-referrer") !== -1) {
            return false;
          }
        }
        if (yandexRE.test(domain)) {
          return false;
        }
      } else {
        return false;
      }
      return true;
    }, setCustomCheckFunction:function setCustomCheckFunction(func) {
      this._customCheckFunction = func;
    }};
    siteInfo._init();
    module.exports = siteInfo;
  }, function(module, exports, __webpack_require__) {
    var storage = undefined;
    storage = __webpack_require__(7);
    module.exports = storage;
  }, function(module, exports) {
    var prefix = SOVETNIK_SETTINGS.sovetnikExtension ? "" : "sovetnik";
    var storage = {get:function get(name) {
      name = prefix + name;
      return localStorage.getItem(name);
    }, set:function set(name, value) {
      name = prefix + name;
      localStorage.setItem(name, value);
    }};
    module.exports = storage;
  }, function(module, exports, __webpack_require__) {
    var config = __webpack_require__(9);
    var apiHost = config.getApiHost();
    var XMLHttpRequest = __webpack_require__(10);
    var _require = __webpack_require__(11);
    var setTimeout = _require.setTimeout;
    var clearTimeout = _require.clearTimeout;
    var backend = {_checkUrl:apiHost + "/settings/check", _ysUrl:apiHost + "/sovetnik", _initExtensionUrl:apiHost + "/init-extension", _productsUrl:apiHost + "/products", _aviaStartUrl:apiHost + "/avia-search-start", _aviaCheckUrl:apiHost + "/avia-search-check", _domainsUrl:config.getDomainsJSONUrl(), _clientEventUrl:config.getClientEventUrl(), _trackCartUrl:apiHost + "/tc", _trackCheckoutUrl:apiHost + "/tch", _feedbackUrl:apiHost + "/feedback", _sendRequest:function _sendRequest(url, callback, errorCallback) {
      var xhr = new XMLHttpRequest;
      xhr.withCredentials = true;
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            callback && callback(xhr.responseText);
          } else {
            if (errorCallback) {
              errorCallback();
            }
          }
        }
      };
      if (errorCallback) {
        xhr.onerror = function() {
          errorCallback();
        };
      }
      xhr.send(null);
    }, _sendPostRequest:function _sendPostRequest(url, params, callback) {
      if (params === undefined) {
        params = {};
      }
      var xhr = new XMLHttpRequest;
      xhr.withCredentials = true;
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
          callback && callback(xhr.responseText);
        }
      };
      xhr.send(JSON.stringify(params));
    }, _checkFromBackend:function _checkFromBackend(url, params, callback) {
      var paramsArr = [];
      params.hash = params.hash || (new Date).getTime();
      for (var i in params) {
        paramsArr.push(i + "=" + encodeURIComponent(params[i]));
      }
      if (paramsArr.length) {
        url = url + "?" + paramsArr.join("&");
      }
      this._sendRequest(url, function(responseText) {
        if (responseText) {
          var response = JSON.parse(responseText);
          if (response.hasOwnProperty("status")) {
            callback(response.status);
          }
        }
      });
    }, _getRequestInterval:function _getRequestInterval() {
      var startInterval = 3E4;
      this._attemptCount = this._attemptCount || 0;
      return startInterval + Math.pow(2, this._attemptCount++) * 1E3;
    }, loadDomainsInfo:function loadDomainsInfo(callback) {
      var _this = this;
      var timeoutId = undefined;
      timeoutId = setTimeout(function() {
        return _this.loadDomainsInfo(callback);
      }, this._getRequestInterval());
      var url = this._domainsUrl + "?hash=" + Date.now();
      this._sendRequest(url, function(responseText) {
        if (responseText) {
          try {
            var domainsInfo = JSON.parse(responseText);
            clearTimeout(timeoutId);
            callback(domainsInfo);
          } catch (ex) {
          }
        }
      });
    }, isDomainDisabled:function isDomainDisabled(domain, callback) {
      this._checkFromBackend(this._checkUrl, {domain:domain}, callback);
    }, isOfferRejected:function isOfferRejected(callback) {
      this._checkFromBackend(this._checkUrl, {offer:true}, callback);
    }, isSovetnikRemoved:function isSovetnikRemoved(callback) {
      this._checkFromBackend(this._checkUrl, {removed:true}, callback);
    }, isSecondScript:function isSecondScript(clid, affId, callback) {
      this._checkFromBackend(this._checkUrl, {affId:affId, clid:clid}, callback);
    }, setStartedInfo:function setStartedInfo(callback) {
      this._sendPostRequest(this._ysUrl, {version:1}, callback);
    }, _getQueryString:function _getQueryString() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      return Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }).join("&");
    }, _getAviaStartUrl:function _getAviaStartUrl() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var qs = Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }).join("&");
      return this._aviaStartUrl + "?" + qs;
    }, _getAviaCheckUrl:function _getAviaCheckUrl() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var qs = Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
      }).join("&");
      return this._aviaCheckUrl + "?" + qs;
    }, sendAviaStartRequest:function sendAviaStartRequest(params, callback) {
      this._sendRequest(this._getAviaStartUrl(params), callback, function() {
        return callback({error:"server"});
      });
    }, sendAviaCheckRequest:function sendAviaCheckRequest(params, callback) {
      this._sendRequest(this._getAviaCheckUrl(params), callback, function() {
        return callback({error:"server"});
      });
    }, _getProductsUrl:function _getProductsUrl() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var qs = this._getQueryString(params);
      return this._productsUrl + "?" + qs;
    }, sendProductRequest:function sendProductRequest(params, callback) {
      this._sendRequest(this._getProductsUrl(params), callback, function() {
        return callback({error:"server"});
      });
    }, initExtension:function initExtension(settings, query, callback) {
      var _this2 = this;
      if (query === undefined) {
        query = {};
      }
      var url = this._initExtensionUrl + "?settings=" + encodeURIComponent(JSON.stringify(settings)) + "&hash=" + Date.now();
      var queryString = this._getQueryString(query);
      url += queryString && "&" + queryString;
      var timeoutId = undefined;
      timeoutId = setTimeout(function() {
        return _this2.loadDomainsInfo(settings, callback);
      }, this._getRequestInterval());
      this._sendRequest(url, function(initData) {
        if (initData) {
          try {
            clearTimeout(timeoutId);
            callback(initData);
          } catch (ex) {
          }
        }
      });
    }, trackCart:function trackCart(params) {
      var url = this._trackCartUrl + "?" + this._getQueryString(params);
      this._sendRequest(url);
    }, trackCheckout:function trackCheckout(params) {
      var url = this._trackCheckoutUrl + "?" + this._getQueryString(params);
      this._sendRequest(url);
    }, sendSovetnikStats:function sendSovetnikStats(params, callback) {
      this._sendPostRequest(this._clientEventUrl, params, callback);
    }, sendFeedback:function sendFeedback(params) {
      this._sendPostRequest(this._feedbackUrl, params);
    }};
    module.exports = backend;
  }, function(module, exports) {
    var config = {_current:{apiHost:"%SOVETNIK_API_HOST%", storageHost:"%SOVETNIK_STORAGE_HOST%", settingsHost:"%SOVETNIK_SETTINGS_HOST%", staticHost:"%SOVETNIK_STORAGE_HOST%"}, _production:{apiHost:"https://sovetnik.market.yandex.ru", storageHost:"https://dl.metabar.ru", settingsHost:"https://sovetnik.market.yandex.ru", landingHost:"https://sovetnik.yandex.ru", staticHost:"https://yastatic.net"}, _isPatched:function _isPatched(host) {
      return !/^%[^%]+%$/.test(host);
    }, _getHost:function _getHost(hostName) {
      if (this._current[hostName] && this._isPatched(this._current[hostName])) {
        return this._current[hostName];
      }
      return this._production[hostName];
    }, getApiHost:function getApiHost() {
      return this._getHost("apiHost");
    }, getStorageHost:function getStorageHost() {
      return this._getHost("storageHost");
    }, getSettingsURL:function getSettingsURL() {
      var host = this._getHost("settingsHost");
      if (host === this._production.settingsHost) {
        return host + "/app/settings";
      } else {
        return host + "/sovetnik";
      }
    }, getSettingsURLMobile:function getSettingsURLMobile() {
      var host = this._getHost("settingsHost");
      if (host === this._production.settingsHost) {
        return host + "/mobile/settings";
      } else {
        return host + "/sovetnik-mobile";
      }
    }, getSettingsHost:function getSettingsHost() {
      return this._getHost("settingsHost");
    }, getClientEventUrl:function getClientEventUrl() {
      return this._getHost("apiHost") + "/client";
    }, getFeedbackEventUrl:function getFeedbackEventUrl() {
      return this._getHost("apiHost") + "/feedback";
    }, getAviaFeedbackEventUrl:function getAviaFeedbackEventUrl() {
      return this._getHost("apiHost") + "/feedback-avia";
    }, getLandingHost:function getLandingHost() {
      return this._getHost("landingHost");
    }, getDomainsJSONUrl:function getDomainsJSONUrl() {
      var useCDN = this._getHost("staticHost") === this._production.staticHost || this._getHost("staticHost") === this._production.storageHost;
      if (useCDN) {
        return this._production.staticHost + "/sovetnik/_/script-data/domains.json";
      }
      return this._getHost("staticHost") + "/static/script-data/domains.json";
    }, getUninstallUrl:function getUninstallUrl() {
      return this.getLandingHost() + "/goodbye";
    }, getCPAOnboardingTrackingUrl:function getCPAOnboardingTrackingUrl() {
      return this.getApiHost() + "/cpa-onboarding";
    }};
    module.exports = config;
  }, function(module, exports) {
    var XHR = undefined;
    XHR = XMLHttpRequest;
    module.exports = XHR;
  }, function(module, exports) {
    var timeouts = {};
    timeouts.setTimeout = function(fn, interval) {
      return setTimeout(fn, interval);
    };
    timeouts.clearTimeout = function(id) {
      return clearTimeout(id);
    };
    timeouts.setInterval = function(fn, interval) {
      return setInterval(fn, interval);
    };
    timeouts.clearInterval = function(id) {
      return clearInterval(id);
    };
    module.exports = timeouts;
  }, function(module, exports, __webpack_require__) {
    var storage = __webpack_require__(6);
    var cacheInterval = 7 * 24 * 60 * 60 * 1E3;
    var domains = storage.get("disabledDomains");
    domains = domains ? JSON.parse(domains) : {};
    var currentTime = Date.now();
    for (var domain in domains) {
      if (domains[domain] && currentTime - domains[domain] > cacheInterval) {
        domains[domain] = 0;
      }
    }
    var disabledDomains = {isDomainDisabled:function isDomainDisabled(domain) {
      return !!domains[domain];
    }, disableDomain:function disableDomain(domain) {
      domains[domain] = Date.now();
      storage.set("disabledDomains", JSON.stringify(domains));
    }, enableDomain:function enableDomain(domain) {
      delete domains[domain];
      storage.set("disabledDomains", JSON.stringify(domains));
    }};
    module.exports = disabledDomains;
  }, function(module, exports, __webpack_require__) {
    var storage = __webpack_require__(6);
    var settingsPage = __webpack_require__(14);
    var notifications = __webpack_require__(15);
    var config = __webpack_require__(9);
    var SECOND_SCRIPT_UPDATE_INTERVAL = 24 * 60 * 60 * 1E3;
    var isOfferRejected = storage.get("offerRejected");
    var isSovetnikRemoved = storage.get("sovetnikRemoved");
    if (isSovetnikRemoved) {
      isSovetnikRemoved = JSON.parse(isSovetnikRemoved);
    }
    var secondScriptTrackDate = storage.get("secondScript");
    secondScriptTrackDate = secondScriptTrackDate ? parseInt(secondScriptTrackDate, 10) : 0;
    var isSecondScript = Date.now() - secondScriptTrackDate < SECOND_SCRIPT_UPDATE_INTERVAL;
    var settings = SOVETNIK_SETTINGS;
    settings.affId = settings.affId || 1;
    var userSettings = storage.get("userSettings");
    if (!userSettings) {
      userSettings = {};
    } else {
      userSettings = JSON.parse(userSettings);
    }
    for (var i in userSettings) {
      if (userSettings.hasOwnProperty(i)) {
        settings[i] = userSettings[i];
      }
    }
    settings.extensionStorage = true;
    var presavedClid = storage.get("yandex.statistics.clid.21");
    var presavedAffId = storage.get("sovetnik.aff_id");
    if (!presavedClid) {
      presavedClid = storage.get("sovetnik.yandex.statistics.clid.21");
    }
    if (presavedClid) {
      presavedClid = presavedClid.replace(/[^\d\-]/g, "");
      settings.clid = presavedClid;
    }
    if (presavedAffId) {
      settings.affId = presavedAffId;
    }
    if (notifications) {
      notifications.getAvailabilityStatus(function(status, permissionGranted) {
        settings.notificationStatus = status;
        settings.notificationPermissionGranted = permissionGranted;
      });
    }
    if (settings.browser === "chrome") {
      if (window.navigator.userAgent.indexOf("OPR") > -1 || window.navigator.userAgent.indexOf("Opera") > -1) {
        settings.browser = "opera";
      }
    }
    var onUserSettingsListeners = [];
    var sovetnikInfo = {isOfferRejected:isOfferRejected, isSecondScript:isSecondScript, isSovetnikRemoved:isSovetnikRemoved, withButton:settings.withButton, settings:settings, url:typeof SCRIPT_URL !== "undefined" ? SCRIPT_URL : "", setCustomSettingsPage:function setCustomSettingsPage(func) {
      settings.customSettingsPage = true;
      settingsPage.addCustomFunc(func);
    }, setOfferRejected:function setOfferRejected() {
      this.isOfferRejected = true;
      storage.set("offerRejected", "true");
    }, setSovetnikRemovedState:function setSovetnikRemovedState(state) {
      this.isSovetnikRemoved = state;
      storage.set("sovetnikRemoved", JSON.stringify(state));
    }, setSecondScript:function setSecondScript() {
      this.isSecondScript = true;
      storage.set("secondScript", JSON.stringify(Date.now()));
    }, setUserSetting:function setUserSetting(name, value) {
      settings[name] = value;
      userSettings[name] = value;
      storage.set("userSettings", JSON.stringify(userSettings));
      onUserSettingsListeners.forEach(function(listener) {
        try {
          listener();
        } catch (ex) {
        }
      });
    }, onUserSettingChanged:function onUserSettingChanged(listener) {
      onUserSettingsListeners.push(listener);
    }, setClid:function setClid(clid) {
      this.settings.clid = clid;
      storage.set("yandex.statistics.clid.21", clid);
      onUserSettingsListeners.forEach(function(listener) {
        try {
          listener();
        } catch (ex) {
        }
      });
    }, setAffId:function setAffId(affId) {
      this.settings.affId = affId;
      storage.set("sovetnik.aff_id", affId);
      onUserSettingsListeners.forEach(function(listener) {
        try {
          listener();
        } catch (ex) {
        }
      });
    }, isSovetnikExtension:function isSovetnikExtension() {
      return !!settings.sovetnikExtension;
    }, getUninstallUrl:function getUninstallUrl() {
      var reason = arguments.length <= 0 || arguments[0] === undefined ? "app-remove" : arguments[0];
      var path = config.getUninstallUrl();
      var params = ["clid=" + settings.clid, "aff_id=" + settings.affId, "disabling_type=app-remove"].join("&");
      return path + "?" + params;
    }, onNotificationPermissionChanged:function onNotificationPermissionChanged(isGranted) {
      if (isGranted) {
        settings.notificationPermissionGranted = true;
      } else {
        delete settings.notificationStatus;
        delete settings.notificationPermissionGranted;
      }
    }, isStatsEnabled:function isStatsEnabled() {
      return !settings.statsDisabled;
    }};
    module.exports = sovetnikInfo;
  }, function(module, exports) {
    var settingsPage = {_customFunc:null, addCustomFunc:function addCustomFunc(func) {
      this._customFunc = func;
    }, open:function open() {
      this._customFunc && this._customFunc();
    }};
    module.exports = settingsPage;
  }, function(module, exports, __webpack_require__) {
    var notifications = undefined;
    notifications = __webpack_require__(16);
    module.exports = notifications;
  }, function(module, exports, __webpack_require__) {
    var _createClass = function() {
      function defineProperties(target, props) {
        for (var i = 0;i < props.length;i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) {
            descriptor.writable = true;
          }
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) {
          defineProperties(Constructor.prototype, protoProps);
        }
        if (staticProps) {
          defineProperties(Constructor, staticProps);
        }
        return Constructor;
      };
    }();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    var backend = __webpack_require__(8);
    var tabs = __webpack_require__(17);
    var storage = __webpack_require__(7);
    var isOpera = window.navigator.userAgent.indexOf("OPR") > -1 || window.navigator.userAgent.indexOf("Opera") > -1;
    var isYandexBrowser = window.navigator.userAgent.indexOf("YaBrowser") !== -1;
    var isFirefoxBrowser = window.navigator.userAgent.indexOf("Firefox") !== -1;
    var KEY_NOTIFICATION_PERMISSION_REQUESTS = "notification-permission-requests";
    var KEY_LAST_NOTIFICATION_REQUEST = "last-notification-request";
    var notificationQueue = {};
    var cachedNotification = undefined;
    var isNotificationsInitialized = false;
    var Notification = function() {
      function Notification(link, buttons, transactionId, url, notificationData, tabId, duration) {
        _classCallCheck(this, Notification);
        this.link = link;
        this.buttons = buttons;
        this.transactionId = transactionId;
        this.url = url;
        this.notificationData = notificationData;
        this.tabId = tabId;
        this.duration = duration;
        if (tabId) {
          this.timeout = setTimeout(this.removeFromQueue.bind(this), 10 * 60 * 1E3);
        }
      }
      _createClass(Notification, [{key:"show", value:function show() {
        var _this = this;
        var create = function create() {
          chrome.notifications.create("svt", _this.notificationData, function() {
            var clear = function clear() {
              chrome.notifications.clear("svt", function() {
              });
              _this.durationTimeout && clearTimeout(_this.durationTimeout);
            };
            if (_this.duration && _this.notificationData.requireInteraction) {
              _this.durationTimeout = setTimeout(clear, parseInt(_this.duration, 10));
            }
            _this.clear = clear;
            cachedNotification = _this;
            _this.onShown();
          });
        };
        chrome && chrome.notifications && chrome.notifications.clear("svt", create);
      }}, {key:"onClosed", value:function onClosed(needSendStats) {
        var _this2 = this;
        if (needSendStats) {
          getAvailabilityStatus(function(status) {
            var clientEvent = {transaction_id:_this2.transactionId, interaction:"notification_close", interaction_details:status, type_view:"notification", url:_this2.url};
            backend.sendSovetnikStats(clientEvent);
          });
        }
        this.removeFromQueue();
        this.clear && this.clear();
        this.timeout && clearTimeout(this.timeout);
      }}, {key:"onShown", value:function onShown() {
        var _this3 = this;
        getAvailabilityStatus(function(status) {
          var clientEvent = {transaction_id:_this3.transactionId, interaction:"notification_shown", interaction_details:status, type_view:"notification", url:_this3.url};
          backend.sendSovetnikStats(clientEvent);
        });
      }}, {key:"onClicked", value:function onClicked() {
        tabs.create(this.link);
        this.clear && this.clear();
      }}, {key:"onButtonClicked", value:function onButtonClicked(index) {
        if (this.buttons && index < this.buttons.length) {
          tabs.create(this.buttons[index].link);
        }
        this.clear && this.clear();
      }}, {key:"removeFromQueue", value:function removeFromQueue() {
        if (this.tabId && notificationQueue[this.tabId] === this) {
          delete notificationQueue[this.tabId];
        }
      }}]);
      return Notification;
    }();
    function canRequestNotificationPermission() {
      var lastRequestTime = parseInt(storage.get(KEY_LAST_NOTIFICATION_REQUEST), 10) || 0;
      var interval = getRequestPermissionInterval();
      return Date.now() - lastRequestTime > interval;
    }
    function getRequestPermissionInterval() {
      var notificationPermissionRequests = parseInt(storage.get(KEY_NOTIFICATION_PERMISSION_REQUESTS), 10) || 0;
      var days = {0:0, 1:3, 2:7, 3:30};
      if (typeof days[notificationPermissionRequests] === "undefined") {
        days[notificationPermissionRequests] = 30;
      }
      return days[notificationPermissionRequests] * 24 * 60 * 60 * 1E3;
    }
    function checkPermissionsAndShowNotification(notificationInfo, tabInfo) {
      var _this4 = this;
      if (isNotificationsInitialized) {
        return showNotification(notificationInfo, tabInfo);
      }
      if (!chrome.permissions) {
        init();
        showNotification(notificationInfo, tabInfo);
        return;
      }
      chrome.permissions.request({permissions:["notifications"]}, function(isGranted) {
        var clientEvent = {transaction_id:_this4.transactionId, interaction:"notification_permission", interaction_details:isGranted ? "granted" : "denied", type_view:"notification", url:_this4.url};
        backend.sendSovetnikStats(clientEvent);
        var sovetnikInfo = __webpack_require__(13);
        sovetnikInfo.onNotificationPermissionChanged(isGranted);
        storage.set(KEY_LAST_NOTIFICATION_REQUEST, Date.now());
        var requestPermissionsCount = parseInt(storage.get(KEY_NOTIFICATION_PERMISSION_REQUESTS), 10) || 0;
        storage.set(KEY_NOTIFICATION_PERMISSION_REQUESTS, requestPermissionsCount + 1);
        if (isGranted) {
          init();
          showNotification(notificationInfo, tabInfo);
        }
      });
    }
    function showNotification(notificationInfo, tabInfo) {
      var title = notificationInfo.title;
      var text = notificationInfo.text;
      var icon = notificationInfo.icon;
      var link = notificationInfo.link;
      var contextMessage = notificationInfo.contextMessage;
      var mainPhoto = notificationInfo.mainPhoto;
      var buttons = notificationInfo.buttons;
      var transactionId = notificationInfo.transactionId;
      var time = notificationInfo.time;
      var url = notificationInfo.url;
      var duration = notificationInfo.duration;
      var requireInteraction = notificationInfo.requireInteraction;
      var templateType = mainPhoto ? "image" : "basic";
      var notification = {type:templateType, title:title, message:text, isClickable:true};
      if (mainPhoto && !isOpera || !icon) {
        if (mainPhoto && !isOpera) {
          notification.imageUrl = mainPhoto;
        }
        if (isYandexBrowser) {
          icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IArs4c6QAAAb5JREFUWAntVb1KA0EQnrkkJ1FT2qVQ0gh2IghWplAj8Q3S5wGSQrBK6W8KRdDU6a7QSERDev/eIaBoIb5AMJqMs8FAuCx3u9wKBu5guduZ7+b7duZmDiC8wgyMSQZQpjNbuCWZPWZPzF3upp9lvqA2SydAt/O1qoPXwWoJAaQ/EyItzfBJssXGAxAt920IL9dHmdlhv6lnXyFbxUaOiKqmCEWc63JmhNe3NPFE0gGEd5NCZLF8hTilhQ4SnsleNmnzFSLI4hH7HBE6JondsZSEOAdpLg067pdN7pWE9AkjdGyS2B1LWUh9P/MEiI/uAKb2ykIEIffcSVBiRHyVxdASEriVEb+BcC+wEN1W5k7rcTnvEK3tSNSen0nYiXp5/VQmJCozetlEK7d7nztEYMtwCNjmf1KTCGsxhPrF4caHDOe2jYxaN0C257Ff5bGfG/i47oKsLsgnk9NNp7DSHvhU79oZ6QfmVsYuLPFzzbKsq8WptftSCXuqpCFurDKg/LGmUqlNPlnl93T5Vqt143VSXbzOQKtwpyTFGhLkpUULryPEizSwT0dInufFm1jMmldg1sUrhAwhYQb+QQZ+AGEtdj7ypn8ZAAAAAElFTkSuQmCC"
          ;
        } else {
          icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IArs4c6QAAAqdJREFUeAHt2s0uA1EcBfD/tNWS+GiJRheIDYJEbHykg1gJYecFPIMlS0s2HsDOG9hYaZNuLFiwEixEojshdgjm3oSEdIw60vtvciaRtL1zxp3fnKujeG/BJtz+LBD7c5JBK0BAsAgEJCAoAMbZQAKCAmCcDSQgKADG2UACggJgnA0kICgAxtlAAoICYJwNJCAoAMbZQAKCAmCcDSQgKADG2UACggJgnA0kICgAxtlAAoICYJwNBAETYL7q+NLaQcXM7sasZDONFcc0v6imgWeXd5qdQuemB/CqPgE9l//etrZzJOfX9/bqZtubZHd9JvRKax1wClg4KcvW3um/2uxvz//r8aIO5nQJ+6NdkmlNRc1R9bhTwETck8WpbtVAUZNzCmgmtxAANiScTyPKKXTc+czTLUkxS7leN+eABm55uqde/UQFYH93mwz0pusSUQWgbaGPt7Az01Tzi6AGEL2licdjsjLXV3PAmn+YEHaGH7c0eweXYbt8eT0W8+yynxzOyuRI1n4Q4eLd3OlvIl9Egif3j0+yulmU55fX70P2eaohLmMDHTIRoI0PdUpbc7LifrV8UU0DzUl/3NIcHt9+GqRbUhbLoBm8pLJ7RlWARs3c0lzcPNhladAGg3dnz/v0VPdA1RJWp/OLCal5F/7FXFXuQkDwsqgALBaL4vu+/TKPo7Zq9486HjKu4megwSuXy/Y8crmclEqlH8+p2v1/PBg4qKKB4Dm4jZu/ibjeCoXCWz6ft1/mcdRW7f5Rx0PGVSxhtxXCvjuXMOan4/NA8BycxtlAkJ+ABAQFwDgbSEBQAIyzgQQEBcA4G0hAUACMs4EEBAXAOBtIQFAAjLOBBAQFwDgbSEBQAIyzgQQEBcA4G0hAUACMs4EEBAXAOBtIQFAAjL8DeaaYIEw40ZwAAAAASUVORK5CYII="
          ;
        }
      }
      if (contextMessage) {
        notification.contextMessage = contextMessage;
      }
      if (time) {
        notification.eventTime = time;
      }
      if (requireInteraction) {
        notification.requireInteraction = true;
      }
      notification.iconUrl = icon;
      if (buttons && buttons.length && !isOpera) {
        notification.buttons = buttons.map(function(button) {
          return {title:button.title};
        });
      }
      if (tabInfo && tabInfo.tabId) {
        tabs.getActiveTabId(function(tabId) {
          var ntf = new Notification(link, buttons, transactionId, url, notification, tabInfo.tabId, duration);
          if (tabId === tabInfo.tabId) {
            ntf.show();
          } else {
            notificationQueue[tabInfo.tabId] = ntf;
          }
        });
      }
    }
    function getAvailabilityStatus(callback) {
      if (!chrome.permissions) {
        var _status = isFirefoxBrowser && "firefox" || "unknown";
        callback(_status, !!chrome.notifications);
        return;
      }
      chrome.permissions.contains({permissions:["notifications"]}, function(result) {
        var status = undefined;
        var permissionGranted = undefined;
        if (result) {
          permissionGranted = true;
          if (isYandexBrowser) {
            status = "yandex";
          } else {
            if (isOpera) {
              status = "opera";
            } else {
              status = "chrome";
            }
          }
        } else {
          if (canRequestNotificationPermission()) {
            if (isYandexBrowser) {
              status = "yandex";
            } else {
              if (isOpera) {
                status = "opera";
              } else {
                status = "chrome";
              }
            }
            permissionGranted = false;
          }
        }
        callback(status, permissionGranted);
      });
    }
    function init() {
      if (!isNotificationsInitialized) {
        isNotificationsInitialized = true;
        chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
          cachedNotification && cachedNotification.onClosed(byUser);
        });
        chrome.notifications.onClicked.addListener(function(notificationId) {
          if (cachedNotification) {
            cachedNotification.onClicked();
          }
        });
        chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonId) {
          if (cachedNotification) {
            cachedNotification.onButtonClicked(buttonId);
          }
        });
        chrome.tabs.onActivated.addListener(function(_ref) {
          var tabId = _ref.tabId;
          if (notificationQueue[tabId]) {
            notificationQueue[tabId].show();
          }
        });
      }
    }
    getAvailabilityStatus(function(status, permissionGranted) {
      if (permissionGranted) {
        init();
      }
    });
    module.exports = {showNotification:checkPermissionsAndShowNotification, getAvailabilityStatus:getAvailabilityStatus};
  }, function(module, exports) {
    var tabs = {create:function create(url) {
      chrome.windows.getAll({}, function(windows) {
        if (windows && windows.length) {
          var currentWindow = undefined;
          var normalWindows = windows.filter(function(win) {
            return win && win.type === "normal";
          });
          if (normalWindows.length) {
            var focusedWindows = normalWindows.filter(function(win) {
              return win && win.focused;
            });
            currentWindow = focusedWindows.length ? focusedWindows[0] : normalWindows[0];
          } else {
            currentWindow = windows[0];
          }
          if (typeof currentWindow.id !== "undefined") {
            chrome.tabs.create({url:url, windowId:currentWindow.id});
          }
        }
      });
    }, onRemoved:function onRemoved(callback) {
      chrome.tabs.onRemoved.addListener(callback);
    }, onReplaced:function onReplaced(callback) {
      chrome.tabs.onReplaced.addListener(callback);
    }, onActivate:function onActivate(callback) {
      var _this = this;
      chrome.tabs.onActivated.addListener(function(_ref) {
        var tabId = _ref.tabId;
        return callback(tabId);
      });
      chrome.tabs.onUpdated.addListener(function(tabId, change) {
        if (change && change.status === "complete") {
          _this.getActiveTabId(function(activeTabId) {
            if (activeTabId === tabId) {
              callback(tabId);
            }
          });
        }
      });
      chrome.tabs.onCreated.addListener(function(tab) {
        if (tab && tab.id) {
          callback(tab.id);
        }
      });
      chrome.windows.onFocusChanged.addListener(function() {
        _this.getActiveTabId(callback);
      });
    }, onUpdate:function onUpdate(callback) {
      var _this2 = this;
      chrome.tabs.onUpdated.addListener(function(tabId, change) {
        if (change && change.status === "loading" && change.url) {
          _this2.getActiveTabId(function(activeTabId) {
            if (activeTabId === tabId) {
              callback(tabId);
            }
          });
        }
      });
    }, getActiveTabInfo:function getActiveTabInfo(callback) {
      chrome.tabs.query({currentWindow:true, active:true}, function(tabs) {
        if (tabs && tabs.length && tabs[0].id) {
          callback({tabId:tabs[0].id, tabUrl:tabs[0].url});
        } else {
          callback({});
        }
      });
    }, getActiveTabId:function getActiveTabId(callback) {
      chrome.tabs.query({currentWindow:true, active:true}, function(tabs) {
        callback(tabs && tabs.length && tabs[0].id);
      });
    }, getActiveTabUrl:function getActiveTabUrl(callback) {
      chrome.tabs.query({currentWindow:true, active:true}, function(tabs) {
        callback(tabs && tabs.length && tabs[0].url);
      });
    }, getTabUrl:function getTabUrl(id, callback) {
      chrome.tabs.get(id, function(tab) {
        if (!chrome.runtime.lastError) {
          callback(tab && tab.url);
        }
      });
    }, getAllUrls:function getAllUrls(callback) {
      chrome.tabs.query({}, function(tabs) {
        var urls = tabs.map(function(tab) {
          return tab.url;
        }).filter(function(url) {
          return !!url;
        });
        callback(urls);
      });
    }};
    module.exports = tabs;
  }, function(module, exports, __webpack_require__) {
    (function(root, factory) {
      if (true) {
        module.exports = exports = factory(__webpack_require__(19));
      } else {
        if (typeof define === "function" && define.amd) {
          define(["./core"], factory);
        } else {
          factory(root.CryptoJS);
        }
      }
    })(this, function(CryptoJS) {
      (function(Math) {
        var C = CryptoJS;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var T = [];
        (function() {
          for (var i = 0;i < 64;i++) {
            T[i] = Math.abs(Math.sin(i + 1)) * 4294967296 | 0;
          }
        })();
        var MD5 = C_algo.MD5 = Hasher.extend({_doReset:function() {
          this._hash = new WordArray.init([1732584193, 4023233417, 2562383102, 271733878]);
        }, _doProcessBlock:function(M, offset) {
          for (var i = 0;i < 16;i++) {
            var offset_i = offset + i;
            var M_offset_i = M[offset_i];
            M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
          }
          var H = this._hash.words;
          var M_offset_0 = M[offset + 0];
          var M_offset_1 = M[offset + 1];
          var M_offset_2 = M[offset + 2];
          var M_offset_3 = M[offset + 3];
          var M_offset_4 = M[offset + 4];
          var M_offset_5 = M[offset + 5];
          var M_offset_6 = M[offset + 6];
          var M_offset_7 = M[offset + 7];
          var M_offset_8 = M[offset + 8];
          var M_offset_9 = M[offset + 9];
          var M_offset_10 = M[offset + 10];
          var M_offset_11 = M[offset + 11];
          var M_offset_12 = M[offset + 12];
          var M_offset_13 = M[offset + 13];
          var M_offset_14 = M[offset + 14];
          var M_offset_15 = M[offset + 15];
          var a = H[0];
          var b = H[1];
          var c = H[2];
          var d = H[3];
          a = FF(a, b, c, d, M_offset_0, 7, T[0]);
          d = FF(d, a, b, c, M_offset_1, 12, T[1]);
          c = FF(c, d, a, b, M_offset_2, 17, T[2]);
          b = FF(b, c, d, a, M_offset_3, 22, T[3]);
          a = FF(a, b, c, d, M_offset_4, 7, T[4]);
          d = FF(d, a, b, c, M_offset_5, 12, T[5]);
          c = FF(c, d, a, b, M_offset_6, 17, T[6]);
          b = FF(b, c, d, a, M_offset_7, 22, T[7]);
          a = FF(a, b, c, d, M_offset_8, 7, T[8]);
          d = FF(d, a, b, c, M_offset_9, 12, T[9]);
          c = FF(c, d, a, b, M_offset_10, 17, T[10]);
          b = FF(b, c, d, a, M_offset_11, 22, T[11]);
          a = FF(a, b, c, d, M_offset_12, 7, T[12]);
          d = FF(d, a, b, c, M_offset_13, 12, T[13]);
          c = FF(c, d, a, b, M_offset_14, 17, T[14]);
          b = FF(b, c, d, a, M_offset_15, 22, T[15]);
          a = GG(a, b, c, d, M_offset_1, 5, T[16]);
          d = GG(d, a, b, c, M_offset_6, 9, T[17]);
          c = GG(c, d, a, b, M_offset_11, 14, T[18]);
          b = GG(b, c, d, a, M_offset_0, 20, T[19]);
          a = GG(a, b, c, d, M_offset_5, 5, T[20]);
          d = GG(d, a, b, c, M_offset_10, 9, T[21]);
          c = GG(c, d, a, b, M_offset_15, 14, T[22]);
          b = GG(b, c, d, a, M_offset_4, 20, T[23]);
          a = GG(a, b, c, d, M_offset_9, 5, T[24]);
          d = GG(d, a, b, c, M_offset_14, 9, T[25]);
          c = GG(c, d, a, b, M_offset_3, 14, T[26]);
          b = GG(b, c, d, a, M_offset_8, 20, T[27]);
          a = GG(a, b, c, d, M_offset_13, 5, T[28]);
          d = GG(d, a, b, c, M_offset_2, 9, T[29]);
          c = GG(c, d, a, b, M_offset_7, 14, T[30]);
          b = GG(b, c, d, a, M_offset_12, 20, T[31]);
          a = HH(a, b, c, d, M_offset_5, 4, T[32]);
          d = HH(d, a, b, c, M_offset_8, 11, T[33]);
          c = HH(c, d, a, b, M_offset_11, 16, T[34]);
          b = HH(b, c, d, a, M_offset_14, 23, T[35]);
          a = HH(a, b, c, d, M_offset_1, 4, T[36]);
          d = HH(d, a, b, c, M_offset_4, 11, T[37]);
          c = HH(c, d, a, b, M_offset_7, 16, T[38]);
          b = HH(b, c, d, a, M_offset_10, 23, T[39]);
          a = HH(a, b, c, d, M_offset_13, 4, T[40]);
          d = HH(d, a, b, c, M_offset_0, 11, T[41]);
          c = HH(c, d, a, b, M_offset_3, 16, T[42]);
          b = HH(b, c, d, a, M_offset_6, 23, T[43]);
          a = HH(a, b, c, d, M_offset_9, 4, T[44]);
          d = HH(d, a, b, c, M_offset_12, 11, T[45]);
          c = HH(c, d, a, b, M_offset_15, 16, T[46]);
          b = HH(b, c, d, a, M_offset_2, 23, T[47]);
          a = II(a, b, c, d, M_offset_0, 6, T[48]);
          d = II(d, a, b, c, M_offset_7, 10, T[49]);
          c = II(c, d, a, b, M_offset_14, 15, T[50]);
          b = II(b, c, d, a, M_offset_5, 21, T[51]);
          a = II(a, b, c, d, M_offset_12, 6, T[52]);
          d = II(d, a, b, c, M_offset_3, 10, T[53]);
          c = II(c, d, a, b, M_offset_10, 15, T[54]);
          b = II(b, c, d, a, M_offset_1, 21, T[55]);
          a = II(a, b, c, d, M_offset_8, 6, T[56]);
          d = II(d, a, b, c, M_offset_15, 10, T[57]);
          c = II(c, d, a, b, M_offset_6, 15, T[58]);
          b = II(b, c, d, a, M_offset_13, 21, T[59]);
          a = II(a, b, c, d, M_offset_4, 6, T[60]);
          d = II(d, a, b, c, M_offset_11, 10, T[61]);
          c = II(c, d, a, b, M_offset_2, 15, T[62]);
          b = II(b, c, d, a, M_offset_9, 21, T[63]);
          H[0] = H[0] + a | 0;
          H[1] = H[1] + b | 0;
          H[2] = H[2] + c | 0;
          H[3] = H[3] + d | 0;
        }, _doFinalize:function() {
          var data = this._data;
          var dataWords = data.words;
          var nBitsTotal = this._nDataBytes * 8;
          var nBitsLeft = data.sigBytes * 8;
          dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
          var nBitsTotalH = Math.floor(nBitsTotal / 4294967296);
          var nBitsTotalL = nBitsTotal;
          dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
          dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
          data.sigBytes = (dataWords.length + 1) * 4;
          this._process();
          var hash = this._hash;
          var H = hash.words;
          for (var i = 0;i < 4;i++) {
            var H_i = H[i];
            H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
          }
          return hash;
        }, clone:function() {
          var clone = Hasher.clone.call(this);
          clone._hash = this._hash.clone();
          return clone;
        }});
        function FF(a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function GG(a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function HH(a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function II(a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        C.MD5 = Hasher._createHelper(MD5);
        C.HmacMD5 = Hasher._createHmacHelper(MD5);
      })(Math);
      return CryptoJS.MD5;
    });
  }, function(module, exports, __webpack_require__) {
    (function(root, factory) {
      if (true) {
        module.exports = exports = factory();
      } else {
        if (typeof define === "function" && define.amd) {
          define([], factory);
        } else {
          root.CryptoJS = factory();
        }
      }
    })(this, function() {
      var CryptoJS = CryptoJS || function(Math, undefined) {
        var C = {};
        var C_lib = C.lib = {};
        var Base = C_lib.Base = function() {
          function F() {
          }
          return {extend:function(overrides) {
            F.prototype = this;
            var subtype = new F;
            if (overrides) {
              subtype.mixIn(overrides);
            }
            if (!subtype.hasOwnProperty("init")) {
              subtype.init = function() {
                subtype.$super.init.apply(this, arguments);
              };
            }
            subtype.init.prototype = subtype;
            subtype.$super = this;
            return subtype;
          }, create:function() {
            var instance = this.extend();
            instance.init.apply(instance, arguments);
            return instance;
          }, init:function() {
          }, mixIn:function(properties) {
            for (var propertyName in properties) {
              if (properties.hasOwnProperty(propertyName)) {
                this[propertyName] = properties[propertyName];
              }
            }
            if (properties.hasOwnProperty("toString")) {
              this.toString = properties.toString;
            }
          }, clone:function() {
            return this.init.prototype.extend(this);
          }};
        }();
        var WordArray = C_lib.WordArray = Base.extend({init:function(words, sigBytes) {
          words = this.words = words || [];
          if (sigBytes != undefined) {
            this.sigBytes = sigBytes;
          } else {
            this.sigBytes = words.length * 4;
          }
        }, toString:function(encoder) {
          return (encoder || Hex).stringify(this);
        }, concat:function(wordArray) {
          var thisWords = this.words;
          var thatWords = wordArray.words;
          var thisSigBytes = this.sigBytes;
          var thatSigBytes = wordArray.sigBytes;
          this.clamp();
          if (thisSigBytes % 4) {
            for (var i = 0;i < thatSigBytes;i++) {
              var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
            }
          } else {
            for (var i = 0;i < thatSigBytes;i += 4) {
              thisWords[thisSigBytes + i >>> 2] = thatWords[i >>> 2];
            }
          }
          this.sigBytes += thatSigBytes;
          return this;
        }, clamp:function() {
          var words = this.words;
          var sigBytes = this.sigBytes;
          words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
          words.length = Math.ceil(sigBytes / 4);
        }, clone:function() {
          var clone = Base.clone.call(this);
          clone.words = this.words.slice(0);
          return clone;
        }, random:function(nBytes) {
          var words = [];
          var r = function(m_w) {
            var m_w = m_w;
            var m_z = 987654321;
            var mask = 4294967295;
            return function() {
              m_z = 36969 * (m_z & 65535) + (m_z >> 16) & mask;
              m_w = 18E3 * (m_w & 65535) + (m_w >> 16) & mask;
              var result = (m_z << 16) + m_w & mask;
              result /= 4294967296;
              result += .5;
              return result * (Math.random() > .5 ? 1 : -1);
            };
          };
          for (var i = 0, rcache;i < nBytes;i += 4) {
            var _r = r((rcache || Math.random()) * 4294967296);
            rcache = _r() * 987654071;
            words.push(_r() * 4294967296 | 0);
          }
          return new WordArray.init(words, nBytes);
        }});
        var C_enc = C.enc = {};
        var Hex = C_enc.Hex = {stringify:function(wordArray) {
          var words = wordArray.words;
          var sigBytes = wordArray.sigBytes;
          var hexChars = [];
          for (var i = 0;i < sigBytes;i++) {
            var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            hexChars.push((bite >>> 4).toString(16));
            hexChars.push((bite & 15).toString(16));
          }
          return hexChars.join("");
        }, parse:function(hexStr) {
          var hexStrLength = hexStr.length;
          var words = [];
          for (var i = 0;i < hexStrLength;i += 2) {
            words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
          }
          return new WordArray.init(words, hexStrLength / 2);
        }};
        var Latin1 = C_enc.Latin1 = {stringify:function(wordArray) {
          var words = wordArray.words;
          var sigBytes = wordArray.sigBytes;
          var latin1Chars = [];
          for (var i = 0;i < sigBytes;i++) {
            var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
            latin1Chars.push(String.fromCharCode(bite));
          }
          return latin1Chars.join("");
        }, parse:function(latin1Str) {
          var latin1StrLength = latin1Str.length;
          var words = [];
          for (var i = 0;i < latin1StrLength;i++) {
            words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
          }
          return new WordArray.init(words, latin1StrLength);
        }};
        var Utf8 = C_enc.Utf8 = {stringify:function(wordArray) {
          try {
            return decodeURIComponent(escape(Latin1.stringify(wordArray)));
          } catch (e) {
            throw new Error("Malformed UTF-8 data");
          }
        }, parse:function(utf8Str) {
          return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
        }};
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({reset:function() {
          this._data = new WordArray.init;
          this._nDataBytes = 0;
        }, _append:function(data) {
          if (typeof data == "string") {
            data = Utf8.parse(data);
          }
          this._data.concat(data);
          this._nDataBytes += data.sigBytes;
        }, _process:function(doFlush) {
          var data = this._data;
          var dataWords = data.words;
          var dataSigBytes = data.sigBytes;
          var blockSize = this.blockSize;
          var blockSizeBytes = blockSize * 4;
          var nBlocksReady = dataSigBytes / blockSizeBytes;
          if (doFlush) {
            nBlocksReady = Math.ceil(nBlocksReady);
          } else {
            nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
          }
          var nWordsReady = nBlocksReady * blockSize;
          var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);
          if (nWordsReady) {
            for (var offset = 0;offset < nWordsReady;offset += blockSize) {
              this._doProcessBlock(dataWords, offset);
            }
            var processedWords = dataWords.splice(0, nWordsReady);
            data.sigBytes -= nBytesReady;
          }
          return new WordArray.init(processedWords, nBytesReady);
        }, clone:function() {
          var clone = Base.clone.call(this);
          clone._data = this._data.clone();
          return clone;
        }, _minBufferSize:0});
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({cfg:Base.extend(), init:function(cfg) {
          this.cfg = this.cfg.extend(cfg);
          this.reset();
        }, reset:function() {
          BufferedBlockAlgorithm.reset.call(this);
          this._doReset();
        }, update:function(messageUpdate) {
          this._append(messageUpdate);
          this._process();
          return this;
        }, finalize:function(messageUpdate) {
          if (messageUpdate) {
            this._append(messageUpdate);
          }
          var hash = this._doFinalize();
          return hash;
        }, blockSize:512 / 32, _createHelper:function(hasher) {
          return function(message, cfg) {
            return (new hasher.init(cfg)).finalize(message);
          };
        }, _createHmacHelper:function(hasher) {
          return function(message, key) {
            return (new C_algo.HMAC.init(hasher, key)).finalize(message);
          };
        }});
        var C_algo = C.algo = {};
        return C;
      }(Math);
      return CryptoJS;
    });
  }, function(module, exports, __webpack_require__) {
    var __WEBPACK_AMD_DEFINE_RESULT__;
    (function(module, global) {
      (function(root) {
        var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
        var freeModule = typeof module == "object" && module && !module.nodeType && module;
        var freeGlobal = typeof global == "object" && global;
        if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
          root = freeGlobal;
        }
        var punycode, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\x20-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {"overflow":"Overflow: input needs wider integers to process", "not-basic":"Illegal input >= 0x80 (not a basic code point)", "invalid-input":"Invalid input"}, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode, 
        key;
        function error(type) {
          throw new RangeError(errors[type]);
        }
        function map(array, fn) {
          var length = array.length;
          var result = [];
          while (length--) {
            result[length] = fn(array[length]);
          }
          return result;
        }
        function mapDomain(string, fn) {
          var parts = string.split("@");
          var result = "";
          if (parts.length > 1) {
            result = parts[0] + "@";
            string = parts[1];
          }
          string = string.replace(regexSeparators, ".");
          var labels = string.split(".");
          var encoded = map(labels, fn).join(".");
          return result + encoded;
        }
        function ucs2decode(string) {
          var output = [], counter = 0, length = string.length, value, extra;
          while (counter < length) {
            value = string.charCodeAt(counter++);
            if (value >= 55296 && value <= 56319 && counter < length) {
              extra = string.charCodeAt(counter++);
              if ((extra & 64512) == 56320) {
                output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
              } else {
                output.push(value);
                counter--;
              }
            } else {
              output.push(value);
            }
          }
          return output;
        }
        function ucs2encode(array) {
          return map(array, function(value) {
            var output = "";
            if (value > 65535) {
              value -= 65536;
              output += stringFromCharCode(value >>> 10 & 1023 | 55296);
              value = 56320 | value & 1023;
            }
            output += stringFromCharCode(value);
            return output;
          }).join("");
        }
        function basicToDigit(codePoint) {
          if (codePoint - 48 < 10) {
            return codePoint - 22;
          }
          if (codePoint - 65 < 26) {
            return codePoint - 65;
          }
          if (codePoint - 97 < 26) {
            return codePoint - 97;
          }
          return base;
        }
        function digitToBasic(digit, flag) {
          return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
        }
        function adapt(delta, numPoints, firstTime) {
          var k = 0;
          delta = firstTime ? floor(delta / damp) : delta >> 1;
          delta += floor(delta / numPoints);
          for (;delta > baseMinusTMin * tMax >> 1;k += base) {
            delta = floor(delta / baseMinusTMin);
          }
          return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
        }
        function decode(input) {
          var output = [], inputLength = input.length, out, i = 0, n = initialN, bias = initialBias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
          basic = input.lastIndexOf(delimiter);
          if (basic < 0) {
            basic = 0;
          }
          for (j = 0;j < basic;++j) {
            if (input.charCodeAt(j) >= 128) {
              error("not-basic");
            }
            output.push(input.charCodeAt(j));
          }
          for (index = basic > 0 ? basic + 1 : 0;index < inputLength;) {
            for (oldi = i, w = 1, k = base;;k += base) {
              if (index >= inputLength) {
                error("invalid-input");
              }
              digit = basicToDigit(input.charCodeAt(index++));
              if (digit >= base || digit > floor((maxInt - i) / w)) {
                error("overflow");
              }
              i += digit * w;
              t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
              if (digit < t) {
                break;
              }
              baseMinusT = base - t;
              if (w > floor(maxInt / baseMinusT)) {
                error("overflow");
              }
              w *= baseMinusT;
            }
            out = output.length + 1;
            bias = adapt(i - oldi, out, oldi == 0);
            if (floor(i / out) > maxInt - n) {
              error("overflow");
            }
            n += floor(i / out);
            i %= out;
            output.splice(i++, 0, n);
          }
          return ucs2encode(output);
        }
        function encode(input) {
          var n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output = [], inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
          input = ucs2decode(input);
          inputLength = input.length;
          n = initialN;
          delta = 0;
          bias = initialBias;
          for (j = 0;j < inputLength;++j) {
            currentValue = input[j];
            if (currentValue < 128) {
              output.push(stringFromCharCode(currentValue));
            }
          }
          handledCPCount = basicLength = output.length;
          if (basicLength) {
            output.push(delimiter);
          }
          while (handledCPCount < inputLength) {
            for (m = maxInt, j = 0;j < inputLength;++j) {
              currentValue = input[j];
              if (currentValue >= n && currentValue < m) {
                m = currentValue;
              }
            }
            handledCPCountPlusOne = handledCPCount + 1;
            if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
              error("overflow");
            }
            delta += (m - n) * handledCPCountPlusOne;
            n = m;
            for (j = 0;j < inputLength;++j) {
              currentValue = input[j];
              if (currentValue < n && ++delta > maxInt) {
                error("overflow");
              }
              if (currentValue == n) {
                for (q = delta, k = base;;k += base) {
                  t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                  if (q < t) {
                    break;
                  }
                  qMinusT = q - t;
                  baseMinusT = base - t;
                  output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                  q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                delta = 0;
                ++handledCPCount;
              }
            }
            ++delta;
            ++n;
          }
          return output.join("");
        }
        function toUnicode(input) {
          return mapDomain(input, function(string) {
            return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
          });
        }
        function toASCII(input) {
          return mapDomain(input, function(string) {
            return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
          });
        }
        punycode = {"version":"1.4.1", "ucs2":{"decode":ucs2decode, "encode":ucs2encode}, "decode":decode, "encode":encode, "toASCII":toASCII, "toUnicode":toUnicode};
        if (true) {
          !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
            return punycode;
          }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else {
          if (freeExports && freeModule) {
            if (module.exports == freeExports) {
              freeModule.exports = punycode;
            } else {
              for (key in punycode) {
                punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
              }
            }
          } else {
            root.punycode = punycode;
          }
        }
      })(this);
    }).call(exports, __webpack_require__(21)(module), function() {
      return this;
    }());
  }, function(module, exports) {
    module.exports = function(module) {
      if (!module.webpackPolyfill) {
        module.deprecate = function() {
        };
        module.paths = [];
        module.children = [];
        module.webpackPolyfill = 1;
      }
      return module;
    };
  }, function(module, exports, __webpack_require__) {
    var backend = __webpack_require__(8);
    var sovetnikInfo = __webpack_require__(13);
    var storage = __webpack_require__(6);
    var _require = __webpack_require__(11);
    var setInterval = _require.setInterval;
    var PING_INTERVAL = 12 * 60 * 60 * 1E3;
    PING_INTERVAL = 24 * 60 * 60 * 1E3;
    var CHECK_INTERVAL = 30 * 60 * 1E3;
    var FIRST_CHECK_INTERVAL = 60 * 1E3;
    function canSendPing() {
      return !sovetnikInfo.isOfferRejected && !sovetnikInfo.isSovetnikRemoved;
    }
    function isTimeToSendPing() {
      var lastSentTime = storage.get("ping_last_sent_time") || 0;
      lastSentTime = parseInt(lastSentTime, 10);
      return (new Date).getTime() - lastSentTime > PING_INTERVAL;
    }
    function trySendPing() {
      if (canSendPing && isTimeToSendPing()) {
        var settings = {affId:sovetnikInfo.settings.affId, clid:sovetnikInfo.settings.clid};
        if (sovetnikInfo.settings.withButton) {
          settings.withButton = true;
        }
        backend.sendSovetnikStats({settings:settings, event:"ping"}, function() {
          storage.set("ping_last_sent_time", (new Date).getTime());
        });
      }
    }
    if (canSendPing()) {
      setTimeout(trySendPing, FIRST_CHECK_INTERVAL);
      setInterval(trySendPing, CHECK_INTERVAL);
    }
  }, function(module, exports, __webpack_require__) {
    var API = __webpack_require__(24);
    var global = typeof window === "undefined" ? undefined : window;
    var sovetnik = API || {};
    global.sovetnik = sovetnik;
  }, function(module, exports, __webpack_require__) {
    var siteInfo = __webpack_require__(5);
    var sovetnikInfo = __webpack_require__(13);
    var API = {setCheckFunction:function setCheckFunction(handler) {
      siteInfo.setCustomCheckFunction(handler);
    }, setOpenSettingsFunction:function setOpenSettingsFunction(handler) {
      sovetnikInfo.setCustomSettingsPage(handler);
    }, setAutoShowPopup:function setAutoShowPopup(isEnabled) {
      sovetnikInfo.setUserSetting("autoShowShopList", isEnabled);
    }, setActiveCity:function setActiveCity(cityId) {
      sovetnikInfo.setUserSetting("activeCity", {id:cityId});
    }, setActiveCountry:function setActiveCountry(countryId) {
      sovetnikInfo.setUserSetting("activeCountry", {id:countryId});
    }, setAutoDetectRegion:function setAutoDetectRegion() {
      sovetnikInfo.setUserSetting("activeCity", null);
      sovetnikInfo.setUserSetting("activeCountry", null);
    }, setOtherRegions:function setOtherRegions(otherRegionsEnabled) {
      sovetnikInfo.setUserSetting("otherRegions", otherRegionsEnabled);
    }, setRemovedState:function setRemovedState(state) {
      sovetnikInfo.setSovetnikRemovedState(state);
    }};
    module.exports = API;
  }, function(module, exports, __webpack_require__) {
    var backend = __webpack_require__(8);
    var sovetnikInfo = __webpack_require__(13);
    if (!sovetnikInfo.settings.silent) {
      backend.setStartedInfo();
    }
  }]);
})({"affId":"1012", "clid":"2210240", "applicationName":"friGate", "browser":"chrome"}, window.chrome.extension.getURL("lib/sov3.js"));

