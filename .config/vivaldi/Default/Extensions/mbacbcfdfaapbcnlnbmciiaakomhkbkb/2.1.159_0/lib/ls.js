ls = {
    isset: function (a) {
        return "undefined" != typeof localStorage[a] ? !0 : !1
    }, get: function (a, b) {
        if (null !== localStorage.getItem(a)) {
            if (b) {
                var c = XXTEA.decrypt(localStorage.getItem(a), b);
                return c ? JSON.parse(Utf8.decode(c)) : ""
            }
            return JSON.parse(localStorage.getItem(a))
        }
        return null
    }, set: function (a, b, c) {
        b = JSON.stringify(b);
        c && (b = XXTEA.encrypt(Utf8.encode(b), c));
        localStorage.setItem(a, b)
    }, del: function (a) {
        localStorage.removeItem(a)
    }, getAll: function () {
        ret = {};
        Object.each(localStorage, function (a, b) {
            try {
                ret[b] = JSON.parse(a)
            } catch (c) {
            }
        });
        return ret
    }
};
