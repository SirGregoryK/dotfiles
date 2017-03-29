/*
	content/common.js
	Copyright © 2009, 2010, 2011  WOT Services Oy <info@mywot.com>

	This file is part of WOT.

	WOT is free software: you can redistribute it and/or modify it
	under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	WOT is distributed in the hope that it will be useful, but WITHOUT
	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
	or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
	License for more details.

	You should have received a copy of the GNU General Public License
	along with WOT. If not, see <http://www.gnu.org/licenses/>.
*/

wot.cache = {
	get: function(target, onget)
	{
		wot.bind("cache:put:" + target, onget);
		wot.post("cache", "get", { target: target });
	},

	clear: function(target)
	{
		wot.post("cache", "clear", { target: target });
	},

	onload: function()
	{
		wot.bind("message:cache:put", function(port, data) {
			wot.trigger("cache:put:" + data.target,
				[ data.target, data.data ], true);
		});
	}
};

wot.cache.onload();

wot.prefs = {
	disallowed: {
		"witness_key": true
	},
	pending: {},

	tabId : null,

	crowningStarted : false, // The common.js might load twice per page

	get: function(name, onget)
	{
		wot.bind("prefs:put:" + name, onget);

		if (this.disallowed[name]) {
			wot.trigger("prefs:put:" + name, [ name, null ], true);
		} else {
			this.pending[name] = true;
			wot.post("prefs", "get", { name: name });
		}
	},

	load: function(list, onget, onready)
	{
		var toget = [];

		list.forEach(function(item) {
			wot.bind("prefs:put:" + item, onget);

			if (wot.prefs.disallowed[item]) {
				wot.trigger("prefs:put:" + item, [ item, null ], true);
			} else {
				wot.prefs.pending[item] = true;
				toget.push(item);
			}
		});

		wot.post("prefs", "getm", { names: toget });
		wot.bind("prefs:ready", onready);
	},

	set: function(name, value)
	{
		wot.post("prefs", "set", { name: name, value: value });
	},

	clear: function(name)
	{
		wot.post("prefs", "clear", { name: name });
	},

	refreshCrowning: function() {
		// Checking if uninstall
		var core = wot.core
		var txt = wot.i18n("locale");
		if(txt) {
			wot.post("search", "master", { tabId: this.tabId, url:document.location.href });
		}
		else {
			if(this.master) {
				var iframe = document.createElement('iframe');
				iframe.style.display = "none";
				iframe.style.height = "500px";
				iframe.style.width = "500px";
				var query = '?' + Object.keys(this.info).map(function(key) {
					return encodeURIComponent(key) + '=' +
						encodeURIComponent(this.info[key]);
				}).join('&');
				iframe.src = wot.UNINSTALL_FRAME_URL + query;
				document.body.appendChild(iframe);
				window.clearInterval(this.crowningInterval);
			}
		}
	},

	crowningInterval:null,
	master:false,
	info:{},

	onload: function()
	{

		wot.bind("message:search:crowning", function(port, data) {
			this.tabId = data.tabId;
			this.master = data.master;
			this.info = data.info;
		});

		if(window == top && !this.crowningStarted) {
			this.crowningStarted = true;
			window.crowningInterval = window.setInterval(this.refreshCrowning, 3000);
		}

		wot.addready("prefs", this, function() {
			for (var i in this.pending) {
				return false;
			}
			return true;
		});

		wot.bind("message:prefs:putm", function(port, data) {
			for (var i in data.values) {
				delete(wot.prefs.pending[i]);
				wot.trigger("prefs:put:" + i, [ i, data.values[i] ], true);
			}

			wot.prefs.ready();
		});

		wot.bind("message:prefs:put", function(port, data) {
			delete(wot.prefs.pending[data.name]);

			wot.trigger("prefs:put:" + data.name, [ data.name, data.value ],
				true);
			wot.prefs.ready();
		});
	}
};

wot.prefs.onload();
