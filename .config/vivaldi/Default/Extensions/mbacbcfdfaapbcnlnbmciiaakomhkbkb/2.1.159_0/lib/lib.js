var onmootools = null, isD = !1, isD2 = !0, apiFile = "", apiSizeFile = "getsize_1.html", apiHostSlow = "https://apigo.fri-gate.biz", apiHost = "https://api3.fri-gate.eu:80", apiSizeHost = apiHost, apiPath = "/", urlForGetUrls = apiHost + apiPath + apiFile, urlForGetSize = apiSizeHost + apiPath + apiSizeFile, apiHo = ["api3.fri-gate", "api3.friproxy"], apiTl = ["biz", "eu", "org"], apiIn = ["", "0"], apiAdd = ["http://178.32.113.122/"], apiall, apicount = 0, apioffset = 0, apistarttime, apiloadattempts = 0, runtimeOrExtension = chrome.runtime && chrome.runtime.sendMessage ?
    "runtime" : "extension", noadv, sovetnik, pav = {}, globalTimeout = 12E3, tld = {
    onion: !0,
    coin: !0,
    emc: !0,
    lib: !0,
    bazar: !0
};
if ("function" != typeof $empty)var $empty = function () {
};
function getTld() {
    var a = ls.get("tld");
    if ("object" === typeof a && a)for (var b in tld)tld.hasOwnProperty(b) && a.hasOwnProperty(b) && (tld[b] = a[b]); else setTld(tld)
}
function setTld(a) {
    ls.set("tld", a)
}
function zeroPad(a, b) {
    var c = b - a.toString().length + 1;
    return Array(+(0 < c && c)).join("0") + a
}
var d = function (a, b) {
    if (isD) {
        var c = new Date, c = zeroPad(c.getHours(), 2) + ":" + zeroPad(c.getMinutes(), 2) + ":" + zeroPad(c.getSeconds(), 2) + "." + zeroPad(c.getMilliseconds(), 3);
        "number" != typeof b && "string" != typeof b && (b = JSON.stringify(b));
        console.log(c + " - " + a + " == " + b)
    }
}, d2 = function (a) {
    if (isD2) {
        var b = new Date, b = zeroPad(b.getHours(), 2) + ":" + zeroPad(b.getMinutes(), 2) + ":" + zeroPad(b.getSeconds(), 2) + "." + zeroPad(b.getMilliseconds(), 3);
        console.log(b + " - " + a)
    }
};
function l(a) {
    return chrome.i18n.getMessage(a)
}
function emptyObject(a) {
    for (var b in a)return !1;
    return !0
}
function getClHost(a) {
    return 0 == a.indexOf("*") ? a.substring(2) : a
}
function getprip(a) {
    a = a.split(/\s+/g);
    a = a[1].split(/:/);
    return a[0]
}
function generatePW(a) {
    var b, c = "";
    a || (a = 16);
    for (b = 0; b < a; b++)c += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(61 * Math.random());
    return c
}
function checkN(a, b, c) {
    if (a > b) {
        if (a - b <= b * c / 100)return !0
    } else if (b - a <= a * c / 100)return !0;
    return !1
}
function compareH(a, b) {
    var c = 0;
    arr1length = a.length;
    for (var e = 0; e < arr1length; e++)a[e] != b[e] && (c += Math.abs(a[e] - b[e]) / (a[e] + b[e]));
    return c / 36
}
Array.prototype.pad = function (a, b) {
    var c = Math.abs(a) - this.length, e = [].concat(this);
    if (0 >= c)return e;
    for (var g = 0; g < c; g++)0 > a ? e.unshift(b) : e.push(b);
    return e
};
function h(a) {
    var b = {
        0: 33,
        1: 24,
        2: 25,
        3: 26,
        4: 27,
        5: 28,
        6: 29,
        7: 30,
        8: 31,
        9: 32,
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
        f: 5,
        g: 6,
        h: 7,
        i: 8,
        j: 9,
        k: 10,
        l: 11,
        m: 12,
        n: 13,
        o: 14,
        p: 15,
        r: 16,
        s: 17,
        t: 18,
        u: 19,
        v: 20,
        x: 21,
        y: 22,
        z: 23,
        _: 34,
        "-": 35
    };
    a = a.replace(/[^a-z0-9-_]/ig, "");
    a = a.toLowerCase();
    ret = [].pad(36, 0);
    tlength = a.length;
    for (var c = 0; c < tlength; c++)"undefined" !== typeof b[a[c]] && ret[b[a[c]]]++;
    return {h: ret, s: tlength}
}
function genRandFile(a, b) {
    return a + b + "/frigate_404_check_" + generatePW(16) + Date.now() + ".png"
}
function getUrl(a, b, c, e, g) {
    var k = (new Request.JSON({
        url: a + "?" + Date.now(),
        method: b,
        noCache: !0,
        timeout: globalTimeout,
        onFailure: e,
        onTimeout: function () {
            k.cancel();
            e()
        },
        onError: e,
        onSuccess: g
    })).send(c)
}
function getUrl3(a, b, c, e, g, k) {
    var m = (new Request({
        url: a + "?" + Date.now(),
        method: b,
        noCache: !0,
        timeout: globalTimeout,
        onFailure: g,
        headers: c,
        onTimeout: function () {
            m.cancel();
            g("onTimeout")
        },
        onSuccess: k
    })).send(e)
}
var Req = function (a, b, c, e, g, k, m) {
    k || (k = "GET");
    m ? "GET" == k && (a = a + "?" + m) : m = null;
    var f = new XMLHttpRequest;
    f.onabort = function () {
        e("abort")
    };
    f.ontimeout = function () {
        g(f.status + " - " + f.statusText)
    };
    f.onerror = function () {
        e(f.status + " " + f.statusText)
    };
    f.onload = function () {
        4 === f.readyState && (200 === f.status ? c(f.response) : e(f.status))
    };
    try {
        f.open(k, a, !0)
    } catch (n) {
        return
    }
    "POST" == k ? f.setRequestHeader("Content-Type", "application/x-www-form-urlencoded") : m = null;
    f.timeout = b;
    try {
        f.send(m)
    } catch (n) {
        e(null)
    }
};
function setContentLengthCounterStart() {
    ContentLengthCounterStart = Math.round((new Date).getTime() / 1E3);
    ls.set("ContentLengthCounterStart", ContentLengthCounterStart)
}
function genapi() {
    apiloadattempts += 1;
    apiall = {};
    var a = [];
    apiHo.forEach(function (b) {
        apiTl.forEach(function (c) {
            apiIn.forEach(function (e) {
                a.push("https://" + b + e + "." + c + ":80/")
            })
        })
    });
    a.shuffle();
    apistarttime = new Date;
    a.forEach(function (a) {
        apiall[a] = -1;
        var b = new Date;
        Req(a, 12E3, function () {
            apiall[a] = new Date - b
        }, function () {
            apiall[a] = -1
        }, function () {
            apiall[a] = -1
        }, "GET")
    })
}
function getapiurl(a) {
    function b(a, b) {
        return a.val - b.val
    }

    a || (a = 0);
    var c = [], e;
    for (e in apiall)apiall.hasOwnProperty(e) && -1 < apiall[e] && c.push({val: apiall[e], host: e});
    0 < apiAdd.length && apiAdd.forEach(function (a) {
        c.push({val: 4E4, host: a})
    });
    apicount = c.length;
    return 0 < apicount ? (c.sort(b), d("", c), c[a].host) : !1
}
Array.prototype.contains = function (a, b) {
    return -1 != this.indexOf(a, b)
};
Array.prototype.include = function (a) {
    this.contains(a) || this.push(a);
    return this
};
Array.prototype.shuffle = function (a) {
    for (var b = this.length, c, e; b;)c = Math.floor(b-- * Math.random()), e = a && "undefined" !== typeof this[b].shuffle ? this[b].shuffle() : this[b], this[b] = this[c], this[c] = e;
    return this
};
