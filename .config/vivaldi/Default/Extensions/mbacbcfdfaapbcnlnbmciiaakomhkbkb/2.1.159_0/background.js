var proxyHosts = {}, checkUrls = [], proxyHostsCl = [], lastLoadHosts = {}, blHosts = [], dataRep = [], timewait = 9E5, timewait2 = 19E3, timewait3 = -1, timewaitClSerial = 216E5, timewaitUpdateHost = 72E5, timewait407 = 3E4, rep = {}, num_tabs, first_api = "", upd407 = 0, isShowMess = {}, preazapret = null, presites = null, preurls = null, preproxy = null, ison = !0, first = !0, attempts = 6, startUrlIndex = 0, endUrlIndex = 1, extArr = ["org", "biz"], prDef = "", prDefCo = "", prDef2 = [["HTTPS uk11.friproxy.biz:443", "uk"], ["HTTPS fr11.friproxy.biz:443", "fr"]], pr2Def2 = ["SOCKS5 uk11.friproxy.biz:1080",
        "SOCKS5 fr11.friproxy.biz:1080"], prauth = ls.set("prauth"), prauth2 = ls.set("prauth2"), prauth3 = ls.set("prauth3"), prauth4 = ls.set("prauth4"), pr = "", prco = "", prip, openPr = !1, openPrNoNeed, limitText = "wait", pr2 = "", isProxyHosts = !1, isRep = !1, news = ls.get("news"), updateText = ls.get("updateText"), nameTestFile = "/frigate.", noalert = !1, noadv = ls.get("noadv"), timerUpdateHost = !1, md5api = "", uid = ls.get("uidkey"), clearcacheis = !0, serial = 0, serialRep = "0", startTime = Date.now(), timeClSerial = startTime + timewaitClSerial, detailsApp = chrome.app.getDetails(),
    idContMen = [], iscl = !0, proxyOffset = 0, tabUpdateAllArr = {}, timerCheckProxy, a = ls.get("a"), compres = ls.get("compres"), autoChangeProxyCount = 0, autoChangeProxyCountMax = 7, GlobalContentLength = 0, GlobalOriginalContentLength = 0, LenCount = 0, ContentLengthCounterStart = ls.get("ContentLengthCounterStart");
