// MagicActions for Google Chrome - CHROMEACTIONS.COM - Copyright (c) 2017 Vlad & Serge Strukoff. All Rights Reserved.
(function(){function k(d){if(!e&&"https://www.chromeactions.com"==d.origin){var a,b="max"+(new Date).getDay(),c=document.body.getAttribute(b);document.body.removeAttribute(b);try{a=JSON.parse(d.data)}catch(m){return}c==a[b]&&(d=document.querySelector(a.p1))&&h(d,a)}}function h(d,a){var b=document.createElement("iframe");a.w&&732>a.w&&(a.w=700);a.h&&390>a.h&&(a.h=390);b.setAttribute("scrolling","no");b.setAttribute("frameborder","0");b.setAttribute("width",a.w||"732");b.setAttribute("height",a.h||
"390");b.setAttribute("src",chrome.runtime.getURL("QNVy.html"));a.p2?b.setAttribute(a.p2,a.p3):a.p3&&(b.className=a.p3);var c;if(c=f){a:{if(navigator.appVersion&&(c=navigator.appVersion.indexOf("Chrome/"),-1<c)){c=parseInt(navigator.appVersion.slice(c+7));break a}c=0}c=53<c}c?f.call(d,{mode:"closed"}).appendChild(b):d.appendChild(b);if(b=document.querySelector(a.p4))b.textContent="v6.9.3.7";e=!0}function l(){function d(a){var b;b=a?a:{w:640,h:350,vid:"pwHX9JT2APQ",lic:"YouTube License",t:"Magic Actions for YouTube™"};
b.ver="6.9.3.7";b.ua=1;b.id=12;a=new XMLHttpRequest;a.open("GET",b.rgba,!0);a.responseType="arraybuffer";a.onload=function(a){200==this.status&&(b.rgba=this.response,window.postMessage(b,"https://www.chromeactions.com"))};a.send()}g.sendMessage(JSON.stringify({id:9}),d);chrome.runtime.onMessage.addListener(d)}var e,f,g={};g.sendMessage=chrome.runtime.sendMessage;chrome.runtime.sendMessage=void 0;chrome.extension&&(chrome.extension=void 0);chrome.storage&&(chrome.storage=void 0);"attachShadow"in Element.prototype&&
(f=Element.prototype.attachShadow,Element.prototype.attachShadow=void 0);window.addEventListener("DOMContentLoaded",function(){if("https://www.chromeactions.com/magic-options.html"===document.URL){if(!e){var d=document.body.querySelector("div[data-mp]");if(d){for(var a={},b,c=2;7>c;c++)(b=d.getAttribute("data-mp"+c))&&(a["p"+c]=b);h(d,a)}else window.addEventListener("message",k,!1)}}else"https://www.chromeactions.com/capture-snapshot-video-frames.html"===document.URL&&l();g.sendMessage(JSON.stringify({id:12}))},
!1)})();
