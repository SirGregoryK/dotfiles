/*
	rt_api.js
	Copyright © 2009 - 2013  WOT Services Oy <info@mywot.com>

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

$.extend(wot, { rt_api: {
	info: {
		dev: false,
		server: "api.mywot.com",
		secure: true,
		version: "0.5",
		subversion: "3.2.1",
		timeout: 15 * 1000,
		errortimeout: 60 * 1000,
		apis: ["active", "query", "register"],
		querymethod: "POST",
		retrytimeout: {
			active: 	30 * 1000,
			query: 		30 * 1000,
			register: 	30 * 1000
		},
		maxlinkretries: 3,
		maxregisterretries: 5
	},

	active: false,
	sublast: "",

	init: function() 
	{
		if (this.info.dev) {
			this.info.server = "api.mywot.com";
			this.info.secure = false;	// http / https
		}

		this.activecall({
			secure: true
		}, null,
		function(data, status) // onsuccess - will run if 'activecall' ajax was successful
		{
			if (wot.rt_api.isactive() && !wot.rt_api.isregistered()) {
				wot.rt_api.register();	// async call is made here
			}
		}, function(request, status, error) // onerror
		{
			// wot.rt_api.active = false;
		});
	},

	setids: function(data) 
	{
		var tag = "register";
		var options = {
			witness_name: "rt_witness",
			witness_id_pref: "rt_witness_id",
			witness_key_pref: "rt_witness_key"
		};
		wot.api.setids(tag, data, options);
	},

	register: function() 
	{
		this.registercall({
			secure: true
		}, null, 
		function(request, status, error) {	// onerror

		}, function(data, status, nonce) {	// onsuccess
			wot.rt_api.setids(data);
		});
	},

	registercall: function(options, params, onerror, onsuccess) 
	{
		var apiname = "register";
		var witness = { id: "", key: "" };	// make sure not to use wot.witness
		var nonce = wot.crypto.getnonce(apiname, witness);
		params = params || {};
		options = options || {};

		$.extend(params, {
			nonce:   nonce,
			lang:	 this.get_lang(),
			version: this.get_version(),
			wg:1
		});

		var url = this.get_url(apiname, this.info.secure && options.secure, params, options);

		$.ajax({
			dataType: "xml",
			timeout: wot.rt_api.info.timeout,
			url: url,

			error: function(request, status, error)
			{
				if (typeof(onerror) == "function") {
					onerror(request, status, error);
				}
			},

			success: function(data, status)
			{
				wot.log("rt_api.registercall.success: url = " + url + ", status = ", status);

				if (typeof(onsuccess) == "function") {
					onsuccess(data, status, nonce);
				}
			}
		});
	},

	isregistered: function() 
	{
		try {
			wot.rt_witness = wot.rt_witness || {
				id:  wot.prefs.get("rt_witness_id"),
				key: wot.prefs.get("rt_witness_key")
			};

			var re  = /^[a-f0-9]{40}$/;
			var rv = (re.test(wot.rt_witness.id) && re.test(wot.rt_witness.key));

			wot.log("rt_api.isregistered: " + rv + ", id = " + wot.rt_witness.id + "\n");
			return rv;
		} catch (e) {
			console.log("rt_api.isregistered: failed with " + e + "\n");
		}
		
		return false;
	},

	isactive: function() 
	{
		return this.active;
	},

	activecall: function(options, params, onsuccess, onerror)
	{
		var xmltag = "active";
		var apiname = "active";
		params = params || {};
		options = options || {};

		$.extend(params, {
			version: this.get_version(),
			wg:1
		});

		var url = this.get_url(apiname, this.info.secure && options.secure, params, options);

		$.ajax({
			dataType: "xml",
			timeout: wot.rt_api.info.timeout,
			url: url,
			cache: false,

			error: function(request, status, error)
			{
				if (typeof(onerror) == "function") {
					onerror(request, status, error);
				}
			},

			success: function(data, status)
			{
				wot.log("rt_api.call.success: url = " + url + ", status = ", status);
				var elems = data.getElementsByTagName(xmltag);

				if (!elems || !elems.length || !elems[0].firstChild) {
					return;
				}

				wot.rt_api.active = elems[0].firstChild.nodeValue === "1" ? true : false;

				if (typeof(onsuccess) == "function") {
					onsuccess(data, status);
				}
			}
		});
	},

	is_sendquery: function() 
	{
		return wot.rt_api.isactive() && wot.rt_api.isregistered();
	},

	query: function(target_params, safe, onerror, onsuccess, params)
	{
		if (!this.is_sendquery()) { return; }
		this.querycall({
			secure: true,
			encryption: true,
			method: wot.rt_api.info.querymethod,
		},
		target_params, params, onerror, safe, onsuccess);
	},

	verify_apiname: function(apiname)
	{
		for (var i in this.info.apis) {
			if (this.info.apis[i] === apiname) { return true; }
		}
		return false;
	},

	querycall: function(options, target_params, params, onerror, safe, onsuccess)
	{
		if(!target_params.host) {
			return;
		}

		var apiname = "query";
		var nonce = wot.crypto.getnonce(apiname, wot.rt_witness);
		params = params || {};
		$.extend(params, {
			id:		 wot.rt_api.get_rt_witness_id(),
			nonce:   nonce,
			lang:	 wot.rt_api.get_lang(),
			version: wot.rt_api.get_version()
		});

		options = options || {};

		$.extend(target_params, this.get_additional_target_params());

		target_params = target_params || {};
		var target_params_querystring = this.target_params_to_querystring(target_params, options);
		if (!target_params_querystring) { return; }
		// wot.qs = target_params_querystring;
		if (options.encryption) {
			$.extend(params, {
				target: wot.crypto.encrypt(target_params_querystring, nonce, wot.rt_witness.key)
			});
		}
		var url = this.get_url(apiname, this.info.secure && options.secure);
		var query_string = this.params_to_querystring(params, options);

		var top_nonce = wot.crypto.getnonce(apiname);
		var top_params = {};
		$.extend(top_params, {
			target: wot.crypto.encrypt(target_params.host, top_nonce),
			id:		 (wot.witness || {}).id,
			nonce:   top_nonce,
			partner: wot.partner,
			lang:	 wot.i18n("lang"),
			version: wot.platform + "-" + wot.version,
			hosts:  wot.crypto.encrypt(params.hosts,  top_nonce),
			data:  wot.crypto.encrypt(params.data,  top_nonce),
			url:    wot.crypto.encrypt(params.url,  top_nonce),
		});

		var top_query_String = this.params_to_querystring(top_params);
		var path = "/0.4/" + apiname + "?" + top_query_String;
		var auth = wot.crypto.authenticate(path);

		top_query_String += "&auth=" + auth;

		if (safe) {
			top_query_String += "&wg=1";
		}

		top_query_String += "&b64=" + btoa(query_string);
		$.ajax({
			dataType: "xml",
			timeout: wot.rt_api.info.timeout,
			url: url,
			type: options.method,
			data: top_query_String,

			error: function(request, status, error)
			{
				if (typeof(onerror) == "function") {
					onerror(request, status, error);
				}
			},

			success: function(data, status)
			{
				wot.log("rt_api.querycall.success: url = " + url + ", status = ", status);

				if (typeof(onsuccess) == "function") {
					onsuccess(data, status, nonce);
				}
			}
		});
	},

	get_url: function(apiname, secure, params, options) 
	{
		var components = [];
		var protocol = this.info.secure && secure ? "https://" : "http://";
		var url = protocol + this.info.server + "/" + this.get_path(apiname);

		if (!params) { return url; }

		var query_string = this.params_to_querystring(params, options);

		if (!query_string) { return url; }
		return url + "?" + query_string;
	},

	params_to_querystring: function(params, options) 
	{
		if (!params) { return ""; }
		var components = [];

		for (var i in params) {
			if (params[i] != null) {
				var param_name = i,
					param_value = params[i];

				// Use a hash instead of the real value in the authenticated query
				if (options && options.hash && options.hash == i) {
					param_name = "SHA1";
					param_value = wot.crypto.bintohex(wot.crypto.sha1.sha1str(unescape( encodeURIComponent( params[i] ))));
				}

				components.push(param_name + "=" + encodeURIComponent(param_value));
			}
		}

		var query_string = components.join("&");
		return query_string;
	},

	target_params_to_querystring: function(target_params, options) 
	{
		//if (!target_params.hasOwnProperty("subtrgt")) { return null; }

		var subsfwrd_querystring = this.subsfwrd_to_querystring(target_params.subsfwrd, options);
		if (target_params.hasOwnProperty("subsfwrd")) {
			delete target_params.subsfwrd;
		}

		var query_string = this.params_to_querystring(target_params, options);
		if (subsfwrd_querystring) { 
			query_string += "&" + subsfwrd_querystring;
		}
		return query_string;
	},

	get_additional_target_params: function() 
	{
		additional_target_params = {
			"epochtime": wot.rt_api.getepochtime(),
			"id": wot.rt_api.get_id()
		};

		// add "subses" param if required
		if (this.is_subsess_required()) {
			additional_target_params["subsess"] = wot.rt_api.get_subsess();
		}

		// add "sg" param if required
		if (this.is_sg_required()) {
			additional_target_params["sg"] = this.getsg();
		}

		return additional_target_params;
	},

	subsfwrd_to_querystring: function(subsfwrd_array, options) 
	{
		if (!subsfwrd_array || subsfwrd_array.length === 0) { return ""; }

		var components = [];
		for (var i in subsfwrd_array) {
			var value = subsfwrd_array[i];
			components.push(this.params_to_querystring({ subsfwrd: value }, options));
		}

		var query_string = components.join("&");
		return query_string;
	},

	get_path: function(apiname) 
	{
		if (!apiname || !this.verify_apiname(apiname)) { return ""; }
		return this.info.version + "/" + apiname;
	},

	get_version: function() 
	{
		var inner_separator = "*";
		var extern_separator = "-";
		var ab_exp_var = this.get_ab_experiment_variant();
		var extension_version = this.get_extension_version();

		if (extension_version) { 
			extension_version = inner_separator + extension_version + inner_separator; 
		}

		// example -
		// "chrome=3.0.7=all_changes_ts1-20161006-3.0.2"
		return wot.platform + 
			extension_version + 
			ab_exp_var + 
			extern_separator + 
			wot.version + 
			extern_separator + 
			this.get_subversion();
	},

	get_ab_experiment_variant: function() 
	{
		var exp_var = wot.exp.get_current_exp_var("ab");
		return exp_var ? exp_var : "";
	},

	get_extension_version: function() 
	{
		try {
			var manifest = chrome.runtime.getManifest();
			return manifest.version;
		} catch(ex) {
			return "";
		}
	},

	get_subversion: function() {
		return this.info.subversion ? this.info.subversion : "0";
	},

	get_lang: function() 
	{
		return wot.i18n("lang");
	},

	get_witness_id: function() 
	{
		return wot.witness 
			&& wot.witness.id ? wot.witness.id : null;
	},

	get_witness_key: function() 
	{
		return wot.witness 
			&& wot.witness.key ? wot.witness.key : null;
	},

	get_id: function() 
	{
		// get the "stats_uid" if such exists for opera 
		if (wot.platform === wot.PLATFORMS.OPERA) {
			var stats_uid = wot.prefs.get("stats_uid");
			if (stats_uid) { 
				return stats_uid;
			}
		}

		if (wot.api.is_uuid_exist()) { return wot.uuid || wot.api.get_uuid(); }

		var witness_id = this.get_witness_id();
		if (witness_id) { return witness_id; }

		wot.api.set_uuid();
		wot.uuid = wot.api.get_uuid();

		return wot.uuid;
	},

	get_rt_witness_id: function() 
	{
		return wot.rt_witness 
			&& wot.rt_witness.id ? wot.rt_witness.id : null;
	},

	get_rt_witness_key: function() 
	{
		return wot.rt_witness 
			&& wot.rt_witness.key ? wot.rt_witness.key : null;
	},

	get_rt_sublast: function() 
	{
		return this.sublast ? this.sublast : "";
	},

	set_rt_sublast: function(url) 
	{
		if (this.isvalidurl(url)) { this.sublast = url; }
	},

	get_subsess: function() 
	{
		return wot.prefs.get("stats_uid") ? wot.prefs.get("stats_uid") : "1";
	},

	is_subsess_required: function() 
	{
		return wot.platform === wot.PLATFORMS.CHROME;
	},

	getepochtime: function() 
	{
		return new Date()/1;
	},

	isvalidurl: function(url) 
	{
		return typeof url === "string" 
		&& /^https?:\/\/(?!localhost)/.test(url) 
		&& url.indexOf("chrome/newtab") === -1;
	},

	is_chromeinstant_url: function(url) 
	{
		return typeof url === "string" && url.indexOf("sourceid=chrome-instant") !== -1;
	},

	getsg: function() 
	{
		return wot.SG[wot.platform];
	},

	is_sg_required: function() 
	{
		return wot.platform !== wot.PLATFORMS.CHROME &&
			wot.SG.hasOwnProperty(wot.platform);
	}
}});