ContentLengthCounterStart || setContentLengthCounterStart();
var noAutoChangeProxy = ls.get("noAutoChangeProxy"), timeOutAuth = 0, proxyUpdate = 1, azapret = [], azaprethide = {}, ip = "", slowConnect = ls.get("slow");
slowConnect && setSlow();
var iid, token;
d2("friGate starting...");
uid ? "undefined" != typeof localStorage.version ? (localStorage.clear(), ison = !0, ls.set("on", !0)) : (first = !1, ison = ls.get("on")) : (localStorage.clear(), ison = !0, uid = generatePW(), ls.set("uidkey", uid, !1), ls.set("on", !0));
var lang = chrome.i18n.getMessage("@@ui_locale");
"ru" != lang && (lang = "en");
first && chrome.tabs.create({url: "https://fri-gate.org/get_started", active: !0});
chrome.browserAction.setBadgeBackgroundColor({color: [55, 169, 224, 90]});
chrome.webRequest.onBeforeRequest.addListener(reqListenerAll, {
    urls: ["<all_urls>"],
    types: ["main_frame"]
}, ["blocking"]);
chrome.idle.onStateChanged.addListener(function (b) {
    "active" == b && getSitesUrl(!1, function () {
    })
});
updateText && (updateText = l("messUpdate"));
genapi();
getTld();
noalertRead();
proxyRead();
loadhosts();
function setSlow() {
    globalTimeout = slowConnect ? 7E4 : 1E4
}
function onProxyError() {
    chrome.proxy.settings.get({incognito: !1}, function (b) {
        var c = !1;
        b && "undefined" != typeof b.levelOfControl && "controllable_by_this_extension" != b.levelOfControl && "controlled_by_this_extension" != b.levelOfControl && (c = !0);
        c && ison ? (ison = !1, proxyoff(!0, !0), errIcon(), chrome.browserAction.setTitle({title: l("messErrOverExtProxy")})) : c || ison || (ison = !0, proxyon())
    })
}
function setUserHostUrl(b, c, e, g, f) {
    f ? (0 > c || checkUrls.include(b + c), proxyHosts[b] = {
            on: !1,
            d: 0,
            bl: !1,
            url: c
        }, e && (proxyHosts[b].l = e), proxyHosts[b].lid = g, -2 == c && (proxyHosts[b].ons = !0), proxyHostsCl.include("*://" + b + "/*")) : (checkUrls.erase(b + c), delete proxyHosts[b], proxyHostsCl.erase("*://" + b + "/*"))
}
function chNoNeedopenPr() {
    for (var b in proxyHosts)if (proxyHosts.hasOwnProperty(b) && "undefined" != typeof proxyHosts[b].l)return !1;
    return !0
}
function getMessage(b, c, e) {
    if (b)if ("getTabId" == b.type) e({tabId: c.tab.id}); else {
        if ("sovetnik" == b.type)return e(noadv), !0;
        if ("from_s2" == b.type && b.tabHost) "undefined" != typeof proxyHosts[b.tabHost] ? (proxyHosts[b.tabHost].hide = b.value, saveHostsToLs()) : (azaprethide[b.tabHost] = b.value, ls.set("azaprethide", azaprethide)); else if ("frigate" == b.type && b.value) "gettld" == b.value ? (getTld(), d("getTld===", tld), preproxy = "", setProxy($empty)) : "isslowconn" == b.value && (slowConnect = b.val2 ? 1 : 0, setSlow()), "noautochproxy" ==
        b.value ? noAutoChangeProxy = b.val2 ? 1 : 0 : "compres" == b.value ? compres = b.val2 ? 1 : 0 : "anon" == b.value ? a = b.val2 ? 1 : 0 : "noalert" == b.value ? noalertRead() : "noadv" == b.value ? noadvRead() : "proxy" == b.value ? (preproxy = "", "f" == proxyRead() ? (openPrNoNeed = chNoNeedopenPr(), openPr || openPrNoNeed ? setProxy(function () {
                                            checkAllTabWhenEnable(!1)
                                        }) : getSitesUrl(!1, function () {
                                            checkAllTabWhenEnable(!1)
                                        })) : setProxy($empty)) : "getfrlist" == b.value && e(proxyHosts); else if ("chproxy" == b.type && b.tabHost && b.url && b.tabId) proxyOffset++, proxyUpdate =
            1, md5api = "", openPr = !1, getSitesUrl(!1, function () {
            tabUpdate(!1, b.url, b.tabId)
        }); else if ("frigatetabon" == b.type && b.tabHost && b.url && b.tabId) proxyHosts[b.tabHost].man = !0, setProxy(function () {
            actIcon();
            tabUpdate(!1, b.url, b.tabId)
        }); else if ("frigatetaboff" == b.type && b.tabHost && b.url && b.tabId) proxyHosts[b.tabHost].man = !1, setProxy(function () {
            noActIcon();
            tabUpdate(!1, b.url, b.tabId)
        }); else if ("frigateisshow" == b.type && b.tabId) isShowMess[b.tabId] = !0; else if ("frigatelist" == b.type) {
            var g = "onlist" == b.value.act;
            if (g ||
                "offlist" == b.value.act) {
                if (b.value.id && (c = ls.get("list")) && 0 < c.length && "undefined" !== typeof c[b.value.id]) {
                    var f = c[b.value.id];
                    0 < f.d.length ? (Object.each(f.d, function (b, c) {
                            b.on && setUserHostUrl(b.h, b.u, f.n, c, g)
                        }), ison && setOrUpdateHandlers(), saveHostsToLs(), openPr ? setProxy(function () {
                                e(!0)
                            }) : (openPr = 0, getSitesUrl(!1, function () {
                                checkAllTabWhenEnable(!1)
                            }))) : e(!0)
                }
            } else if ("delurl" == b.value.act) {
                if (-5 == b.value.url)return "undefined" != typeof proxyHosts[b.value.host] ? (proxyHosts[b.value.host].ons = proxyHosts[b.value.host].ons ?
                        -3 : -1, saveHostsToLs(), setProxy(function () {
                        checkAllTabWhenEnable(!1);
                        e(!0)
                    })) : e(!1), !0;
                b.value.host && b.value.url && (setUserHostUrl(b.value.host, b.value.url, !1, !1, !1), "undefined" == typeof b.value.notApply && (saveHostsToLs(), ison && setOrUpdateHandlers(), openPr || (openPrNoNeed = chNoNeedopenPr()) && onOffLimit(), checkAllTabWhenEnable(!1)));
                e(!0)
            } else if ("churl" == b.value.act) c = checkHostInProxyHosts("http://" + getClHost(b.value.host)), c.tabHost ? "undefined" == typeof proxyHosts[c.tabHost].lid ? e("friGate") : e(proxyHosts[c.tabHost].lid) :
                e(!1); else if ("url" == b.value.act) {
                if (-5 == b.value.url)return "undefined" != typeof proxyHosts[b.value.host] ? (proxyHosts[b.value.host].ons = -3 == proxyHosts[b.value.host].ons ? !0 : !1, saveHostsToLs(), setProxy(function () {
                        checkAllTabWhenEnable(!1);
                        e(!0)
                    })) : e(!1), !0;
                setUserHostUrl(b.value.host, b.value.url, b.value.list, b.value.lid, !0);
                ison && setOrUpdateHandlers();
                saveHostsToLs();
                openPr ? setProxy(function () {
                        checkAllTabWhenEnable(b.value.host);
                        e(!0)
                    }) : (getSitesUrl(!1, function () {
                        checkAllTabWhenEnable(b.value.host)
                    }),
                        e(!0))
            }
            return !0
        }
    }
}
function noalertRead() {
    var b = ls.get("noalert");
    null !== b && (noalert = b)
}
function noadvRead() {
    var b = ls.get("noadv");
    null !== b && (noadv = b);
    sovetnik.setRemovedState(noadv)
}
function proxyRead() {
    var b = ls.get("pr2");
    if (null == b || 1 > b.length)return prDef ? (pr = prDef, prco = prDefCo) : (b = Math.floor(Math.random() * prDef2.length), pr = prDef2[b][0], prco = prDef2[b][1], pr2 = pr2Def2[b]), prip = getprip(pr), "f";
    pr2 = pr = "";
    lsprL = b.length;
    if (0 < lsprL)for (var c = 0; c < lsprL; c++)pr += b[c], c == lsprL - 1 && (pr += ";");
    prco = prip = "";
    openPr = !0;
    return "o"
}
function checkHostInAntizapret(b) {
    b = b.split(/\/+/g);
    if ("http:" != b[0] && "https:" != b[0])return !1;
    for (var c = 0, e = azapret.length; c < e; c++)if (b[1] == azapret[c])return b[1];
    return !1
}
function checkHostInTld(b) {
    var c = {};
    b = b.split(/\/+/g);
    c.sheme = b[0] + "//";
    c.host = b[1];
    if ("http://" != c.sheme && "https://" != c.sheme)return !1;
    c = c.host.split(/\./g);
    c = c[c.length - 1];
    return tld.hasOwnProperty(c) && tld[c] ? c : !1
}
function checkHostInRepTextHosts(b) {
    var c = [];
    if (null != dataRep) {
        var e = dataRep.length;
        if (0 < e)for (; e--;)"undefined" != typeof dataRep[e] && dataRep[e].s.test(b) && c.push({
            f: dataRep[e].f,
            t: dataRep[e].t
        })
    }
    return c
}
function checkHostInProxyHosts(b) {
    var c = {tabHost: !1, tabClHost: "", isSheme: !1, allow: !1}, e = b.split(/\/+/g);
    b = !1;
    c.sheme = e[0] + "//";
    c.host = e[1];
    if ("http://" == c.sheme || "https://" == c.sheme) c.isSheme = !0;
    if ("undefined" !== typeof proxyHosts[c.host]) b = !0, c.tabHost = c.host, c.tabClHost = c.host; else {
        var e = c.host.split(/\./g), g = e.length;
        if (1 < g)for (c.tabClHost = e[g - 1], g -= 2; -1 < g; g--)if (c.tabClHost = e[g] + "." + c.tabClHost, "undefined" !== typeof proxyHosts["*." + c.tabClHost]) {
            c.tabHost = "*." + c.tabClHost;
            break
        }
    }
    !c.tabHost || !openPr &&
    (openPr || b && 0 > proxyHosts[c.host].ons || "undefined" != typeof proxyHosts[c.tabHost].lid) || (c.allow = !0);
    return c
}
function checkAllTabWhenEnable(b) {
    ison && chrome.tabs.query({}, function (c) {
        for (var e, g = c.length, f = 0; f < g; f++)if (e = checkHostInProxyHosts(c[f].url), e.tabHost && (!b || b && e.tabHost == b) || checkHostInAntizapret(c[f].url))try {
            chrome.tabs.update(c[f].id, {url: c[f].url}, function () {
            })
        } catch (m) {
        }
    })
}
function tabListener31(b, c, e) {
    c = "undefined" !== typeof c.url ? c.url : e.url;
    tabListenerAll(c, b, !0);
    c && (c = checkHostInRepTextHosts(c), 0 < c.length && chrome.tabs.sendMessage(b, {type: "s2r", rep: c}))
}
function tabListener32(b) {
    chrome.tabs.get(b.tabId, function (c) {
        "undefined" != typeof c.url && tabListenerAll(c.url, b.tabId, !1)
    })
}
function tabListenerAll(b, c, e) {
    var g;
    if (ison) {
        if (isProxyHosts && b) {
            var f = !1, m = !1, p = !1, n = "";
            g = checkHostInProxyHosts(b);
            g.tabHost && g.allow ? (n = g.tabHost, g = null) : (m = checkHostInAntizapret(b)) || (p = checkHostInTld(b));
            if (m || n || p) e && "undefined" == typeof isShowMess[c] && (e = p ? "<b>." + p + "</b>" : m ? "<b>Antizapret</b>" : "undefined" == typeof proxyHosts[n].l ? "<b>friGate</b>" : "<b>" + proxyHosts[n].l + "</b>", n && "undefined" != typeof proxyHosts[n].hide ? f = proxyHosts[n].hide : m && "undefined" != typeof azaprethide[m] && (f = azaprethide[m]),
                p ? showMess(c, [l("messProxyOn"), "", l("messFromList") + e], f, p, b, 3) : m ? showMess(c, [l("messProxyOn"), "", l("messFromList") + e], f, m, b, 3) : proxyHosts[n].man ? showMess(c, [l("messProxyOnManually"), l("messProxyIsOff"), l("messFromList") + e], f, n, b, 1) : 0 > proxyHosts[n].ons ? showMess(c, [l("mess_manually_dis"), "", l("messFromList") + e], f, n, b, 0) : 1 == proxyHosts[n].ons ? showMess(c, [l("messTypeCh3"), "", l("messFromList") + e], f, n, b, 4) : proxyHosts[n].on ? showMess(c, [l("messProxyOn"), "", l("messFromList") + e], f, n, b, 3) : showMess(c, [l("messSiteWithoutProxy"),
                                            l("messProxyOff"), l("messFromList") + e], f, n, b, 0)), chrome.tabs.getSelected(null, function (b) {
                if (b.id == c) {
                    if (!("undefined" != typeof proxyHosts[n] && 0 > proxyHosts[n].ons) && (p || m || proxyHosts[n].on || proxyHosts[n].ons) || proxyHosts[n].man)return actIcon(c), !0;
                    listIcon();
                    return !1
                }
            })
        }
        noActIcon()
    } else disIcon()
}
function reqListenerAll(b) {
    b.tabId && b.url && (tabUpdateAllArr[b.tabId] = b.url)
}
var checkResponseHeaders = function (b) {
    var c = 0;
    Array.each(b, function (b, g) {
        b.name = b.name.toLowerCase();
        "location" == b.name && (c = g)
    });
    return c
}, reqOnHeadersReceived = function (b) {
    if ("object" == typeof b.responseHeaders) {
        var c = b.responseHeaders.length, e = 0, g;
        if (0 < c) {
            for (var f = 0; f < c; f++)"undefined" != typeof b.responseHeaders[f].name && ("status" == b.responseHeaders[f].name && (g = 1 * b.responseHeaders[f].value, 499 < g && 505 > g && e++), "server" == b.responseHeaders[f].name && "fri-gate" == b.responseHeaders[f].value && e++);
            2 == e && (noAutoChangeProxy ||
            changeProxy(b))
        }
    }
    if (/(3)\d\d/g.test(b.statusLine))if ("xmlhttprequest" == b.type) {
        if (-1 != b.url.indexOf("frigate_test_file=") || -1 != b.url.indexOf("frigate_404_check"))return {cancel: !0}
    } else if (hostObj = checkHostInProxyHosts(b.url), hostObj.tabHost && !proxyHosts[hostObj.tabHost].on && hostObj.allow && (c = checkResponseHeaders(b.responseHeaders)))if (toUrl = b.responseHeaders[c].value, toUrl = toUrl.split(/\/+/g)[1], blHostslength = blHosts.length, 0 < blHostslength)for (f = 0; f < blHostslength; f++)-1 != toUrl.indexOf(blHosts[f]) &&
    (proxyHosts[hostObj.tabHost].bl = !0, proxyHosts[hostObj.tabHost].upd = {}, proxyHosts[hostObj.tabHost].upd[b.tabId] = b.url, noSiteRes(hostObj.tabHost, null, b.tabId, b.url, null, null));
    return {cancel: !1}
};
function reqListener(b) {
    "undefined" != typeof isShowMess[b.tabId] && delete isShowMess[b.tabId];
    if ((isProxyHosts || isRep) && b.url) {
        var c = b.url, e = checkHostInProxyHosts(c);
        if (e.isSheme) {
            if (isRep && "undefined" != typeof rep[e.host])return {redirectUrl: c.replace(e.host, rep[e.host])};
            if (e.tabHost && e.allow && 1 != proxyHosts[e.tabHost].ons) {
                var g = e.tabHost, f = e.tabClHost;
                if (proxyHosts[g].bl) proxyHosts[g].upd[b.tabId] = c; else {
                    var m;
                    if (proxyHosts[g].d < Date.now())if (proxyHosts[g].bl = !0, proxyHosts[g].upd = {}, proxyHosts[g].upd[b.tabId] =
                            c, "undefined" !== typeof proxyHosts[g].url)if (-1 != proxyHosts[g].url.indexOf("|")) {
                        var p = proxyHosts[g].url.split(/\|/g);
                        m = "robots.txt";
                        if (0 < p.length) {
                            p[1] && (m = p[1]);
                            var n = function () {
                                noSiteRes(g, f, b.tabId, c, !1, 3)
                            }, k = function (e) {
                                j = -1 == e.indexOf(p[0]) ? !1 : !0;
                                noSiteRes(g, f, b.tabId, c, j, 3)
                            };
                            m = e.sheme + f + "/" + m;
                            Req(m, 1E4, k, n, n, "GET", "frigate_test_file=" + generatePW(5) + Date.now())
                        }
                    } else-1 == proxyHosts[g].url ? (k = function (e) {
                            j = /(4|5)\d\d/g.test(e.status) ? !0 : !1;
                            noSiteRes(g, f, b.tabId, c, j, 3)
                        }, m = genRandFile(e.sheme, f),
                            getUrl3(m, "get", {}, "", k, k)) : (proxyHosts[g].testsize = -2, k = function (e) {
                            e ? ("object" == typeof e && (e = ""), e = h(e)) : e = !1;
                            noSiteRes(g, f, b.tabId, c, e, 2)
                        }, m = e.sheme + f + proxyHosts[g].url, getUrl3(m, "get", {}, "", k, k), e = genRandFile(e.sheme, f), getUrl3(e, "get", {}, "", k, k)); else k = function (e) {
                        noSiteRes(g, f, b.tabId, c, e, !1)
                    }, m = e.sheme + f + nameTestFile + f + ".js", getUrl(m, "get", "", k, k); else noalert || chrome.tabs.sendMessage(b.tabId, {type: "showwait"})
                }
            }
        }
    }
    return {cancel: !1}
}
function onAddAuthHeader(b) {
    b.requestHeaders.push({name: "X-Compress", value: compres + ""});
    if ("http:" == b.url.substring(0, 5)) {
        var c = "", e = !1, g = checkHostInProxyHosts(b.url);
        g.tabHost && g.allow ? c = g.tabHost : e = checkHostInAntizapret(b.url);
        if (e || c && (proxyHosts[g.tabHost].on || 1 == proxyHosts[g.tabHost].ons || proxyHosts[g.tabHost].man)) compres && a ? prauth4 && b.requestHeaders.push({
                name: "Proxy-Authorization",
                value: prauth4
            }) : compres ? prauth3 && b.requestHeaders.push({
                    name: "Proxy-Authorization",
                    value: prauth3
                }) : a ? prauth2 ?
                        b.requestHeaders.push({
                            name: "Proxy-Authorization",
                            value: prauth2
                        }) : b.requestHeaders.push({
                            name: "Proxy-Authorization",
                            value: "a"
                        }) : prauth && b.requestHeaders.push({name: "Proxy-Authorization", value: prauth})
    }
    return {requestHeaders: b.requestHeaders}
}
function reqOnResponseStarted(b) {
    if (!noalert && isProxyHosts && b.url) {
        var c = checkHostInProxyHosts(b.url);
        (c.tabHost && c.allow || checkHostInAntizapret(b.url)) && chrome.tabs.sendMessage(b.tabId, {type: "showwait"})
    }
    "undefined" != typeof b.statusCode && 407 == b.statusCode && (changeProxy(b, !0), d2(b.statusCode))
}
function reqOnErrorOccurred(b) {
    d("details", b);
    -1 == b.error.indexOf("ERR_TUNNEL_CONNECTION_FAILED") && -1 == b.error.indexOf("ERR_PROXY_CONNECTION_FAILED") && -1 == b.error.indexOf("ERR_PROXY") || changeProxy(b, !0);
    "undefined" != typeof b.statusCode && 404 == b.statusCode && changeProxy(b)
}
function reqonCompletedForFindErr(b) {
    if ("object" == typeof b.responseHeaders) {
        var c = b.responseHeaders.length;
        if (0 < c) {
            for (var e = !1, g = 0; g < c; g++)"undefined" != typeof b.responseHeaders[g].name && "X-Squid-Error" == b.responseHeaders[g].name && "ERR_ACCESS_DENIED 0" == b.responseHeaders[g].value && (e = !0);
            e && changeProxy(b, !0)
        }
    }
}
function changeProxy(b, c) {
    0 == autoChangeProxyCount && (proxyOffset = 0);
    autoChangeProxyCount <= autoChangeProxyCountMax && (autoChangeProxyCount++, proxyOffset++, proxyUpdate = 1, md5api = "", openPr = !1, c ? (timeOutAuth = 0, reGet(function () {
            b.url && b.tabId && tabUpdate(null, b.url, b.tabId)
        })) : getSitesUrl(!1, function () {
            b.url && b.tabId && tabUpdate(null, b.url, b.tabId)
        }))
}
function onoff() {
    ison ? proxyoff() : proxyon()
}
function onOffLimit() {
    openPrNoNeed = chNoNeedopenPr();
    openPr || openPrNoNeed ? limitText = "" : (limitText = "lim", chrome.browserAction.setTitle({title: l("messErrLim")}));
    ison && chrome.tabs.getSelected(null, function (b) {
        tabListenerAll(b.url, b.id, !0)
    })
}
function proxyoff(b, c) {
    d2("off");
    timerUpdateHost && clearInterval(timerUpdateHost);
    timerUpdateHost = !1;
    c || (timerCheckProxy && clearInterval(timerCheckProxy), timerCheckProxy = !1);
    preproxy = preurls = presites = preazapret = null;
    md5api = openPr = !1;
    setOrUpdateHandlers(!0);
    setOrUpdateTabHandlers(!0);
    disIcon();
    chrome.proxy.settings.clear({scope: "regular"}, function () {
        checkAllTabWhenEnable(!1);
        b || (ison = null, ls.set("on", !1))
    })
}
function clearcache(b, c) {
    if (clearcacheis) {
        clearcacheis = !1;
        var e;
        e = b ? Date.now() - b : startTime;
        startTime = Date.now();
        try {
            chrome.browsingData.removeCache({since: e}, c)
        } catch (g) {
            "function" == typeof c && c()
        }
    }
}
function offHandlersAll() {
    chrome.webRequest.onBeforeRequest.hasListener(reqListenerAll) && chrome.webRequest.onBeforeRequest.removeListener(reqListenerAll)
}
function setOrUpdateHandlers(b) {
    offHandlersAll();
    chrome.webRequest.onBeforeRequest.hasListener(reqListener) && chrome.webRequest.onBeforeRequest.removeListener(reqListener);
    b || chrome.webRequest.onBeforeRequest.addListener(reqListener, {
        urls: proxyHostsCl,
        types: ["main_frame"]
    }, ["blocking"]);
    chrome.webRequest.onHeadersReceived.hasListener(reqOnHeadersReceived) && chrome.webRequest.onHeadersReceived.removeListener(reqOnHeadersReceived);
    b || chrome.webRequest.onHeadersReceived.addListener(reqOnHeadersReceived,
        {urls: proxyHostsCl, types: ["xmlhttprequest", "main_frame"]}, ["blocking", "responseHeaders"]);
    chrome.webRequest.onErrorOccurred.hasListener(reqOnErrorOccurred) && chrome.webRequest.onErrorOccurred.removeListener(reqOnErrorOccurred);
    b || chrome.webRequest.onErrorOccurred.addListener(reqOnErrorOccurred, {urls: proxyHostsCl, types: ["main_frame"]});
    chrome.webRequest.onHeadersReceived.hasListener(reqOnResponseStarted) && chrome.webRequest.onHeadersReceived.removeListener(reqOnResponseStarted);
    b || chrome.webRequest.onHeadersReceived.addListener(reqOnResponseStarted,
        {urls: proxyHostsCl, types: ["main_frame"]});
    chrome.webRequest.onResponseStarted.hasListener(reqOnResponseStarted) && chrome.webRequest.onResponseStarted.removeListener(reqOnResponseStarted);
    b || chrome.webRequest.onResponseStarted.addListener(reqOnResponseStarted, {
        urls: proxyHostsCl,
        types: ["main_frame"]
    });
    chrome.webRequest.onCompleted.hasListener(reqOnResponseStarted) && chrome.webRequest.onCompleted.removeListener(reqOnResponseStarted);
    b || chrome.webRequest.onCompleted.addListener(reqOnResponseStarted, {
        urls: proxyHostsCl,
        types: ["main_frame"]
    });
    chrome.webRequest.onCompleted.hasListener(reqonCompletedForFindErr) && chrome.webRequest.onCompleted.removeListener(reqonCompletedForFindErr);
    b || chrome.webRequest.onCompleted.addListener(reqonCompletedForFindErr, {
        urls: proxyHostsCl,
        types: ["main_frame"]
    }, ["responseHeaders"]);
    chrome.webRequest.onBeforeSendHeaders.hasListener(onAddAuthHeader) && chrome.webRequest.onBeforeSendHeaders.removeListener(onAddAuthHeader);
    b || chrome.webRequest.onBeforeSendHeaders.addListener(onAddAuthHeader,
        {urls: ["<all_urls>"]}, ["requestHeaders", "blocking"])
}
function setOrUpdateTabHandlers(b) {
    chrome.tabs.onUpdated.hasListener(tabListener31) && chrome.tabs.onUpdated.removeListener(tabListener31);
    chrome.tabs.onActivated.hasListener(tabListener32) && chrome.tabs.onActivated.removeListener(tabListener32);
    b || (chrome.tabs.onUpdated.addListener(tabListener31), chrome.tabs.onActivated.addListener(tabListener32))
}
function proxyon(b) {
    d2("on");
    chrome.browserAction.setBadgeText({text: "wait"});
    limitText = "wait";
    chrome.proxy.settings.get({incognito: !1}, function (c) {
        if (c && "undefined" != typeof c.levelOfControl && "controllable_by_this_extension" != c.levelOfControl && "controlled_by_this_extension" != c.levelOfControl)return ison = !1, chrome.browserAction.setTitle({title: l("messErrOverExtProxy")}), errIcon(), !1;
        timerCheckProxy || (timerCheckProxy = setInterval(onProxyError, 3E3));
        ison = !0;
        b || ((isProxyHosts || isRep) && setProxy(function () {
            setOrUpdateHandlers(0);
            setOrUpdateTabHandlers(0)
        }), proxyOffset++, serial = 0);
        openPrNoNeed = chNoNeedopenPr();
        0 < proxyHostsCl.length ? (proxyUpdate = 2, getSitesUrl(!1, function () {
                proxyUpdate = serial = 0;
                getSitesUrl(!1, function () {
                    checkAllTabWhenEnable(!1)
                })
            })) : (first_api = "&first_api", proxyUpdate = 1, getSitesUrl(!1, function () {
                checkAllTabWhenEnable(!1)
            }));
        timerUpdateHost || (timerUpdateHost = setInterval(getSitesUrl, timewaitUpdateHost));
        chrome.tabs.getSelected(null, function (b) {
            tabListenerAll(b.url, b.id, !0)
        });
        clearcache(864E5, function () {
            ls.set("on",
                !0);
            clearcacheis = !0
        })
    })
}
function actIcon() {
    a ? (chrome.browserAction.setIcon({path: "im/38aan.png"}), chrome.browserAction.setTitle({title: l("messProxyOnAn")})) : (chrome.browserAction.setIcon({path: "im/38a.png"}), chrome.browserAction.setTitle({title: l("messProxyOn")}));
    chrome.browserAction.setBadgeText({text: limitText})
}
function listIcon() {
    chrome.browserAction.setTitle({title: l("browser_action_title")});
    a ? chrome.browserAction.setIcon({path: "im/38lan.png"}) : chrome.browserAction.setIcon({path: "im/38l.png"});
    chrome.browserAction.setBadgeText({text: limitText})
}
function noActIcon() {
    chrome.browserAction.setTitle({title: l("browser_action_title")});
    a ? chrome.browserAction.setIcon({path: "im/38an.png"}) : chrome.browserAction.setIcon({path: "im/38.png"});
    chrome.browserAction.setBadgeText({text: limitText})
}
function disIcon() {
    chrome.browserAction.setIcon({path: "im/38g.png"});
    chrome.browserAction.setBadgeText({text: "off"});
    chrome.browserAction.setTitle({title: l("browser_action_title")})
}
function errIcon() {
    chrome.browserAction.setIcon({path: "im/38g.png"});
    chrome.browserAction.setTitle({title: l("messErrOverExtProxy")});
    chrome.browserAction.setBadgeText({text: "err"})
}
function showMess(b, c, e, g, f, m) {
    noalert || chrome.tabs.query({url: f}, function (p) {
        if (p)var n = p.map(function (b, c) {
            return b.id
        });
        n.contains(b) && chrome.tabs.sendMessage(b, {
            type: "s2",
            tabHost: g,
            tabUrl: f,
            hide: e,
            tabId: b,
            u: updateText,
            n: news,
            pr: [prip + " " + l("messChange"), prco],
            value: {dop: c, isonepage: m}
        })
    })
}
function tabUpdateAll() {
    emptyObject(tabUpdateAllArr) || chrome.tabs.query({}, function (b) {
        var c = b.map(function (b) {
            return b.id
        }), e;
        for (e in tabUpdateAllArr)if (tabUpdateAllArr.hasOwnProperty(e) && (b = parseInt(e), c.contains(b)))try {
            chrome.tabs.update(b, {url: tabUpdateAllArr[e]}, function () {
            })
        } catch (g) {
        }
        tabUpdateAllArr = {}
    })
}
function tabUpdate(b, c, e) {
    if (b && 0 < b.length) proxyHosts[b].bl = !1, "object" == typeof proxyHosts[b].upd && 0 < !emptyObject(proxyHosts[b].upd) ? chrome.tabs.query({}, function (c) {
            var e = c.map(function (b, c) {
                return b.id
            });
            "object" == typeof proxyHosts[b].upd && Object.each(proxyHosts[b].upd, function (b, c) {
                c = parseInt(c);
                if (e.contains(c))try {
                    chrome.tabs.update(c, {url: b}, function () {
                    })
                } catch (n) {
                }
            });
            delete proxyHosts[b].upd
        }) : delete proxyHosts[b].upd; else try {
        chrome.tabs.update(e, {url: c}, $empty)
    } catch (g) {
    }
    clearcacheis = !0
}
function noSiteRes(b, c, e, g, f, m) {
    var p = !1;
    if ((2 == m || 7 == m) && "undefined" !== typeof f.s) {
        if (-2 == proxyHosts[b].testsize)return proxyHosts[b].testsize = f.s, proxyHosts[b].testhash = f.h, !0;
        7 == m ? checkN(proxyHosts[b].testsize, f.s, 15) && .15 > compareH(proxyHosts[b], f.h) && (p = !0) : 2 == m && (p = !0, checkN(proxyHosts[b].testsize, f.s, 15) && .15 > compareH(proxyHosts[b], f.h) && (p = !1));
        delete proxyHosts[b].testsize;
        delete proxyHosts[b].testhash
    }
    3 == m && f || 2 == m && p || !m && f && "undefined" !== typeof f.res && f.res == c ? (d2(b + " - available"), preOn =
            proxyHosts[b].on, proxyHosts[b].on = !1, proxyHosts[b].d = Date.now() + timewait2, preOn ? setProxy(function () {
                noActIcon();
                tabUpdate(b, g, e)
            }) : tabUpdate(b, g, e)) : (preOn = proxyHosts[b].on, d2(b + " - not available"), proxyHosts[b].on = !0, proxyHosts[b].d = Date.now() + timewait, preOn ? tabUpdate(b, g, e) : setProxy(function () {
                actIcon();
                tabUpdate(b, g, e)
            }))
}
var ind = startUrlIndex - 1, indExt = 0;
function genNewUrl() {
    var b = "";
    ind++;
    ind > endUrlIndex && (ind = startUrlIndex, indExt++, indExt > extArr.length - 1 && (indExt = 0));
    ind != endUrlIndex && (b = ind);
    ext = extArr[indExt];
    return "https://apigo.fri-gate" + b + "." + ext + apiPath + apiFile
}
function reGet(b) {
    if (apioffset + 2 > apicount)return "" == pr && proxyoff(), apioffset = 0, !0;
    apioffset += 1;
    setTimeout(function () {
        getSitesUrl(!1, b)
    }, 3E3)
}
function saveHostsToLs() {
    var b = {};
    if (!emptyObject(proxyHosts)) {
        var c, e;
        for (e in proxyHosts)proxyHosts.hasOwnProperty(e) && (c = proxyHosts[e], b[e] = "undefined" !== typeof c.ons ? {ons: c.ons} : {}, "undefined" !== typeof c.url && c.url && (b[e].url = c.url), "undefined" !== typeof c.l && c.l && (b[e].l = c.l), "undefined" !== typeof c.lid && c.lid && (b[e].lid = c.lid), "uefined" !== typeof c.hide && c.hide && (b[e].hide = !0))
    }
    ls.set("hosts", b, uid)
}
function savenewhosts(b, c) {
    var e = 0, g = 0;
    !c || emptyObject(c) || emptyObject(proxyHosts) || Array.each(c, function (b, c) {
        "undefined" != typeof proxyHosts[b] && "undefined" == typeof proxyHosts[b].lid && (delete proxyHosts[b], proxyHostsCl.erase("*://" + b + "/*"), g++)
    });
    proxyHosts || (proxyHosts = {});
    var f = ls.get("list"), m = {};
    emptyObject(f) || (Array.each(f, function (b, c) {
        Array.each(b.d, function (b) {
            m[b.h] = !0
        })
    }), f = {});
    Object.each(b, function (b) {
        var c = b.h;
        c && ("undefined" == typeof proxyHosts[c] ? "undefined" == typeof m[c] && (proxyHosts[c] =
                {
                    on: !1,
                    d: 0,
                    bl: !1
                }, proxyHosts[c].ons = "undefined" != typeof b.ons && b.ons ? !0 : !1, "undefined" != typeof b.url && b.url && (proxyHosts[c].url = b.url), proxyHostsCl.include("*://" + c + "/*"), isProxyHosts = isChange = !0, e++) : "undefined" != typeof proxyHosts[c].lid || "undefined" == typeof b.url || !b.url || "undefined" != typeof proxyHosts[c].url && proxyHosts[c].url == b.url || (proxyHosts[c].url = b.url, isProxyHosts = isChange = !0, e++))
    });
    var p = {}, n = Object.keys(b);
    130 < n.length && Object.each(proxyHosts, function (c, e) {
        for (var f = 0, k = n.length; f < k; f++)if (e ==
            b[n[f]].h || "undefined" != typeof c.lid) {
            p[e] = c;
            return
        }
        g++
    });
    proxyHosts = p;
    return e || g ? (d2("save to friGate host. add:" + e + ", del:" + g), saveHostsToLs(), !0) : !1
}
function proxyHostsAdd(b, c) {
    var e = {on: !1, d: 0, bl: !1, ons: !1};
    "undefined" !== typeof c.ons && (e.ons = c.ons);
    "undefined" !== typeof c.l && c.l && (e.l = c.l);
    "undefined" !== typeof c.lid && c.lid && (e.lid = c.lid);
    "undefined" !== typeof c.url && c.url && (e.url = c.url, 0 > c.url || checkUrls.push(b + c.url));
    "undefined" !== typeof c.hide && c.hide && (e.hide = !0);
    return e
}
function parseRepText(b) {
    var c = [];
    if (null != b) {
        var e = b.length;
        if (0 < e)for (; e--;)"undefined" != typeof b[e] && c.push({f: b[e].f, t: b[e].t, s: RegExp(b[e].s, "i")})
    }
    return c
}
function loadhosts() {
    (azaprethide = ls.get("azaprethide")) || (azaprethide = {});
    var b = 0;
    proxyHosts = {};
    proxyHostsCl = [];
    checkUrls = [];
    var c = ls.get("hosts", uid);
    if (!emptyObject(c))for (var e in c)e && c.hasOwnProperty(e) && (proxyHosts[e] = proxyHostsAdd(e, c[e]), b++, proxyHostsCl.push("*://" + e + "/*"), isProxyHosts = !0);
    c = ls.get("list");
    emptyObject(c) || Array.each(c, function (c, e) {
        c.on && Array.each(c.d, function (g) {
            var f = g.h;
            g.on && "undefined" == typeof proxyHosts[f] && (proxyHosts[f] = proxyHostsAdd(f, {
                ons: !0,
                l: c.n,
                lid: e,
                url: g.u
            }),
                b++, proxyHostsCl.push("*://" + f + "/*"), isProxyHosts = !0)
        })
    });
    c = ls.get("dataRep", uid);
    "object" === typeof c && (dataRep = parseRepText(c));
    (c = ls.get("serialRep", !1)) && (serialRep = c);
    if ((c = ls.get("redir", uid)) && "object" == typeof c) {
        for (e in c)c.hasOwnProperty(e) && proxyHostsCl.include("*://" + e + "/*");
        rep = c;
        isRep = !0
    }
    1 > proxyHostsCl.length && (serial = 0);
    d2("loading from localStorage " + b + " hosts")
}
function setProxy(b) {
    var c = "", e = "", g = "[]", f = !1, m = 0, m = [];
    if (ison) {
        for (var p in proxyHosts)if (proxyHosts.hasOwnProperty(p)) {
            var n = proxyHosts[p];
            if (openPr || !openPr && "undefined" == typeof proxyHosts[p].lid)if (!(0 > n.ons) && (n.on || n.ons) || n.man) f = !0, m.push(p)
        }
        e = JSON.stringify(azapret);
        p = md5(e);
        var k = azapret.length, c = JSON.stringify(m), n = md5(c), m = checkUrls.length;
        0 < m && (g = JSON.stringify(checkUrls));
        var q = md5(g);
        if (preazapret != p || presites != n || preurls != q || preproxy != pr) {
            preazapret = p;
            presites = n;
            preurls = q;
            preproxy =
                pr;
            if (f || 0 < m || 0 < k) {
                var r = pr, t = pr2;
                t || (t = "DIRECT");
                var u = "", v;
                for (v in tld)tld.hasOwnProperty(v) && tld[v] && (u = u + "if (dnsDomainIs(host, '." + v + "')) {return '" + t + "';} ");
                postclearproxy = function () {
                    var f = {
                        mode: "pac_script", pacScript: {
                            data: "function FindProxyForURL(url, host) {var schema=url.substring(0,5); if ( schema!='https' && schema!='http:' ) return 'DIRECT'; if ( shExpMatch( url,'*/aj/frigate/api/+" + apiFile + "*' ) ) return 'DIRECT'; if ( shExpMatch( url,'https://api3.fri*:80/' ) ) return 'DIRECT'; if (shExpMatch( url,\"*" +
                            nameTestFile + "\" + host + \".js*\") ) return 'DIRECT'; if ( url.indexOf('frigate_test_file=')!=-1 ) return 'DIRECT'; if (shExpMatch( url,'*/frigate_404_check_*.png*') ) return 'DIRECT'; var az = " + e + "; var i; var is = false; var len = " + k + ";for (i = 0; i < len; i++) {if ( az[i] == host) { is = true; break; } }if (!is) {var urls = " + g + "; var url2=url.substring(url.indexOf('//')+2);if ( urls.indexOf(url2)!=-1 ) return 'DIRECT';var sites = " + c + "; var i; is = false;while (i = sites.shift()) { if (i == host) { is = true; break;} if ( i[0] == '*') { var lenHost = -1*(i.length-2); if (i.substr(lenHost) == host) { is = true; break; } lenHost = -1*(i.length-1); if (i.substr(lenHost) == host.substr(lenHost)) { is = true; break; } }}} if (is) {if ( schema=='http:' ) return '" +
                            r + "'; else return '" + t + "';} " + u + "return 'DIRECT';}"
                        }
                    };
                    try {
                        chrome.proxy.settings.set({value: f, scope: "regular"}, b)
                    } catch (x) {
                        b()
                    }
                }
            } else postclearproxy = b;
            try {
                chrome.proxy.settings.clear({scope: "regular"}, postclearproxy)
            } catch (w) {
                postclearproxy()
            }
            return !0
        }
    }
    "function" == typeof b && b()
}
function getSitesUrl(b, c) {
    openPr || chrome.browserAction.setTitle({title: "wait"});
    var e = Date.now();
    timeClSerial < e && (serial = 0, timeClSerial = e + timewaitClSerial);
    b = getapiurl(apioffset);
    if (1 > apicount) {
        if (!(1E4 > e - apistarttime)) {
            if (3 < apiloadattempts) {
                proxyoff();
                return
            }
            genapi()
        }
        setTimeout(function () {
            getSitesUrl(b, c)
        }, 3E3)
    } else d("urlGet", b), getUrl3(b, "post", {}, "k=" + uid + "&t=" + timeOutAuth + "&s=" + serial + "&ip=" + ip + "&po=" + proxyOffset + "&pu=" + proxyUpdate + first_api, function (b) {
        d("apiErr", b);
        reGet(c)
    }, function (e) {
        if (e)if (apiloadattempts =
                0, 2 != proxyUpdate && getUrl3(b + "r", "post", {}, "k=" + uid + "&s=" + serialRep, function () {
                d("apiErr", error)
            }, function (b) {
                if ("" != b && "-" != e) {
                    try {
                        var c = JSON.decode(Utf8.decode(XXTEA.decrypt(Base64.decode(b), uid)))
                    } catch (w) {
                    }
                    e = null;
                    void 0 != c && "object" == typeof c && c.hasOwnProperty("d") && "object" == typeof c.d && (c.hasOwnProperty("h") && c.h && (serialRep = c.h, ls.set("serialRep", serialRep, !1)), ls.set("dataRep", c.d, uid), dataRep = parseRepText(c.d))
                }
            }), "noUpdate" != e) {
            d("len", e.length);
            var f = md5(e), g = !1, p = !1, n = !1;
            if (f != md5api) {
                try {
                    var k =
                        JSON.decode(XXTEA.decrypt(Base64.decode(e), uid))
                } catch (u) {
                }
                e = null;
                7 == Object.keys(k).length && d("j", k);
                if (void 0 != k && "object" == typeof k) {
                    md5api = f;
                    first_api = "";
                    k.serial && (serial = k.serial);
                    if (k.r && 0 < Object.getLength(k.r)) {
                        isRep = !0;
                        var q = {};
                        Array.each(k.r, function (b, c) {
                            q[b.f] = b.t;
                            proxyHostsCl.include("*://" + b.f + "/*")
                        });
                        rep = q;
                        ls.set("redir", rep, uid)
                    }
                    k.ip && (ip = k.ip, d2("you IP: " + k.ip));
                    k.prauth && (prauth = k.prauth, ls.set("prauth", prauth, !1));
                    k.prauth2 && (prauth2 = k.prauth2, ls.set("prauth2", prauth2, !1));
                    k.prauth3 &&
                    (prauth3 = k.prauth3, ls.set("prauth3", prauth3, !1));
                    k.prauth4 && (prauth4 = k.prauth4, ls.set("prauth4", prauth4, !1));
                    k.pr && (proxyUpdate = 0, prDef = k.pr, f = ls.get("pr2"), !f || 1 > f.length ? prDef != pr && (prDefCo = k.prco, pr = prDef, prco = prDefCo, prip = getprip(pr), k.pr2 && (pr2 = "pr" == k.pr2 ? k.pr : k.pr2), p = !0) : d2("use own proxy"));
                    "undefined" != typeof k.po && (proxyOffset = k.po);
                    k.blHosts && 0 < k.blHosts.length && (blHosts = k.blHosts);
                    k.azapret && "object" == typeof k.azapret && 0 < k.azapret.length && (azapret = k.azapret, p = !0, d2("loading antizapret: " +
                        azapret.length + " hosts"));
                    k.proxyHosts && (lastLoadHosts = k.proxyHosts, d2("loading from web: " + k.proxyHosts.length + " hosts"), g = savenewhosts(k.proxyHosts, k.delhost));
                    if (0 == k.err || "0" == k.err) openPr = !0;
                    onOffLimit();
                    k.news && (news = k.news, ls.set("news", k.news));
                    k.t && (timeOutAuth = k.t);
                    if (k.ver) {
                        for (var f = detailsApp.version.split(/\./g), k = k.ver.split(/\./g), r = 0, t = f.length; r < t; r++)if (f[r].toInt() < k[r].toInt()) {
                            n = !0;
                            break
                        }
                        n ? (updateText = l("messUpdate"), ls.set("updateText", !0)) : (updateText = "", ls.set("updateText",
                                !1))
                    }
                    g || p ? (g && ison && (setOrUpdateHandlers(), setOrUpdateTabHandlers()), setProxy(c)) : "function" == typeof c && c()
                } else reGet(c), d2("error load 1")
            } else onOffLimit()
        } else md5api = "", d("noUpd", ""), onOffLimit(); else reGet(c), d2("error load 2")
    })
}
(function (b, c) {
    var e, g, f = [], m, p, n = c.createElement("div"), k = function () {
        clearTimeout(p);
        e || (Browser.loaded = e = !0, c.removeListener("DOMContentLoaded", k).removeListener("readystatechange", q), c.fireEvent("domready"), b.fireEvent("domready"));
        c = b = n = null
    }, q = function () {
        for (var b = f.length; b--;)if (f[b]())return k(), !0;
        return !1
    }, r = function () {
        clearTimeout(p);
        q() || (p = setTimeout(r, 10))
    };
    c.addListener("DOMContentLoaded", k);
    var t = function () {
        try {
            return n.doScroll(), !0
        } catch (u) {
        }
        return !1
    };
    n.doScroll && !t() && (f.push(t),
        m = !0);
    c.readyState && f.push(function () {
        var b = c.readyState;
        return "loaded" == b || "complete" == b
    });
    "onreadystatechange" in c ? c.addListener("readystatechange", q) : m = !0;
    m && r();
    Element.Events.domready = {
        onAdd: function (b) {
            e && b.call(this)
        }
    };
    Element.Events.load = {
        base: "load", onAdd: function (c) {
            g && this == b && c.call(this)
        }, condition: function () {
            this == b && (k(), delete Element.Events.load);
            return !0
        }
    };
    b.addEvent("load", function () {
        g = !0
    })
})(window, document);
chrome.proxy.settings.get({incognito: !1}, function (b) {
    b && "undefined" != typeof b.levelOfControl && "controllable_by_this_extension" != b.levelOfControl && "controlled_by_this_extension" != b.levelOfControl && (ison = !1, errIcon());
    ison && 0 < proxyHostsCl.length ? (isProxyHosts || isRep ? setOrUpdateHandlers() : offHandlersAll(), tabUpdateAll(), setOrUpdateTabHandlers(0)) : (offHandlersAll(), tabUpdateAll(), disIcon());
    window.addEvent("domready", function (b) {
        chrome[runtimeOrExtension].onMessage.addListener(getMessage);
        chrome.tabs.onRemoved.addListener(function () {
            chrome.tabs.query({},
                function (b) {
                    if (!b.length && iscl) {
                        var c = function () {
                            iscl || (iscl = !0, proxyon(), chrome.tabs.onCreated.hasListener(c) && chrome.tabs.onCreated.removeListener(c))
                        };
                        iscl = !1;
                        proxyoff(!0);
                        chrome.tabs.onCreated.hasListener(c) || chrome.tabs.onCreated.addListener(c)
                    }
                })
        });
        ison ? setTimeout(function () {
                proxyon(!0)
            }, 300) : first && (first_api = "&first_api", getSitesUrl());
        chrome.browserAction.onClicked.addListener(function () {
            onoff()
        })
    })
});
