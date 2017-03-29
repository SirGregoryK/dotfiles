/*
	background.js
	Copyright © 2009 - 2016 WOT Services Oy <info@mywot.com>

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

$.extend(wot, { core: {
	usermessage: {},
	usercontent: [],
	activity_score: 0,
	badge_status: null,
	first_run: false,       // sesion variable, to know if this launch is the first after installation
	launch_time: null,      // time when current session was started
    badge: {
        type: null,
        text: ""
    },
	last_testimony: null,   // datetime of the last testimony submitted

	tags: {
		is_wg_allowed: false,
		mytags: [ ],
		mytags_updated: null,       // time when the list was updated last time
		MYTAGS_UPD_INTERVAL: 30 * 60 * 1000,

		popular_tags: [ ],
		popular_tags_updated: null,
		POPULARTAGS_UPD_INTERVAL: 30 * 60 * 1000,

		append_mytags: function (mytags) {
			if (mytags instanceof Array && mytags.length) {

				var _this = wot.core.tags,
					mytags_flat = _this.mytags.map(function (item) { return item.value });

				var uniq = mytags.filter(function (tag) {
					var tag_value = tag.value.trim();
					return mytags_flat.indexOf(tag_value) < 0;
				});

				var uniq_tags = uniq.map(function (tag) {
					tag.mytag = true;
					return tag;
				});

				_this.mytags = _this.mytags.concat(uniq_tags);
			}
		},

		expire_mytags: function () {
			wot.core.tags.mytags_updated = null;    // next time when RW will be opened, it will fetch new mytags from server
		}
	},

	loadratings: function (f, tab_id, hosts, onupdate)
	{
		var dynamic_protect = wot.prefs.get("dynamic-protect-on");
		if(!dynamic_protect) {return;}
		if (typeof (hosts) == "string") {
			var target = wot.url.gethostname(hosts);
			if (target) {
				if(tab_id) {
					var current_tab = wot.hash_tabs[tab_id] ? wot.hash_tabs[tab_id] : {};
					var has_headers = wot.has_headers_flag(tab_id);
					if (f || has_headers) {

						var ref = wot.get_ref_header(tab_id);
						if (current_tab._isDuplicate || current_tab._isReopened) {
							ref = "";
							current_tab._isDuplicate = false;
							current_tab._isReopened = false;
						}
						
						var client_redirects = wot.get_credirect(tab_id);
						var cached_redirects = wot.get_cached_redirects(tab_id) || null;

						wot.api.query({
							host: target,
							subtrgt: wot.pi_filter.filter_all(hosts),
							subref: wot.pi_filter.filter_all(ref),
							sublast: wot.pi_filter.filter_all(wot.get_sublast(tab_id).url),
							subsfwrd: wot.pi_filter.filter_all_array(cached_redirects !== null ? cached_redirects.slice(0) : null),
							subcfwrd: wot.pi_filter.filter_all(client_redirects)
						}, onupdate, true);

						wot.delete_redirect_info(tab_id);
						wot.delete_hash_requests(tab_id);
						wot.delete_credirect(tab_id);
						wot.remove_sublast(tab_id);
						wot.remove_headers_flag(tab_id);
					}
					else {
						onupdate([target], true);
					}
				}
			}
		} else if (typeof (hosts) == "object" && hosts.length > 0) {
			return wot.api.link(hosts, onupdate);
		}

		(onupdate || function () {})([]);
		return false;
	},

	getratings_for_redirect: function (tab, redirection_hosts) {
		var is_cached = false;
		var all_urls = redirection_hosts.concat([tab.url]);	// last element of all_hosts - is the tab's url
		var all_hosts = [];
		for (var i in all_urls) {
			all_hosts[i] = wot.url.gethostname(all_urls[i]);
		}

		for (var i in all_hosts) {
			var obj = wot.cache.get(all_hosts[i]);
			if (!(obj && (obj.status == wot.cachestatus.ok ||
					((obj.status == wot.cachestatus.error ||
					    obj.status == wot.cachestatus.busy) &&
						(Date.now() - obj.updated) < wot.api.info.errortimeout)))) {
				is_cached = true;
				break;
			}
		}

		if (is_cached) {
			wot.api.query({ multi_targets: all_hosts }, null, false);
		} else {
			var low_ratings_url = wot.find_low_ratings_url(all_urls);
			wot.set_alt_url(tab.id, low_ratings_url);
			wot.core.updatetab(tab.id, true);
		}
	},

	update: function (update_rw)
	{

		try {
			chrome.windows.getAll({}, function(windows) {
				windows.forEach(function(view) {
					chrome.tabs.getSelected(view.id, function(tab) {
						wot.core.updatetab(tab.id, update_rw);
					});
				});
			});
		} catch (e) {
			console.log("core.update: failed with " + e);
		}
	},

	updatetab: function(id, update_rw)
	{

		chrome.tabs.get(id, function(tab) {
		    if (chrome.runtime.lastError) {
		        // console.log(chrome.runtime.lastError.message);
		        // tab has been closed before this callback had the chance to run
		        // this prevents pollution in the background's console
		    } else {
	            if (!tab) { return; }
	            var tab_url = wot.get_alt_url(tab.id) || tab.url;
				wot.log("core.updatetab: " + id + " = " + tab_url);

				if (wot.api.isregistered()) {

					wot.core.loadratings(false, tab.id, tab_url, function(hosts) {

						// hosts is the domain - in an array - it's the first element
						if(!hosts || hosts.length <= 0) {return;};

						wot.core.updatetabstate(tab, {
							target: hosts[0],
							decodedtarget: wot.url.decodehostname(hosts[0]),
							cached: wot.cache.get(hosts[0]) || { value: {} }
						}, update_rw);



					});

					wot.core.engage_me();
				} else {
					wot.core.updatetabstate(tab, { status: "notready" });
				}
			}
		});
	},

	geticon: function(data)
	{
		try {

			if (data.status == "notready") {
				return "loading";
			}

			var cached = data.cached || {};

			if (cached.status == wot.cachestatus.ok) {
				/* reputation */
				var def_comp = cached.value[wot.default_component];

				var result = wot.getlevel(wot.reputationlevels,
								(def_comp && def_comp.r != null) ?
									def_comp.r : -1).name;

				/* additional classes */
				if (result != "rx") {
					if (this.unseenmessage()) {
						result = "message_" + result;
					}
                    else if (result != "r0" &&
								!wot.components.some(function(item) {
									return (cached.value[item.name] &&
											cached.value[item.name].t >= 0);
								})) {
						result = "new_" + result;   // this adds yellow star on top of the donut
					}
				}

				return result;
			} else if (cached.status == wot.cachestatus.busy) {
				return "loading";
			} else if (cached.status == wot.cachestatus.error) {
				return "error";
			}

			return "default";
		} catch (e) {
			console.log("core.geticon: failed with " + e);
		}

		return "error";
	},

	seticon: function(tab, data)
	{
		try {
			var canvas = document.getElementById("wot-icon");
			var context = canvas.getContext("2d");
			var icon = new Image();

			icon.onload = function() {
				context.clearRect(0, 0, canvas.width, canvas.height);
				context.drawImage(icon, 0, 0, 19, 19);

				chrome.browserAction.setIcon({
					tabId: tab.id,
					imageData: context.getImageData(0, 0, canvas.width,
								canvas.height)
				});
			};

			icon.src = wot.geticon(this.geticon(data), 19, wot.prefs.get("accessible"));
		} catch (e) {
			console.log("core.seticon: failed with " + e + "\n");
		}
	},

    get_ratingwindow: function (callback) {
//        Enumerates "views" of current tab of current window and if WOT RatingWindow is found,
//        then call callback and pass selected tab and view found to it.
//        Callback should be as some_function (tab, view)
        chrome.tabs.query({
                active: true,           // lookup for active tabs
                currentWindow: true     // in active windows
            },
            function (tabs) {
                for (var i in tabs) {
                    var tab = tabs[i];  // now we have active tab to pass it to callback function
                    var views = chrome.extension.getViews({});

                    for (var ii in views) {
                        if (views[ii].wot && views[ii].wot.ratingwindow) {
                            callback(tab, views[ii]);
                        }
                    }
                }
            });
    },

    update_ratingwindow: function (tab0, data) {
        // Invokes update() of the Rating Window
        wot.core.get_ratingwindow(function (tab, view) {
            if (tab0.id == tab.id) {    // update RW only for the related tab
                view.wot.ratingwindow.update(tab, data);
            }
        });
    },

    update_ratingwindow_comment: function () {
        wot.core.get_ratingwindow(function (tab, view) {
            wot.log("update_ratingwindow_comment()", tab, view);
            var rw = view.wot.ratingwindow;

            var target = wot.url.gethostname(tab.url),
                cached = wot.cache.get(target);

            // get locally stored comment if exists
            var local_comment = wot.keeper.get_comment(target);
            rw.update_comment(cached, local_comment, wot.cache.captcha_required);
        });
    },

	updatetabstate: function(tab, data, update_rw)
	{
		try {

            if (!data.target) {
                wot.core.update_ratingwindow(tab, data);    // update RW with empty data
                return;
            }

            var cached = data.cached || {};

			if (tab.selected) {
				this.seticon(tab, data); /* update the browser action */

                var local_comment = wot.keeper.get_comment(data.target);

                // First priority: is user's input submitted successfully?
                if (local_comment && local_comment.comment && local_comment.status === wot.keeper.STATUSES.LOCAL) {
                    this.toggle_badge(tab.id, wot.badge_types.unsaved_comment);

                } else {

                    // Second: is the website rated by user?
                    if (!wot.is_rated(cached) && cached.status == wot.cachestatus.ok) {
                        // turned off intentionally on 25.06.2013 to deploy old style of notification about unrated
//                        this.toggle_badge(tab.id, wot.badge_types.unrated);
                    } else {
                        // Third: are categories selected for the website?
                        if (cached.status == wot.cachestatus.ok && cached.value &&
                            cached.value.cats && wot.utils.isEmptyObject(wot.select_voted(cached.value.cats))) {

                            // now check whether other conditions are met:
                            var lev = wot.reputationlevels.slice(-2, -1)[0].min;    // yellow/green border
                            wot.components.forEach(function(app) {
                                var app_id = app.name,
                                    t = cached.value[app_id] ? cached.value[app_id].t : -1,
                                    r = cached.value[app_id] ? cached.value[app_id].r : -1;

                                // 1. Is the testimony below green?
                                // 2. Is user's testimony opposite to current reputation?
                                if ((t >= 0 && t < lev) || (t >= lev && r >= 0 && r < lev)) {
                                    // Indicate that the user's input is incomplete
                                    wot.core.set_badge(tab.id, wot.badge_types.nocategories);
                                    return false;   // stop the loop and exit
                                }
                            });
                        } else {
                            this.set_badge(tab.id, wot.core.badge.type, wot.core.badge.text);
                        }
                    }
                }

                /* update the rating window */
                if (update_rw) {
					wot.core.update_ratingwindow(tab, data);
				}

            }

			/* update content scripts */
			var warning_type = this.updatetabwarning(tab, data);

			// show surveys only if there is no warning
			if (tab.selected &&
				warning_type && warning_type.type == wot.warningtypes.none) {

				if (wot.enable_surveys) {
					wot.surveys.update(tab, data);
				}
			}

		} catch (e) {
			console.error("core.updatetabstate: failed with ", e);
		}
	},

	updatetabwarning: function(tab, data)
	{
		var cached = data.cached, warned = null;

		var warning = {
			type: wot.warningtypes.none,
			reason: wot.warningreasons.none
		};

		try {

			/* Check if "warned" flag is expired */
			if(cached.flags && cached.flags.warned) {
				warned = cached.flags.warned;

				var ctime = (new Date()).getTime();
				if(cached.flags.warned_expire && (ctime > cached.flags.warned_expire)) {
					warned = false;
				}
			}


			if (cached.status != wot.cachestatus.ok || warned) {
				if (warned) warning.reason = wot.warningreasons.skipped;
				return warning; /* don't change the current status */
			}

			var prefs = [
				"accessible",
				"min_confidence_level",
				"warning_opacity",
                "update:state"
			];

			wot.components.forEach(function(item) {
				prefs.push("show_application_" + item.name);
				prefs.push("warning_level_" + item.name);
				prefs.push("warning_type_" + item.name);
				prefs.push("warning_unknown_" + item.name);
			});

			var settings = {};

			prefs.forEach(function(item) {
				settings[item] = wot.prefs.get(item);
			});

			var type = wot.getwarningtype(cached.value, settings);

			if (type && type.type >= wot.warningtypes.notification) {
				var port = chrome.tabs.connect(tab.id, { name: "warning" });
				if (port) {
					port.postMessage({
						message: "warning:inject",
						data: data,
						type: type,
						settings: settings,
						id: wot.core.get_random_id(data.target , tab.id)
					});
				}
			}

			return type;

		} catch (e) {
			wot.log("core.updatetabwarning: failed with ", e);
		}
	},

	get_random_id: function () {
		// generates random ID string. Used mainly for Warning screen

		var l = "abcdefghijklmnopqrstwxyz_-1234567890";

		var res = l[Math.ceil(Math.random() * 24)],
			len = 5 + Math.ceil(Math.random() * 8),
			set_len = l.length;    // first char must be letter or underscore

		for (var i = 0; i < len; i++) {
			res += l[Math.ceil(Math.random() * set_len - 1)];
		}

		// randomly uppercase chars
		for (var res2 = "", i = 0; i < res.length; i++) {
			if (Math.random() * 10 >= 5) {
				res2 += res[i].toUpperCase();
			} else {
				res2 += res[i];
			}
		}

		return res2;
	},

	show_warning: function (port) {
		var tab = port.port.sender.tab;
		var alt_url = wot.get_alt_url(tab.id);
		var host = wot.url.gethostname(alt_url || tab.url);
		var data = {
			target: host,
			decodedtarget: wot.url.decodehostname(host),
			cached: wot.cache.get(host) || { value: {} },
			is_alt_url: alt_url && alt_url != tab.url ? true : false
		};
		var cached = data.cached || {};

		var prefs = [
			"accessible",
			"min_confidence_level",
			"warning_opacity",
			"update:state"
		];

		wot.components.forEach(function(item) {
			prefs.push("show_application_" + item.name);
			prefs.push("warning_level_" + item.name);
			prefs.push("warning_type_" + item.name);
			prefs.push("warning_unknown_" + item.name);
		});

		var settings = {};

		prefs.forEach(function(item) {
			settings[item] = wot.prefs.get(item);
		});

		var type = wot.getwarningtype(cached.value, settings);

		var show_wtip = wot.wt.warning.tts();

		port.post("show", {
			data: data,
			type: type,
			settings: settings,
			show_wtip: show_wtip
		});
	},

	setusermessage: function(data)
	{
		try {

			var usermessage = {};

			var elems = data.getElementsByTagName("message");

			for (var i = 0; elems && i < elems.length; ++i) {
				var elem = $(elems[i]);

				var obj = {
					text: elem.text()
				};

				[ "id", "type", "url", "target", "version", "than" ]
					.forEach(function(name) {
						obj[name] = elem.attr(name);
					});

				if (obj.id && obj.type &&
						(obj.target == "all" || obj.target == wot.platform) &&
						(!obj.version || !obj.than ||
						 	(obj.version == "eq" && wot.version == obj.than) ||
							(obj.version == "le" && wot.version <= obj.than) ||
							(obj.version == "ge" && wot.version >= obj.than))) {
					usermessage = obj;
					break;
				}
			}

			if(this.usermessage && this.usermessage.system_type) {
				// don't change UserMessage if there is a system (addon's) one isn't shown yet. Keep it.
				this.usermessage.previous = usermessage;
			} else {
				this.usermessage = usermessage;
			}


		} catch (e) {
			console.log("core.setusermessage: failed with " + e);
		}
	},

	// not used
	createcustom_message: function(params) {
		var KEYSMAP = {
			TEXT: "text",
			POPUP_LOCATION: "loc",
			STYLES_FLOATING: "styles-floating",
			STYLES_FOOTER: "styles-footer",
			INNER_DIV: "innr-div"
		};

		var msg = "[{{cust-msg}}]";

		for (var i in KEYSMAP) {
			if (params.hasOwnProperty(KEYSMAP[i])) {
				msg += ";" + KEYSMAP[i] + ":" + encodeURIComponent(params[KEYSMAP[i]]);
			}
		}

		return msg;
	},

	// not used
	getcustom_message: function(msg) {
		// message example
		// "[{{cust-msg}}];text:the-message-itself;loc:floating/footer;styles-floating:styles-values;styles-footer:styles-values";
		var KEYSMAP = {
			TEXT: "text",
			POPUP_LOCATION: "loc",
			STYLES_FLOATING: "styles-floating",
			STYLES_FOOTER: "styles-footer",
			INNER_DIV: "innr-div"	// not implemented yet
		};
		var LOC_VALUES = ["both", "floating", "footer"];

		var isvalidkey = function(key) {
			for (var i in KEYSMAP) {
				if (KEYSMAP[i] === key) {
					return true;
				}
			}
			return false;
		};

		var isvalidloc = function(value) {
			for (var i in LOC_VALUES) {
				if (value === LOC_VALUES[i]) {
					return true;
				}
			}
			return false;
		};

		var isvalidmsg = function(split_msg) {
			if (split_msg.hasOwnProperty(KEYSMAP.POPUP_LOCATION) 
				&& isvalidloc(split_msg[KEYSMAP.POPUP_LOCATION])) {
				return true;
			}
		};

		var iscustom_message = function(msg) {
			return msg.match(/^(\[\{\{cust-msg\}\}\])/);
		};

		var decode_message = function(split_msg) {
			for (var i in split_msg) {
				split_msg[i] = decodeURIComponent(split_msg[i]);
			}
		};

		if (!iscustom_message(msg)) { return null; }
		msg = msg.split(";");
		var split_msg = {};
		for (var i = 1; i < msg.length; i++) {
			var key = msg[i].split(":")[0];
			var value = msg[i].split(":")[1];

			if (isvalidkey(key)) {
				split_msg[key] = value;
			}
		}

		if (!isvalidmsg(split_msg)) {
			return null;
		}
		decode_message(split_msg);

		return split_msg;
	},

	unseenmessage: function()
	{
		return (this.usermessage &&
					this.usermessage.text &&
					this.usermessage.id &&
					this.usermessage.id != wot.prefs.get("last_message") &&
					this.usermessage.id != "downtime");
	},

	setusercontent: function(data)
	{
		try {
			this.usercontent = [];

			var elems = data.getElementsByTagName("user");

			for (var i = 0; elems && i < elems.length &&
					this.usercontent.length < 4; ++i) {
				var elem = $(elems[i]);
				var obj = {};

				[ "icon", "bar", "length", "label", "url", "text", "notice" ]
					.forEach(function(name) {
						obj[name] = elem.attr(name);
					});

				if (obj.text && (!obj.bar ||
						(obj.length != null && obj.label))) {
					this.usercontent.push(obj);
				}
			}
			this.update_activity_score();

		} catch (e) {
			console.log("core.setusercontent: failed with " + e + "\n");
		}
	},

	update_activity_score: function ()
	{
		if (this.usercontent.length > 0) {
			var uc0 = this.usercontent[0];  // we assume that ActivityScore is delivered to the addon in the first item
			if (uc0 && uc0.label && uc0.label.length) {
				var a_score = 0;
				try {
					a_score = Number(uc0.label, 10);
				} catch (e) {
					// Label field doesn't contain a number, assume a_score = 0
				}

				if (this.activity_score != a_score) {
					// update local storage only when score has been changed
					wot.prefs.set("activity_score", a_score);
				}
				this.activity_score = a_score;
			}
		}
	},

	engage_me: function()
	{   // this is general entry point to "communication with user" activity. Function is called on every tab switch

        return; // this is so for the beta-version to rewrite utilization of badge feature

		var engage_settings = wot.engage_settings,
			core = wot.core;

		// Advertise Rating feature
		if(engage_settings.invite_to_rw.enabled) {

			// check if Rating Window was never opened
			var rw_shown = wot.prefs.get(engage_settings.invite_to_rw.pref_name);

			var lang = wot.i18n("locale");

			// Only for: Mail.ru & RW was never shown & lang is EN or RU
			if(rw_shown < 1 && wot.env.is_mailru && (lang === "ru" || lang === "en")) {

				// if time since firstrun more than predefined delay
				var timesince = wot.time_sincefirstrun();
				if(timesince >= engage_settings.invite_to_rw.delay) {

					var previous_message = core.usermessage;

					// set new message
					wot.core.usermessage = {
						text: wot.i18n("ratingwindow", "invite_rw"),
						id: "invite_rw",
						type: "important",
						url: "",
						target: "",
						version: "",
						than: "",
						previous: previous_message,
						system_type: "engage_rw"
					};

					// put a badge on the add-on's button
					if(!core.badge_status) {
						core.set_badge(null, wot.badge_types.notice);
					}

				}
			} else {
				//remember the fact to runtime variable to avoid checking that conditions every time
				wot.engage_settings.invite_to_rw.enabled = false;
			}
		}
	},

	setuser_paramenter: function(data, attr_name, param_name)
	{
		try {
			var elems = data.getElementsByTagName("status");

			if (elems && elems.length > 0) {
				wot.prefs.set(param_name, $(elems[0]).attr(attr_name) || "");
			} else {
				wot.prefs.clear(param_name);
			}
		} catch (e) {
			console.error("core.setuserlevel: failed with ", e);
		}
	},

    is_level: function (level) {
        try {
            var w_key = wot.prefs.get("witness_key"),
                user_level = wot.prefs.get("status_level");
            if (!user_level && level == null) return true;
            var h = wot.crypto.bintohex(wot.crypto.sha1.hmacsha1hex(w_key, "level="+level)); // encrypt the string by user's key
            return (user_level == h);

        } catch (e) {
             //console.error("wot.core.is_level failed " + e);
            return false;   // in case of errors it is safer to assume that user is not registered yet
        }
    },

	is_registered: function () {
		return wot.core.is_level("registered") || wot.core.is_level("registered_paid");
	},

	processrules: function(url, onmatch)
	{
		onmatch = onmatch || function() {};

		if (!wot.api.state || !wot.api.state.search) {
			return false;
		}

		var state = wot.prefs.get("search:state") || {};

		for (var i = 0; i < wot.api.state.search.length; ++i) {
			var rule = wot.api.state.search[i];

			if (state[rule.name]) {
				continue; /* disabled */
			}

			if (wot.matchruleurl(rule, url)) {
				onmatch(rule);
				return true;
			}
		}

		return false;
	},

	loadmanifest: function()
	{
		wot.bind("bind:manifest:ready", function() {
			if (wot.core.manifest) {
				wot.trigger("manifest:ready", [], true);
			}
		});

		var xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
				wot.core.manifest = JSON.parse(this.responseText) || {};
				wot.trigger("manifest:ready", [], true);
			}
		};

		xhr.open("GET", "manifest.json");
		xhr.send();
	},

	open_mywot: function(url, context)
	{
		var c_url = wot.contextedurl(url, context);
		chrome.tabs.create({ url: c_url });
	},

	open_scorecard: function(target, context, hash)
	{
		if(!target) return;
		hash = hash ? "#" + hash : "";
		var url = wot.contextedurl(wot.urls.geturl(wot.urls.scorecard) + encodeURIComponent(target), context) + hash;
		chrome.tabs.create({ url: url });
	},

	handlemenu: function(info, tab)
	{
		var hostname = "",
			re = /^.+\/{2}([\w.\-_+]+)(:\d+)?\/?.*$/;

		if(info.linkUrl) {
			var res = re.exec(info.linkUrl);
			hostname = res[1] || "";
		} else if (info.selectionText) {
			hostname = info.selectionText || "";
		} else {
			return;
		}

		wot.core.open_scorecard(hostname, "contextmenu");
	},

	createmenu: function()
	{
		chrome.contextMenus.removeAll();    // just in case to avoid doubling
		var menu_id = chrome.contextMenus.create({
			title: wot.i18n("contextmenu", "open_scorecard"),
			contexts: ["link", "selection"],
			onclick: wot.core.handlemenu
		});
	},

    toggle_badge: function (tab_id, type, text) {
        // Makes badge on the donut blink several times
        var counter = 5,
            delay = 220,
            on = true,
            ticker = null;

        ticker = window.setInterval(function(){
            if (counter > 0) {

                if (counter % 2 == 0) {
                    wot.core.set_badge(tab_id, null);
                } else {
                    wot.core.set_badge(tab_id, type, text);
                }

                counter -= 1;
            } else {
                if (ticker) {
                    window.clearInterval(ticker);
                }
            }
        }, delay);

    },

	set_badge: function (tab_id, type, text)
	{   /* sets the badge on the BrowserAction icon. If no params are provided, clear the badge */
		var type = type || false,
			text = text || "", color = "";

		if(type !== false) {
			type = type || wot.badge_types.notice;
			text = text || type.text;
			color = type.color || "#ffffff";

            var obj = {
                color: color
            };

            if (tab_id) {
                obj.tabId = tab_id;
            }

			chrome.browserAction.setBadgeBackgroundColor(obj);
			wot.core.badge_status = type;   // remember badge's status to prevent concurrent badges
		} else {
			wot.core.badge_status = null;
		}

		var obj = { text: text };
        if (tab_id) {
            obj.tabId = tab_id;
        }
        chrome.browserAction.setBadgeText(obj);
	},

	show_updatepage: function()
	{
		// show update page only if constant wot.firstrunupdate was increased
		var update = wot.prefs.get("firstrun:update") || 0;
        var open_update_page = true;

		if (update < wot.firstrunupdate) {
			wot.prefs.set("firstrun:update", wot.firstrunupdate);

            // Do some actions when the add-on is updated
            switch (wot.firstrunupdate) {
                case 2: // = 2 is a launch of WOT 2.0 in September 2013

                    // clear welcometips counters to show them again
                    var prefs_to_clear = [
                        "wt_donuts_shown", "wt_donuts_shown_dt", "wt_donuts_ok",
                        "wt_intro_0_shown", "wt_intro_0_shown_dt", "wt_intro_0_ok",
                        "wt_rw_shown", "wt_rw_shown_dt", "wt_rw_ok",
                        "wt_warning_shown", "wt_warning_shown_dt", "wt_warning_ok"
                    ];

                    for (var p in prefs_to_clear) {
                        wot.prefs.clear(prefs_to_clear[p]);
                    }

                    // set badge "NEW"
                    wot.core.badge.text = "new";
                    wot.core.badge.type = wot.badge_types.notice;

                    if (wot.env.is_mailru) {
                        open_update_page = false;   // Don't open UpdatePage for Mail.ru users
                    }

                    break;
            }

			if (open_update_page) {
                chrome.tabs.create({
                    url: wot.urls.update + "/" + wot.i18n("lang") + "/" +
                        wot.platform + "/" + wot.version
                });
            }
		}
	},

	increase_ws_shown: function () {
		try {
			var pref_name = "warnings_shown";
			var count = wot.prefs.get(pref_name) || 0;
			wot.prefs.set(pref_name, count + 1);
		} catch (e) {
			console.log("wot.core.increase_ws_shown() failed with ", e);
		}
	},

	get_ws_shown: function () {
		try {
			var pref_name = "warnings_shown";
			var count = wot.prefs.get(pref_name) || 0;
			return count;
		} catch (e) {
			console.log("wot.core.increase_ws_shown() failed with ", e);
		}
	},

	welcome_user: function()
	{
		// this function runs only once per add-on's launch
		var time_sincefirstrun = 1;
		// check if add-on runs not for a first time
		if (!wot.prefs.get("firstrun:welcome")) {
			wot.core.first_run = true;
			wot.prefs.set("firstrun:update", wot.firstrunupdate);
			wot.prefs.set("firstrun:time", new Date()); // remember first time when addon was run

			// now we have only mail.ru case which requires to postpone opening welcome page
			var postpone_welcome = wot.env.is_mailru;

			if(postpone_welcome) {
				// experiment: don't show welcome page at all
//				wot.core.set_badge(wot.badge_types.notice); // set icon's badge to "notice"
			} else {
				/* use the welcome page to set the cookies on the first run */
				var open_in_bg = !wot.env.is_yandex;    // for Yandex browser open the WP in background
				chrome.tabs.create({ url: wot.urls.welcome, active: open_in_bg });
			}
			wot.prefs.set("firstrun:welcome", true);

			window.setTimeout(function () {
				// report "installating" event
				wot.ga.fire_event(wot.ga.categories.GEN, wot.ga.actions.GEN_INSTALLED, String(wot.partner));
			}, 2000);

		} else {
			wot.core.show_updatepage();
			wot.api.setcookies();

			time_sincefirstrun = wot.time_sincefirstrun();

			// if we didn't save firsttime before we should do it now
			if (!time_sincefirstrun) {
				time_sincefirstrun = new Date();
				wot.prefs.set("firstrun:time", time_sincefirstrun);
			}
		}

		// adapt min_confidence_level: 12 for newcomers, 8 - for users who use the addon more than 2 weeks
		// but for Amigo mail.ru users it is always a bit higher: 12
		var min_level;
		if (wot.is_mailru_amigo) {
			min_level = 12;
		} else {
			min_level = time_sincefirstrun >= 3600 * 24 * 14 ? 8 : 12;
		}

		wot.prefs.set("min_confidence_level", min_level);

		// This GA reporting is disabled due to exceeding limits (10M/day)
//		try {
//			// Use timeout before reporting launch event to GA, to give GA a chance to be inited
//			window.setTimeout(function () {
//				// report how long in days this add-on is staying installed
//				var time_sincefirstrun = wot.time_sincefirstrun();
//				wot.ga.fire_event(wot.ga.categories.GEN, wot.ga.actions.GEN_LAUNCHED,
//					String(Math.floor(time_sincefirstrun / wot.DT.DAY)));
//
//			}, 5000);
//		} catch (e) {
//			// do nothing here
//		}
	},

    fetch: function(tab) {
       	var port = chrome.tabs.connect(tab.id, { name: "warning" });
		port.postMessage({
			message: "loc:check"
		});
	},

	activated_callback: function(info) {
		var tabId = info.tabId;
		wot.core.updatetab(tabId, true);
		if (!wot.is_sublast_fetching(tabId)) { 
			chrome.tabs.get(tabId, function(tab) {
			    if (chrome.runtime.lastError) {} 
			        // console.log(chrome.runtime.lastError.message);
			        // tab has been closed before this callback had the chance to run
			        // this prevents pollution in the background's console			    	
			    else {
			    	if (!wot.rt_api.is_chromeinstant_url(tab.url) 
			    		&& !wot.is_new_window_tab_created(tab.id)) {
			    		wot.rt_api.set_rt_sublast(tab.url);
			    	}
			    }
			});
		}
	},

	crowningCache: null,

	currentMasterId: null,

	onload: function()
	{
		try {
			/* load the manifest for reference */

			this.loadmanifest();
			wot.core.launch_time = new Date();
            wot.cache_locale();
			wot.detect_environment();
			var first_run = !wot.prefs.get("witness_key");
			var abtest_enables = !!wot.prefs.get("abtest:enabled");
			var abtest_settings_set = wot.prefs.get("abtest:settings_set"); // to set the settings according to the AB only once, otherwise we might override the user's manual settings
			if(first_run || abtest_enables) { // Mark this user valid for A/B testing. It's not a veteran user.
				abtest_enables = true;
				wot.prefs.set("abtest:enabled", abtest_enables); // Adding the version number, as new version will take
			}
			wot.exp.init(abtest_enables);
			if(!abtest_settings_set) {
				wot.prefs.set("abtest:settings_set", true); // To set this only once, so we'll allow the user to set his own settings manually
				if (wot.exp.is_running("ab-control_ts1")) {
				}
				else if (wot.exp.is_running("ab-lite_donuts_ts1")) {

					//Light Donuts
					wot.prefs.set("search_level", 60);
					wot.prefs.set("use_search_level", true);
					wot.prefs.set("settingsui_searchlevel", "bad");
				}
				else if (wot.exp.is_running("ab-no_wt_donuts_ts1")) {

					// No welcome tip when hovering the donuts on SERP
					wot.wt.settings.warning_disabled = 1;
				}
				else if (wot.exp.is_running("ab-lite_ws_ts1")) {

					//Light Warnings
					wot.prefs.set("min_confidence_level", 12);
					wot.prefs.set("warning_type_0", 1);
					wot.prefs.set("settingsui_warnlevel", "light");
				}
				else if (wot.exp.is_running("ab-all_changes_ts1")) {

					//Light Donuts
					wot.prefs.set("search_level", 60);
					wot.prefs.set("use_search_level", true);
					wot.prefs.set("settingsui_searchlevel", "bad");

					//Light Warnings
					wot.prefs.set("min_confidence_level", 12);
					wot.prefs.set("warning_type_0", 1);
					wot.prefs.set("settingsui_warnlevel", "light");
				}
			}

			/* messages */
			wot.bind("message:search:master", function(port, data) {
				var tabId = data.tabId || wot.core.get_random_id();
				var master = false;
				this.crowningCache = this.crowningCache || {};
				if(data.url && data.url.indexOf("http") == 0) {
					if (data.tabId == this.currentMasterId) {
						// The master verifies he is still the master
						master = true;
						this.crowningCache[this.currentMasterId] = new Date().getTime();
					}
					else if (!this.currentMasterId || (new Date().getTime() - this.crowningCache[this.currentMasterId] > 5000)) {
						// There is a new master in town
						master = true;
						this.currentMasterId = data.tabId;
						this.crowningCache[this.currentMasterId] = new Date().getTime();
					}
				}

				port.post("crowning", {
					master:master,
					tabId:tabId,
					info:{
						ins_ts:Math.floor(wot.time_sincefirstrun()),
						ws_shown:wot.core.get_ws_shown(),
						rw_shown:wot.prefs.get(wot.engage_settings.invite_to_rw.pref_name) || 0,
						wt_intro_0_shown:wot.wt.settings.intro_0_shown,
						abtest:wot.exp.exps_running_ga(),
						ver:wot.core.manifest.version
					}
				});
			});

			wot.bind("message:search:hello", function(port, data) {
				wot.core.processrules(data.url, function(rule) {
					port.post("process", {
						url: data.url,
						rule: rule
					});
				});
			});

			wot.bind("message:search:check", function(port, data) {

			});

			wot.bind("message:search:change", function(port, data) {
				wot.core.loadratings(true, port.port.sender.tab.id, data.targets, function(hosts) {

					var ratings = {};
					hosts.forEach(function(target) {
						var obj = wot.cache.get(target) || {};

						if (obj.status == wot.cachestatus.ok ||
							obj.status == wot.cachestatus.link) {
							obj.value.decodedtarget = wot.url.decodehostname(obj.value.target);
							ratings[target] = obj.value;
						}
					});

					var wt_enable_donut_tip = false;
					if (wot.wt && wot.wt.enabled) {
						wt_enable_donut_tip = wot.wt.donuts.tts();
					}

					port.post("update",
						{
							rule: data.rule,
							ratings: ratings,
							wt_enabled: wt_enable_donut_tip
						});
				});
			});

			wot.bind("message:search:get", function(port, data) {

				wot.core.loadratings(false, port.port.sender.tab.id, data.targets, function(hosts) {

					var ratings = {};
					hosts.forEach(function(target) {
						var obj = wot.cache.get(target) || {};

						if (obj.status == wot.cachestatus.ok ||
							obj.status == wot.cachestatus.link) {
                            obj.value.decodedtarget = wot.url.decodehostname(obj.value.target);
							ratings[target] = obj.value;
						}
					});

					var wt_enable_donut_tip = false;
					if (wot.wt && wot.wt.enabled) {
						wt_enable_donut_tip = wot.wt.donuts.tts();
					}

					port.post("update",
						{
							rule: data.rule,
							ratings: ratings,
							wt_enabled: wt_enable_donut_tip
						});
				});
			});

			wot.bind("message:tab:close", function(port, data) {
				// close the tab that sent this message
				chrome.tabs.remove(port.port.sender.tab.id);
			});

			/* counting events by GA.
			 * Important: message name we listen for here has to be different than we send from this page
			  * (warnings vs warning) to avoid dead messaging from content script */
			wot.bind("message:warnings:leave_button", function(port, data) {
				wot.ga.fire_event(wot.ga.categories.WS, wot.ga.actions.WS_BTN_CLOSE, data.label);
			});

			wot.bind("message:warnings:enter_button", function(port, data) {

				wot.cache.setflags(data.target, { warned: true, warned_expire: null });

				var port = chrome.tabs.connect(port.port.sender.tab.id, { name: "warning" });
				port.postMessage({ message: "warning:remove" });

				wot.ga.fire_event(wot.ga.categories.WS, wot.ga.actions.WS_BTN_ENTER, data.target);
				wot.core.update(false);
			});

			wot.bind("message:warnings:shown", function(port, data) {
				wot.core.increase_ws_shown();
				wot.ga.fire_event(wot.ga.categories.WS, wot.ga.actions.WS_SHOW, data.target);
			});

			wot.bind("message:warnings:ready", function(port, data) {
				wot.core.show_warning(port);
			});

			wot.bind("message:search:popup_shown", function(port, data) {
				var cached = wot.cache.get(data.target),
					action = wot.ga.actions.D_POPUP_TARGET_R0;

				if (cached && cached.value && cached.value[0]) {
					var _map = {
							"r0": wot.ga.actions.D_POPUP_TARGET_R0,
							"r1": wot.ga.actions.D_POPUP_TARGET_R1R2,
							"r2": wot.ga.actions.D_POPUP_TARGET_R1R2,
							"r3": wot.ga.actions.D_POPUP_TARGET_R3,
							"r4": wot.ga.actions.D_POPUP_TARGET_R4,
							"r5": wot.ga.actions.D_POPUP_TARGET_R5
						},
						action = _map[wot.getlevel(wot.reputationlevels, cached.value[0].r).name]; // redefine the action
				}
				wot.ga.fire_event(wot.ga.categories.INJ, action, data.norm_target);
				wot.ga.fire_event(wot.ga.categories.INJ, wot.ga.actions.D_POPUP_SHOWN, data.label);
			});

			wot.bind("message:search:openscorecard", function(port, data) {
				wot.ga.fire_event(wot.ga.categories.WS, wot.ga.actions.WS_VIEW_DETAILS);
				wot.core.open_scorecard(data.target, data.ctx);
			});

			wot.bind("message:search:ratesite", function(port, data) {
				wot.ga.fire_event(wot.ga.categories.WS, wot.ga.actions.WS_RATE_IT);
				wot.core.open_scorecard(data.target, data.ctx, "rate");
			});

			wot.bind("message:my:update", function(port, data) {
				port.post("setcookies", {
					cookies: wot.api.processcookies(data.cookies) || []
				});
            });

			wot.bind("message:tags:clearmytags", function(port, data) {
				wot.core.tags.expire_mytags();
            });

			if (wot.surveys && wot.surveys.bind_events) {
				wot.surveys.bind_events();
			}

			if (wot.wt && wot.wt.bind_events) {
				wot.wt.bind_events();
			}

			wot.listen([ "search", "my", "tab", "warnings", "tags", "wtb", "surveyswidget" ]);

			/* event handlers */

			/* runtime Events */
			chrome.runtime.setUninstallURL(wot.UNINSTALL_URL, function() {
		        if (chrome.runtime.lastError) {}
			});


			/*  webNavigation Events*/
			chrome.webNavigation.onCommitted.addListener(function (details) {
				try {
					if (details == undefined || details.frameId != 0) { return; }
					var tabId = details.tabId;
					if (tabId >= 0) {
						var oTabInfo = wot.hash_tabs[tabId];
						// if "oTabInfo" exists - create a "navigation_info" object for it
						if (oTabInfo) {
							var oNavInfo = new wot.navigation_info(details);
							oTabInfo._arrCommittedNavigations.push(oNavInfo)
						}
			            if (details.transitionQualifiers.indexOf("client_redirect") > -1) { 
			                if (wot.rt_api.isvalidurl(details.url)) {
			                    wot.add_credirect(tabId, details.url);
			                }
			            }
					}
				} catch (e) {
					wot.log("Exception in webNavigation.onCommitted handler: ", e)
				}
			});

			chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
				if (details == undefined || details.frameId != 0) { return; }
				wot.remove_alt_url(details.tabId);
				// wot.delete_redirect_info(details.tabId);
			});


			/* event handlers */
			
			//TODO: check loggering data: is it necessary?

			if (typeof chrome.webRequest == "undefined") {
				console.log("events.permission missing: webRequest");
			}
			else {
				var filter = {
					types: ["main_frame"],
					urls: ["<all_urls>"]
				};
				// var extraInfoSpec = ["requestHeaders"];	// not used
				
				chrome.webRequest.onBeforeRequest.addListener(function(details) {
				    try {

						var tabId = details.tabId;
						var isNewTab = details.url.search("chrome/newtab");// skip cache of chrome empty tab
						if (tabId >= 0 && !isNewTab) {
							// adds a new "redirects_info" object to the "cache_redirects" object in "wot.js" if one doesn't already exist
							var oRequestInfo = null;
							oRequestInfo = wot.get_redirect_info(tabId);
							if (oRequestInfo == null) {
								oRequestInfo = wot.add_redirect_info(tabId);
							}
						}

						// always returns the object, second comparer is never assigned ?
						wot.hash_requests[details.requestId] = new wot.request_info(details.url, details.timeStamp) || wot.hash_requests[details.requestId];

						// creates a hash tab if one doesn't exist
						var oTabInfo = wot.hash_tabs[tabId];
						if (oTabInfo == undefined) {
							oTabInfo = new wot.tab_info(null, false);
							wot.hash_tabs[tabId] = oTabInfo;
						}
						wot.hash_tabs[tabId].url = details.url;
						// adds a requst id to "oTabInfo._arrRequestsIds" if one doesn't exist
						var index = oTabInfo._arrRequestsIds.indexOf(details.requestId);
						if (index == -1) {
							oTabInfo._arrRequestsIds.push(details.requestId);
						}
					} catch (e) {
						wot.log("requestId already exists in array: tabId = " + tabId + ", requestId = " + details.requestId + ", index = " + "index");
					}
				}, filter);

				chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
					var tabId = details.tabId;
					if(!details.requestHeaders.some(function (hs) {
							return /^Referer$/.test(hs.name) && wot.set_headers_flag(tabId, hs.value);
						})){
						wot.set_headers_flag(tabId, '');
					}
					chrome.tabs.get(tabId, function(tab) {
						if (chrome.runtime.lastError) {} else {
							var host = wot.url.gethostname(tab.url);
							if(host) {
								wot.core.updatetabstate(tab, {
									target: host,
									decodedtarget: wot.url.decodehostname(host),
									cached: wot.cache.get(host) || {value: {}}
								}, true);
							}
						}
					});

					return {requestHeaders: details.requestHeaders};
				}, filter, ["requestHeaders"]);				

				chrome.webRequest.onHeadersReceived.addListener(function(details) {
					try {
						var tabId = details.tabId;
						if(!details.requestHeaders.some(function (hs) {
								return /^Referer$/.test(hs.name) && wot.set_headers_flag(tabId, hs.value);
							})){
							wot.set_headers_flag(tabId, '');
						}
						var isNewTab = details.url.search("chrome/newtab");// skip cache of chrome empty tab
						if (details.statusCode >= 300 && details.statusCode < 400) {} // redirection
						if (tabId >= 0 && !isNewTab) {
							var oRequestInfo = null;
							oRequestInfo = wot.get_redirect_info(tabId);
							// adds a "requestInfo" object if one doesn't exist in "wot.cache_redirect"
							if (oRequestInfo == null) {
								oRequestInfo = wot.add_redirect_info(tabId);
							}
						}
					} catch (e) {
						wot.log("Exception in webRequest.onHeadersReceived handler: ", e);
					}
				}, filter, ["blocking"]);

				// "onBeforeRedirect" informational event
				chrome.webRequest.onBeforeRedirect.addListener(function(details) {
				    try {
						var url = details.url;
						var tabId = details.tabId;
						var oRequestInfo = null;
						oRequestInfo = wot.get_redirect_info(tabId);
						if (oRequestInfo == null) {
						    oRequestInfo = wot.add_redirect_info(tabId)
						}
						oRequestInfo.add_url_to_cache(url);
					} catch (e) {
						wot.log("Exception in webRequest.onBeforeRedirect handler: ", e)
					}
				}, filter);

				chrome.webRequest.onCompleted.addListener(function(details) {
					try {
						var url = details.url;
						var tabId = details.tabId;
						var oRequestInfo = wot.get_redirect_info(tabId);
						if (oRequestInfo) {
							oRequestInfo._completed_url = url;
						}
					} catch (e) {
						wot.log("Exception in webRequest.onCompleted handler: ", e)
					}
				}, filter);
				
				chrome.webRequest.onErrorOccurred.addListener(function(details) {
					try {
						wot.delete_redirect_info(details.tabId);
						wot.remove_headers_flag(details.tabId);
						wot.remove_sublast(details.tabId);
					} catch (e) {
						wot.log("Exception in webRequest.onErrorOccurred handler: ", e)
					}
				}, filter);
			}

			chrome.tabs.onCreated.addListener(function(tab) {
				wot.add_created_tab_ts(tab.id);
				var oTabInfo = new wot.tab_info(tab, true);
				wot.hash_tabs[tab.id] = oTabInfo;
				var oOpenerTabInfo = wot.hash_tabs[tab.openerTabId];
				if (oOpenerTabInfo && oOpenerTabInfo._tab && tab.url === oOpenerTabInfo._tab.url) {
					oTabInfo._isDuplicate = true;
				} else {
					// sometimes throws an error - need to fix
					// 		VM3247 extensions::lastError:133 Unchecked runtime.lastError while running tabs.query: Invalid url pattern 'view-source
				  	chrome.tabs.query({url: tab.url}, function(tabs) {
						if(tabs && tabs.length > 1) {
							oTabInfo._isDuplicate = true;
						}
				  	});
				}

				if (tab.status === "complete" && !tab.openerTabId) { 
				    oTabInfo._isReopened = true;
				}
			});

			chrome.tabs.onUpdated.addListener(function(id, changeInfo, tab) {
				var sublast = wot.rt_api.get_rt_sublast();

				if (changeInfo.status === "loading" 
					&& !wot.is_sublast_fetching(id) 
					&& wot.rt_api.isvalidurl(tab.url) 
					&& (wot.has_headers_flag(id) || sublast != tab.url)) {
					wot.add_sublast(id, true, wot.rt_api.get_rt_sublast());
				}
				var is_redirection_warning_on = wot.prefs.get("redirection_warning");
				var oRequestInfo = wot.get_redirect_info(id);
				if (is_redirection_warning_on) {
					wot.core.getratings_for_redirect(tab, oRequestInfo._arr_server_redirect_urls);
				}
				if (changeInfo.status == 'complete') {
			      	if (wot.rt_api.isvalidurl(tab.url) && (wot.has_headers_flag(id) || sublast != tab.url) ) {
			      		wot.rt_api.set_rt_sublast(tab.url);
						wot.core.fetch(tab);
						wot.core.updatetab(id, true);
					}
				}
			});

			chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
			    chrome.tabs.get(addedTabId, function(tab) {
			        if (chrome.runtime.lastError) {} else {
			            if (!wot.rt_api.is_chromeinstant_url(tab.url)) {
			            	wot.add_sublast(addedTabId, true, wot.rt_api.get_rt_sublast());
			            	wot.rt_api.set_rt_sublast(tab.url);
			                wot.core.fetch(tab);
			            }
			        }
			    });
			});

			chrome.windows.onFocusChanged.addListener(function(windowId) { 
				if (windowId > 0) {
					chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) { 
						if (tabs.length === 1 && !wot.is_new_window_tab_created(tabs[0].id)) {
							wot.rt_api.set_rt_sublast(tabs[0].url);
						}
					});
				}
			})			

			chrome.tabs.onActivated.addListener(function(info) {
				wot.core.activated_callback(info);
			});

			// onSelectionChanged deprecated since Chrome 33
			chrome.tabs.onSelectionChanged || chrome.tabs.onSelectionChanged.addListener(function (id, selectInfo) {
				wot.core.activated_callback(selectInfo);
			});

			chrome.tabs.onRemoved.addListener(function(id, removeInfo) {
				delete wot.hash_tabs[id];
				wot.remove_created_tab_ts(id);
				wot.remove_alt_url(id);
			});

			wot.core.createmenu();

			if (wot.debug) {
				wot.prefs.clear("update:state");

				wot.bind("cache:set", function(name, value) {
					console.log("cache.set: " + name, {name: name, value: value});
				});

				wot.bind("prefs:set", function(name, value) {
					console.log("prefs.set: " + name,{name: name, value: value});
				});
			}

			/* initialize */

			wot.api.init();

				wot.api.register(function() {
					wot.core.update(true);

					if (wot.api.isregistered()) {
						wot.core.welcome_user();
						wot.api.update();
						wot.api.processpending();       // submit
						wot.api.comments.processpending();
						wot.wt.init();                  // initialize welcome tips engine
						wot.surveys.init();             // init surveys engine
					}
				});


			wot.rt_api.init();
			
			chrome.tabs.query({ active : true, currentWindow: true }, function(tabs) {
				if (tabs.length === 1) {
					if (wot.rt_api.isvalidurl(tabs[0].url)) {
						wot.rt_api.set_rt_sublast(tabs[0].url);
					}
				}
			});

			wot.ga.post_init(); // finilize setting up GA engine
			wot.cache.purge();

		} catch (e) {
			console.log("core.onload: failed with ", e);
		}
	}

}});

wot.core.onload();