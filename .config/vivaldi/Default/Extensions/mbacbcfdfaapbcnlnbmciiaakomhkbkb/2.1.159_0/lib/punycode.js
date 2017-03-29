var punycode = new function () {
    function r(a, d) {
        return a + 22 + 75 * (26 > a) - ((0 != d) << 5)
    }

    function t(a, d, c) {
        a = c ? Math.floor(a / 700) : a >> 1;
        a += Math.floor(a / d);
        for (d = 0; 455 < a; d += 36)a = Math.floor(a / 35);
        return Math.floor(d + 36 * a / (a + 38))
    }

    function u(a, d) {
        a -= (26 > a - 97) << 5;
        return a + ((!d && 26 > a - 65) << 5)
    }

    this.utf16 = {
        decode: function (a) {
            for (var d = [], c = 0, f = a.length, e, n; c < f;) {
                e = a.charCodeAt(c++);
                if (55296 === (e & 63488)) {
                    n = a.charCodeAt(c++);
                    if (55296 !== (e & 64512) || 56320 !== (n & 64512))throw new RangeError("UTF-16(decode): Illegal UTF-16 sequence");
                    e = ((e & 1023) << 10) + (n & 1023) + 65536
                }
                d.push(e)
            }
            return d
        }, encode: function (a) {
            for (var d = [], c = 0, f = a.length, e; c < f;) {
                e = a[c++];
                if (55296 === (e & 63488))throw new RangeError("UTF-16(encode): Illegal UTF-16 value");
                65535 < e && (e -= 65536, d.push(String.fromCharCode(e >>> 10 & 1023 | 55296)), e = 56320 | e & 1023);
                d.push(String.fromCharCode(e))
            }
            return d.join("")
        }
    };
    this.decode = function (a, d) {
        var c = [], f = [], e = a.length, n, m, b, h, g, l, p, k, q;
        n = 128;
        b = 0;
        h = 72;
        g = a.lastIndexOf("-");
        0 > g && (g = 0);
        for (l = 0; l < g; ++l) {
            d && (f[c.length] = 26 > a.charCodeAt(l) - 65);
            if (128 <= a.charCodeAt(l))throw new RangeError("Illegal input >= 0x80");
            c.push(a.charCodeAt(l))
        }
        for (g = 0 < g ? g + 1 : 0; g < e;) {
            l = b;
            m = 1;
            for (p = 36; ; p += 36) {
                if (g >= e)throw RangeError("punycode_bad_input(1)");
                k = a.charCodeAt(g++);
                k = 10 > k - 48 ? k - 22 : 26 > k - 65 ? k - 65 : 26 > k - 97 ? k - 97 : 36;
                if (36 <= k)throw RangeError("punycode_bad_input(2)");
                if (k > Math.floor((2147483647 - b) / m))throw RangeError("punycode_overflow(1)");
                b += k * m;
                q = p <= h ? 1 : p >= h + 26 ? 26 : p - h;
                if (k < q)break;
                if (m > Math.floor(2147483647 / (36 - q)))throw RangeError("punycode_overflow(2)");
                m *= 36 - q
            }
            m = c.length + 1;
            h = t(b - l, m, 0 === l);
            if (Math.floor(b / m) > 2147483647 - n)throw RangeError("punycode_overflow(3)");
            n += Math.floor(b / m);
            b %= m;
            d && f.splice(b, 0, 26 > a.charCodeAt(g - 1) - 65);
            c.splice(b, 0, n);
            b++
        }
        if (d)for (b = 0, e = c.length; b < e; b++)f[b] && (c[b] = String.fromCharCode(c[b]).toUpperCase().charCodeAt(0));
        return this.utf16.encode(c)
    };
    this.encode = function (a, d) {
        var c, f, e, n, m, b, h, g, l, p;
        d && (p = this.utf16.decode(a));
        a = this.utf16.decode(a.toLowerCase());
        var k = a.length;
        if (d)for (b = 0; b < k; b++)p[b] = a[b] != p[b];
        var q = [];
        c =
            128;
        f = 0;
        m = 72;
        for (b = 0; b < k; ++b)128 > a[b] && q.push(String.fromCharCode(p ? u(a[b], p[b]) : a[b]));
        e = n = q.length;
        for (0 < n && q.push("-"); e < k;) {
            h = 2147483647;
            for (b = 0; b < k; ++b)g = a[b], g >= c && g < h && (h = g);
            if (h - c > Math.floor((2147483647 - f) / (e + 1)))throw RangeError("punycode_overflow (1)");
            f += (h - c) * (e + 1);
            c = h;
            for (b = 0; b < k; ++b) {
                g = a[b];
                if (g < c && 2147483647 < ++f)return Error("punycode_overflow(2)");
                if (g == c) {
                    h = f;
                    for (g = 36; ; g += 36) {
                        l = g <= m ? 1 : g >= m + 26 ? 26 : g - m;
                        if (h < l)break;
                        q.push(String.fromCharCode(r(l + (h - l) % (36 - l), 0)));
                        h = Math.floor((h - l) /
                            (36 - l))
                    }
                    q.push(String.fromCharCode(r(h, d && p[b] ? 1 : 0)));
                    m = t(f, e + 1, e == n);
                    f = 0;
                    ++e
                }
            }
            ++f;
            ++c
        }
        return q.join("")
    };
    this.ToASCII = function (a) {
        a = a.split(".");
        for (var d = [], c = 0; c < a.length; ++c) {
            var f = a[c];
            d.push(f.match(/[^A-Za-z0-9-]/) ? "xn--" + punycode.encode(f) : f)
        }
        return d.join(".")
    };
    this.ToUnicode = function (a) {
        a = a.split(".");
        for (var d = [], c = 0; c < a.length; ++c) {
            var f = a[c];
            d.push(f.match(/^xn--/) ? punycode.decode(f.slice(4)) : f)
        }
        return d.join(".")
    }
};
