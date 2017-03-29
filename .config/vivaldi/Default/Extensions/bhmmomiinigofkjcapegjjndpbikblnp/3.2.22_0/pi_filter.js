/*
	pi_filter.js
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

$.extend(wot, { pi_filter: {
	email_template:"__e-m-a-i-l__",
	login_template:"__n-a-m-e__",
	password_template:"__p-a-s-s__",
	address_template:"__a-d-d-r-e-s-s__",
	cardnum_template:"__c-a-r-d__",
	phone_template:"__p-h-o-n-e__",
	location_template:"__l-o-c-a-t-i-o-n__",
	postcode_template:"__p-o-s-t-c-o-d-e__",
	gender_template:"__g-e-n-d-e-r__",
	emailregex: /(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})/i,

	//maybe should remove date of birth too?

	parse_url_params:function(params_string) {
		var result = {};
		if (params_string.substring(0, 1) == "?"){
			params_string = params_string.substring(1);
		}
		params_string.split("&").forEach(function(part) {
			var item = part.split("=");
			result[item[0]] = decodeURIComponent(item[1]);
		});
		return result;
	},

	replace_param: function(parsed_params, param_name, new_value){
		if (param_name in parsed_params) {
			parsed_params[param_name] = new_value;
		}
		return parsed_params;
	},

	filter_email: function(parsed_params){
		parsed_params = this.replace_param(parsed_params, "email", this.email_template);
		parsed_params = this.replace_param(parsed_params, "e-mail", this.email_template);

		for (var key in parsed_params) {
			if (this.emailregex.test(parsed_params[key])) {
				parsed_params[key] = this.email_template;
			}
		}

		return parsed_params;
	},

	filter_name:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "nickname", this.login_template);
		parsed_params = this.replace_param(parsed_params, "firstname", this.login_template);
		parsed_params = this.replace_param(parsed_params, "lastname", this.login_template);
		parsed_params = this.replace_param(parsed_params, "surname", this.login_template);
		parsed_params = this.replace_param(parsed_params, "username", this.login_template);

		return parsed_params;
	},

	filter_password:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "password", this.password_template);
		parsed_params = this.replace_param(parsed_params, "pass", this.password_template);

		return parsed_params;
	},

	filter_card:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "credit", this.cardnum_template);
		parsed_params = this.replace_param(parsed_params, "creditcard", this.cardnum_template);

		return parsed_params;
	},

	filter_phone:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "phone", this.phone_template);
		parsed_params = this.replace_param(parsed_params, "telephone", this.phone_template);

		return parsed_params;
	},

	filter_location:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "location", this.location_template);

		return parsed_params;
	},

	filter_gender:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "gender", this.gender_template);
		parsed_params = this.replace_param(parsed_params, "sex", this.gender_template);
		parsed_params = this.replace_param(parsed_params, "male", this.gender_template);
		parsed_params = this.replace_param(parsed_params, "female", this.gender_template);

		return parsed_params;
	},

	filter_address:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "address", this.address_template);

		return parsed_params;
	},

	filter_postcode:function (parsed_params){
		parsed_params = this.replace_param(parsed_params, "postcode", this.postcode_template);

		return parsed_params;
	},

	filter_component:function(component){
		var decoded_component = decodeURIComponent(component);
		var parsed_params = this.parse_url_params(decoded_component);

		parsed_params = this.filter_email(parsed_params);
		parsed_params = this.filter_name(parsed_params);
		parsed_params = this.filter_password(parsed_params);
		parsed_params = this.filter_card(parsed_params);
		parsed_params = this.filter_phone(parsed_params);
		parsed_params = this.filter_location(parsed_params);
		parsed_params = this.filter_gender(parsed_params);
		parsed_params = this.filter_address(parsed_params);
		parsed_params = this.filter_postcode(parsed_params);

		return parsed_params;

	},

	verify_is_string: function(str) {
		return !!(str && (typeof str === "string" || str instanceof String));
	},

	filter_all:function(url) {
		if (!url || !this.verify_is_string(url)) {
			return null;
		}
		var parser = document.createElement('a');
		parser.href = url;

		//remove user and password from url
		if (parser.username != null && parser.username.length){
			parser.username = this.login_template;
		}

		if (parser.password != null && parser.password.length){
			parser.password = this.password_template;
		}

		//remove pi from search params
		if (parser.search.length > 0) {
			try {
				var parsed_params = this.filter_component(parser.search);

				//re-create the clean parameters search query
				var clean_search = "?";
				for (var key in parsed_params) {
					if (clean_search.length > 1)
						clean_search += "&";
					clean_search += key + "=" + parsed_params[key];
				}
				parser.search = clean_search;
			}
			catch (e){}
		}

		return parser.href;
	},

	filter_all_array: function(url_array) {
		var filtered_url_array = [];

		if (!(url_array instanceof Array)) { 
			return null; 
		}

		for (var url of url_array) {
			var filtered_url = this.filter_all(url);
			filtered_url_array.push(filtered_url);
		}

		return filtered_url_array;
	}
}});