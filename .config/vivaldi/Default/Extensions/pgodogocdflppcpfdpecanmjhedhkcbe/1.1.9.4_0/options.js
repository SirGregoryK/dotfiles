(function() {
'use strict';

var worker = window;

var doc = document;

var $id = function(id) {
	return doc.getElementById(id);
};

var $C = function(classname) {
	return doc.getElementsByClassName(classname);
};

var $q = function(selector) {
	return doc.querySelector(selector);
};

var setTextareaResize = function(id, inner_func) {
	var ta = $id(id);
	ta.onchange =
	ta.oncut =
	ta.onfocus =
	ta.oninput =
	ta.onpaste = function() {
		var rows = this.value.match(/\n/g);
		if (rows) {
			this.setAttribute('rows', rows.length + 1);
		}
		if (inner_func) { inner_func(); }
	};
};

var storage = {
	_get_key: function(key) {
		return 'eGUI_' + god_name + ':' + key;
	},
	set: function(id, value) {
		localStorage.setItem(this._get_key(id), value);
		return value;
	},
	get: function(id) {
		var val = localStorage.getItem(this._get_key(id));
		if (val === 'true') { return true; }
		else if (val === 'false') { return false; }
		else { return val; }
	},
	remove: function(id) {
		localStorage.removeItem(this._get_key(id));
	},
	importSettings: function(options_string,global_import) {
		if (global_import && !worker.confirm(worker.GUIp_i18n.import_all_warning)) {
			return;
		}
		try {
			var pf = false, options = JSON.parse(options_string);
			for (var key in options) {
				if (key.match(/^eGUI_/)) {
					pf = true;
					break;
				}
			}
			if (global_import && pf) {
				for (var key in options) {
					localStorage.setItem(key, options[key]);
				}
			} else if (!global_import && !pf) {
				for (var key in options) {
					this.set(key, options[key]);
				}
			} else {
				throw('');
			}
			worker.alert(worker.GUIp_i18n.import_success);
			location.reload();
		} catch(e) {
			worker.alert(worker.GUIp_i18n.import_fail);
		}
	},
	exportSettings: function(global_export) {
		if (global_export && !worker.confirm(worker.GUIp_i18n.export_all_warning)) {
			return '';
		}
		var options = {};
		for (var key in localStorage) {
			if (key.match(/useBackground|informerCustomSound/) && localStorage.getItem(key).length > 1000) {
				continue;
			}
			if ((global_export || key.match(this._get_key(''))) && !key.match(/^(fr_h|fr_arr|d_i|p__upd|p__grp)/) && !key.match(/Log(ger|DB)?:|LEMRestrictions:|DailyForecast|WantedMonster/)) { 
				options[!global_export ? key.replace(this._get_key(''), '') : key] = localStorage.getItem(key);
			}
		}
		return JSON.stringify(options);
	}
};

function addMenu() {
	if (!god_name) { return; }
	if (!$id('ui_settings')) {
		var newNode;
		newNode = doc.createTextNode(' | ');
		$q('#profile_main p').appendChild(newNode);
		newNode = doc.createElement('a');
		newNode.id = 'ui_settings';
		newNode.href = '#ui_settings';
		newNode.textContent = worker.GUIp_i18n.ui_settings;
		$q('#profile_main p').appendChild(newNode);
		$id('ui_settings').onclick = function() { loadOptions(); improve_blocks(); };
	}
}

var setAllCheckboxesToState = function(classname, state) {
	var checkboxes = $C(classname);
	for (var i = 0, len = checkboxes.length; i < len; i++) {
		checkboxes[i].checked = state;
	}
};

var setAllCheckboxesDisabled = function(classname, state) {
	var checkboxes = $C(classname);
	for (var i = 0, len = checkboxes.length; i < len; i++) {
		checkboxes[i].disabled = state;
	}
};

var modifyTextsForHeroines = function(selector) {
	var content = doc.querySelectorAll(selector);
	for (var i = 0, len = content.length; i < len; i++) {
		// max depth assumed to be just 1, so no need for recursions
		if (content[i].children.length === 0) {
			content[i].textContent = content[i].textContent.replace('героя','героини').replace('герою','героине');
			continue;
		}
		// make same replacements in child label elements if applicable
		var labels = content[i].getElementsByTagName('label');
		for (var j = 0, len2 = labels.length; j < len2; j++) {
			if (labels[j].children.length === 0) {
				labels[j].textContent = labels[j].textContent.replace('героя','героини').replace('герою','героине');
			}
		}
	}
};

var getOptionName = function(id) {
	var parts = id.split('_');
	for (var k = 1; k < parts.length; k++) {
		parts[k] = parts[k][0].toUpperCase() + parts[k].slice(1);
	}
	return parts.join('');
};

var restoreOptionValues = function() {
	var checkboxes = document.querySelectorAll('.option-checkbox, .menu-checkbox');
	for (var optval, i = 0, len = checkboxes.length; i < len; i++) {
		if (!checkboxes[i].id) {
			continue;
		}
		if (optval = storage.get('Option:' + getOptionName(checkboxes[i].id))) {
			checkboxes[i].checked = true;
			if ($id(checkboxes[i].id + '_desc')) {
				$id(checkboxes[i].id + '_desc').style.display = 'none';
			}
			if (checkboxes[i].dataset.optionType === 'cbgroup' || checkboxes[i].dataset.optionType === 'islands-cbgroup') {
				var inputs = document.querySelectorAll('#' + checkboxes[i].id + '_choice input, #' + checkboxes[i].id + '_cbs input');
				for (var j = 0, len2 = inputs.length; j < len2; j++) {
					if (!optval.match(inputs[j].dataset.valueName) !== !checkboxes[i].dataset.optionInversed) {
						inputs[j].checked = true;
					} else {
						inputs[j].checked = false;
					}
				}
			} else if (checkboxes[i].dataset.optionType === 'number' || checkboxes[i].dataset.optionType === 'text') {
				var input = document.querySelector('#' + checkboxes[i].id + '_choice input');
				input.value = optval;
			} else if (checkboxes[i].dataset.optionType === 'background') {
				if (optval !== 'cloud') {
					$id('custom_background').checked = true;
				}
			} else if (checkboxes[i].dataset.optionType === 'infosound') {
				if (optval === 'arena' || optval === 'spar') {
					$id('infosound_' + optval).checked = true;
				} else {
					$id('infosound_custom').checked = true;
				}
			}
		} else {
			if ($id(checkboxes[i].id + '_choice')) {
				$id(checkboxes[i].id + '_choice').style.display = 'none';
			}
			if (checkboxes[i].dataset.optionType === 'number' || checkboxes[i].dataset.optionType === 'text') {
				var input = document.querySelector('#' + checkboxes[i].id + '_choice input');
				input.value = checkboxes[i].dataset.defaultValue || '';
			}
		}
	}
	if ($id('disable_godville_clock').checked) {
		$id('localtime_godville_clock_h').style.display = 'none';
		$id('localtime_godville_clock_desc').style.display = 'none';
	}
	if ($id('disable_logger').checked) {
		$id('sum_allies_hp_h').style.display = 'none';
		$id('sum_allies_hp_desc').style.display = 'none';
	}
	var activeInformers = storage.get('Option:activeInformers');
	if (activeInformers) {
		activeInformers = JSON.parse(activeInformers);
		var aiCheckboxes = $C('informer-checkbox');
		for (var i = 0, len = aiCheckboxes.length; i < len; i++) {
			if (activeInformers[aiCheckboxes[i].dataset.id] && (activeInformers[aiCheckboxes[i].dataset.id] & aiCheckboxes[i].dataset.type) == aiCheckboxes[i].dataset.type) {
				aiCheckboxes[i].checked = true;
			}
		}
	}
	// todo: on opera and in case of desktop informers are disabled -- disable second column of checkboxes
	if ($id('disable_voice_generators').checked) {
		$id('voice_menu').style.display = 'none';
		$id('words').style.display = 'none';
	}
	$id('user_css').value = storage.get('UserCss') || '';
	$id('user_css').onchange();
};

var processOptionValues = function(id) {
	var result = null, optionbox = $id(id);
	if (!optionbox.checked) {
		result = '';
	} else if (optionbox.dataset.optionType === 'cbgroup') {
		var values = [], inputs = document.querySelectorAll('#' + id + '_choice input');
		for (var i = 0, len = inputs.length; i < len; i++) {
			if (!inputs[i].checked !== !optionbox.dataset.optionInversed) {
				values.push(inputs[i].dataset.valueName);
			}
		}
		result = values.join();
	} else if (optionbox.dataset.optionType === 'islands-cbgroup') {
		var values = [], inputs = document.querySelectorAll('#' + id + '_cbs input'),
			ignoredValues = ['mbh','mfh','mbc','mfc'],
			currentValues = (storage.get('Option:islandsMapSettings') || '');
		for (var i = 0, len = ignoredValues.length; i < len; i++) {
			if (currentValues.match(ignoredValues[i])) {
				values.push(ignoredValues[i]);
			}
		}
		for (var i = 0, len = inputs.length; i < len; i++) {
			if (inputs[i].checked) {
				values.push(inputs[i].dataset.valueName);
			}
		}
		result = values.join();
	} else if (optionbox.dataset.optionType === 'number') {
		var input = document.querySelector('#' + id + '_choice input');
		result = parseInt(input.value);
		if (isNaN(parseInt(input.value)) || ((typeof optionbox.dataset.minValue !== 'undefined') && result < optionbox.dataset.minValue)) {
			result = optionbox.dataset.defaultValue || '';
			input.value = optionbox.dataset.defaultValue || '';
		}
	} else if (optionbox.dataset.optionType === 'text') {
		var input = document.querySelector('#' + id + '_choice input');
		result = input.value.trim();
		if ((typeof optionbox.dataset.minLength !== 'undefined') && result.length < optionbox.dataset.minLength) {
			result = optionbox.dataset.defaultValue || '';
			input.value = optionbox.dataset.defaultValue || '';
		}
	} else if (optionbox.dataset.optionType === 'background') {
		if ($id('custom_background').checked) {
			var custom_file = $id('custom_file').files[0],
				custom_link = $id('custom_link').value.match(/https?:\/\/.*/),
				cb_status = $id('cb_status');
			if (custom_file && custom_file.type.match(/^image\/(bmp|cis\-cod|gif|ief|jpeg|jpg|pipeg|png|svg\+xml|tiff|x\-cmu\-raster|x\-cmx|x\-icon|x\-portable\-anymap|x\-portable\-bitmap|x\-portable\-graymap|x\-portable\-pixmap|x\-rgb|x\-xbitmap|x\-xpixmap|x\-xwindowdump)$/i)) {
				var reader = new FileReader();
				reader.onload = function(e) {
					storage.set('Option:useBackground', e.target.result);
					set_theme_and_background();
					displaySaveTime();
				};
				reader.readAsDataURL(custom_file);
				cb_status.textContent = worker.GUIp_i18n.bg_status_file;
				cb_status.style.color = 'green';
			} else if (custom_link) {
				cb_status.textContent = worker.GUIp_i18n.bg_status_link;
				cb_status.style.color = 'green';
				result = custom_link;
			} else if (storage.get('Option:useBackground') && storage.get('Option:useBackground') !== 'cloud') {
				cb_status.textContent = worker.GUIp_i18n.bg_status_same;
				cb_status.style.color = 'blue';
			} else {
				cb_status.textContent = worker.GUIp_i18n.bg_status_error;
				cb_status.style.color = 'red';
				worker.setTimeout(function() {
					$id('cloud_background').click();
				}, 150);
				result = 'cloud';
			}
			//jQuery('#cb_status').fadeIn();
			$id('cb_status').style.display = 'block';
			worker.setTimeout(function() {
				//jQuery('#cb_status').fadeOut();
				$id('cb_status').style.display = 'none';
			}, 3000);
		} else if ($id('cloud_background').checked) {
			result = 'cloud';
		}
	} else if (optionbox.dataset.optionType === 'infosound') {
		if ($id('infosound_custom').checked) {
			var custom_file = $id('infosound_file').files[0],
				cb_status = $id('infosound_status');
			if (custom_file) {
				if (!custom_file.type.match(/^audio\/(mpeg|mp3|ogg|wav)$/i)) {
					cb_status.textContent = worker.GUIp_i18n.informer_custom_sound_error_type;
					cb_status.style.color = 'red';
				} else if (custom_file.size > 100*1024) {
					cb_status.textContent = worker.GUIp_i18n.informer_custom_sound_error_size + '100KB';
					cb_status.style.color = 'red';
				} else {
					var reader = new FileReader();
					reader.onload = function(e) {
						storage.set('Option:informerCustomSound', e.target.result);
						displaySaveTime();
					}
					reader.readAsDataURL(custom_file);
					cb_status.textContent = worker.GUIp_i18n.bg_status_file + ' ok';
					cb_status.style.color = 'green';
				}
			} else {
				cb_status.textContent = worker.GUIp_i18n.bg_status_error;
				cb_status.style.color = 'red';
			}
			if (cb_status.style.color === 'red') {
				worker.setTimeout(function() {
					$id('infosound_arena').checked = true;
				}, 150);
				result = 'arena';
			}
			cb_status.style.display = 'inline';
			worker.setTimeout(function() {
				cb_status.style.display = 'none';
			}, 3000);
		} else if ($id('infosound_arena').checked) {
			result = 'arena';
		} else if ($id('infosound_spar').checked) {
			result = 'spar';
		}
	}
	if (result !== null) {
		storage.set('Option:' + getOptionName(id), result);
		if (optionbox.dataset.optionType === 'background') {
			set_theme_and_background();
		}
		displaySaveTime();
	}
};

var processInformersValues = function() {
	var activeInformers = {},
		aiCheckboxes = $C('informer-checkbox');
	for (var i = 0, len = aiCheckboxes.length; i < len; i++) {
		if (aiCheckboxes[i].checked) {
			if (!activeInformers[aiCheckboxes[i].dataset.id]) {
				activeInformers[aiCheckboxes[i].dataset.id] = 0;
			}
			activeInformers[aiCheckboxes[i].dataset.id] += parseInt(aiCheckboxes[i].dataset.type);
		}
	}
	if (activeInformers['smelter']) {
		activeInformers['smelt!'] = activeInformers['smelter'];
	}
	if (activeInformers['transformer']) {
		activeInformers['transform!'] = activeInformers['transformer'];
	}
	storage.set('Option:activeInformers', JSON.stringify(activeInformers));
	displaySaveTime();
};

var displaySaveTime = function() {
	$id('options_saved').textContent = '(' + worker.GUIp_i18n.options_saved + GUIp.common.formatTime(new Date(),'fulltime') + ')';
};

var loadOptions = function() {
	if (!(god_name && $id('profile_main'))) {
		worker.setTimeout(loadOptions, 100);
		return;
	}
	$id('profile_main').innerHTML = worker.getOptionsPage();
	setForm();
	
	// textareas
	setTextareaResize('ta_edit', setSaveWordsButtonState);
	setTextareaResize('user_css', setUserCSSSaveButtonState);
	
	restoreOptionValues();

	var checkboxes;
	// toggle option checkboxes
	checkboxes = $C('option-checkbox');
	for (var i = 0, len = checkboxes.length; i < len; i++) {
		checkboxes[i].onclick = function() {
			storage.set('Option:' + getOptionName(this.id), this.checked);
			displaySaveTime();
		}
	}
	// toggle menu checkboxes
	checkboxes = $C('menu-checkbox');
	for (var i = 0, len = checkboxes.length; i < len; i++) {
		checkboxes[i].onclick = function() {
			if ($id(this.id + '_desc')) {
				$id(this.id + '_desc').style.display = this.checked ? 'none' : 'block';
			}
			if ($id(this.id + '_choice')) {
				$id(this.id + '_choice').style.display = this.checked ? 'block' : 'none';
			}
			processOptionValues(this.id);
		}
		if (checkboxes[i].dataset.optionType === 'cbgroup') {
			var inputs = document.querySelectorAll('#' + checkboxes[i].id + '_choice input');
			for (var j = 0, len2 = inputs.length; j < len2; j++) {
				inputs[j].onclick = function(id) {
					return function() {
						processOptionValues(id);
					}
				}(checkboxes[i].id);
			}
		} else if (checkboxes[i].dataset.optionType === 'islands-cbgroup') {
			var inputs = document.querySelectorAll('#' + checkboxes[i].id + '_cbs input');
			for (var j = 0, len2 = inputs.length; j < len2; j++) {
				inputs[j].onclick = function(id) {
					return function() {
						processOptionValues(id);
					}
				}(checkboxes[i].id);
			}
		} else if (checkboxes[i].dataset.optionType === 'number' || checkboxes[i].dataset.optionType === 'text') {
			var input = document.querySelector('#' + checkboxes[i].id + '_choice input'),
				button = document.querySelector('#' + checkboxes[i].id + '_choice button');
			input.onkeyup = function() {
				this.style.backgroundColor = '#F4F999';
			}
			button.title = worker.GUIp_i18n.apply;
			button.onclick = function(input,id) {
				return function() {
					input.style.backgroundColor = '';
					processOptionValues(id);
				}
			}(input,checkboxes[i].id);
		} else if (checkboxes[i].dataset.optionType === 'background') {
			var button = document.querySelector('#' + checkboxes[i].id + '_choice button');
			button.title = worker.GUIp_i18n.apply;
			button.onclick = function() {
				$id('custom_link').style.backgroundColor = '';
				$id('custom_background').checked = true;
				processOptionValues('use_background');
			}
			$id('cloud_background').onclick = function() {
				processOptionValues('use_background');
			}
			$id('custom_file').onchange = function() {
				$id('custom_background').checked = true;
				processOptionValues('use_background');
			}
			$id('custom_link').onkeyup = function() {
				this.style.backgroundColor = '#F4F999';
			}
		} else if (checkboxes[i].dataset.optionType === 'infosound') {
			var button = document.querySelector('#' + checkboxes[i].id + '_choice button');
			button.onclick = function() {
				GUIp.common.playSound(storage.get('Option:informerCustomSound') || 'arena');
			}
			$id('infosound_file').onchange = function() {
				$id('infosound_custom').checked = true;
				processOptionValues('informer_custom_sound');
			}
			$id('infosound_arena').onclick = $id('infosound_spar').onclick = function() {
				$id('infosound_file').value = '';
				processOptionValues('informer_custom_sound');
			}
		}
	}
	// toggle informers checkboxes
	checkboxes = $C('informer-checkbox');
	for (var i = 0, len = checkboxes.length; i < len; i++) {
		checkboxes[i].onclick = function() {
			processInformersValues();
		}
	}
	if (!$id('enable_informer_alerts').checked || worker.GUIp_browser === 'Opera') {
		for (var i = 0, len = checkboxes.length; i < len; i++) {
			if (checkboxes[i].dataset.type === '32') {
				checkboxes[i].disabled = true;
			}
		}
	}
	$id('enable_informer_alerts').addEventListener('click', function() {
		for (var i = 0, len = checkboxes.length; i < len; i++) {
			if (checkboxes[i].dataset.type === '32') {
				checkboxes[i].disabled = !$id('enable_informer_alerts').checked;
			}
		}
	});
	if (worker.GUIp_browser === 'Opera') {
		$id('enable_informer_alerts').disabled = true;
		$id('enable_pm_alerts').disabled = true;
	}
	// reset gp threshold when disabling dischange button improvement 
	$id('improve_discharge_button').addEventListener('click', function() {
		if (!$id('improve_discharge_button').checked) {
			localStorage.removeItem('gp_thre');
		}
	});
	// hide some options depending on the state of some other options
	$id('disable_godville_clock').addEventListener('click', function() {
		$id('localtime_godville_clock_h').style.display = $id('disable_godville_clock').checked ? 'none' : 'block';
		$id('localtime_godville_clock_desc').style.display = $id('disable_godville_clock').checked ? 'none' : 'block';
	});
	$id('disable_logger').addEventListener('click', function() {
		$id('sum_allies_hp_h').style.display = $id('disable_logger').checked ? 'none' : 'block';
		$id('sum_allies_hp_desc').style.display = $id('disable_logger').checked ? 'none' : 'block';
	});
	$id('disable_voice_generators').addEventListener('click', function() {
		//jQuery('#voice_menu').slideToggle("slow");
		$id('voice_menu').style.display = $id('voice_menu').style.display === 'none' ? 'block' : 'none';
		//jQuery('#words').slideToggle("slow");
		$id('words').style.display = $id('words').style.display === 'none' ? 'block' : 'none';
	});
	// change some labels for heroines
	if (!storage.get('charIsMale')) {
		modifyTextsForHeroines('.g_desc');
		modifyTextsForHeroines('.l_capt');
	}
	// import/export
	$id('settings_import').onclick = function() {
		storage.importSettings($id('guip_settings').value,$id('settings_everything').checked);
	};
	$id('settings_export').onclick = function() {
		$id('guip_settings').value = storage.exportSettings($id('settings_everything').checked);
	};
	$id('settings_download').onclick = function() {
		var keyword;
		if (keyword = worker.prompt(worker.GUIp_i18n.settings_cloud_download_warning)) {
			var path = GUIp.common.erinome_url + '/cloud/?act=download&gn=' + worker.encodeURIComponent(god_name) + '&kw=' + worker.encodeURIComponent(keyword) + (worker.GUIp_locale === 'en' ? '&l=1' : '');
			GUIp.common.getXHR(path, function(xhr) {
				switch (xhr.responseText.substr(0,3)) {
				case 'ok#':
					$id('guip_settings').value = xhr.responseText.substr(3);
					worker.alert(worker.GUIp_i18n.settings_cloud_download_ok);
					break;
				case 'wk#':
					worker.alert(worker.GUIp_i18n.settings_cloud_wrong_keyword);
					break;
				case 'nd#':
					worker.alert(worker.GUIp_i18n.settings_cloud_missing);
					break;
				default:
					worker.alert(worker.GUIp_i18n.settings_cloud_error);
				}
			}, function() {
				worker.alert(worker.GUIp_i18n.settings_cloud_error);
			});
		}
	};
	$id('settings_upload').onclick = function() {
		var keyword;
		if (keyword = worker.prompt(worker.GUIp_i18n.settings_cloud_upload_warning)) {
			var path = GUIp.common.erinome_url + '/cloud/?act=upload&gn=' + worker.encodeURIComponent(god_name) + '&kw=' + worker.encodeURIComponent(keyword) + (worker.GUIp_locale === 'en' ? '&l=1' : ''),
				postdata = 'data='+worker.encodeURIComponent(storage.exportSettings());
			GUIp.common.postXHR(path, postdata, function(xhr) {
				if (xhr.responseText.substr(0,3) === 'ok#') {
					worker.alert(worker.GUIp_i18n.settings_cloud_upload_ok);
				} else if (xhr.responseText.substr(0,3) === 'wk#') {
					worker.alert(worker.GUIp_i18n.settings_cloud_wrong_keyword);
				} else {
					worker.alert(worker.GUIp_i18n.settings_cloud_error);
				}
			}, function() {
				worker.alert(worker.GUIp_i18n.settings_cloud_error);
			});
		}
	};
	$id('settings_everything').onclick = function() {
		$id('settings_download').disabled = $id('settings_everything').checked;
		$id('settings_upload').disabled = $id('settings_everything').checked;
	};
	// bind popup windows to their buttons
	$id('span_tamable').onclick = GUIp.common.createLightbox.bind(null,'pets',storage,def,null);
	$id('span_chosen').onclick = GUIp.common.createLightbox.bind(null,'chosen_monsters',storage,def,null);
	$id('span_special').onclick = GUIp.common.createLightbox.bind(null,'special_monsters',storage,def,null);
	$id('span_ccraft').onclick = GUIp.common.createLightbox.bind(null,'custom_craft',storage,def,null);
	$id('span_informers').onclick = GUIp.common.createLightbox.bind(null,'custom_informers',storage,def,null);
	$id('span_ally_blacklist').onclick = GUIp.common.createLightbox.bind(null,'ally_blacklist',storage,def,null);
}

function setForm() {
	for (var sect in def.phrases) {
		addOnClick(sect);
	}
	$id('save_words').onclick = function() { saveWords(); return false; };
	$id('set_default').onclick = function() { delete_custom_words(); return false; };
	$id('save_user_css').onclick = function() { saveUserCSS(); return false; };
}

function addOnClick(sect) {
	$id('l_' + sect).onclick = function() {
		setText(sect);
		return false;
	};
}

function delete_custom_words() {
	var ta = $id('ta_edit'),
		text = def.phrases[curr_sect];
	ta.setAttribute('rows', text.length);
	ta.value = text.join('\n');
	storage.remove('CustomPhrases:' + curr_sect);
	storage.set('phrasesChanged', 'true');
	setSaveWordsButtonState();
	setDefaultWordsButtonState(false);
}

function saveWords() {
	var text = $id('ta_edit').value;
	if (text === "") { return; }
	var t_list = text.split("\n"),
		t_out = [];
	for (var i = 0; i < t_list.length; i++) {
		if (t_list[i] !== '') {
			t_out.push(t_list[i]);
		}
	}
	storage.set('CustomPhrases:' + curr_sect, t_out.join('||'));
	storage.set('phrasesChanged', 'true');
	setSaveWordsButtonState();
	setDefaultWordsButtonState(true);
}

function setSaveWordsButtonState() {
	var save_words = $id('save_words');
	if ($id('ta_edit').value.replace(/\n/g, '||') !== (storage.get('CustomPhrases:' + curr_sect) || def.phrases[curr_sect].join('||'))) {
		save_words.removeAttribute('disabled');
	} else {
		save_words.setAttribute('disabled', 'disabled');
	}
}

function setDefaultWordsButtonState(condition) {
	var set_default = $id('set_default');
	if (condition) {
		set_default.removeAttribute('disabled');
	} else {
		set_default.setAttribute('disabled', 'disabled');
	}
}

function setText(sect) {
	curr_sect = sect;
	if ($q('#words a.selected')) { $q('#words a.selected').classList.remove('selected'); }
	$q('#words a#l_' + curr_sect).classList.add('selected');
	var text_list = storage.get('CustomPhrases:' + curr_sect),
		text = text_list ? text_list.split('||') : def.phrases[curr_sect],
		textarea = $id('ta_edit');
	textarea.removeAttribute('disabled');
	textarea.setAttribute('rows', text.length);
	textarea.value = text.join('\n');
	setSaveWordsButtonState();
	setDefaultWordsButtonState(text_list);
}

function saveUserCSS() {
	storage.set('UserCss', $id('user_css').value);
	setUserCSSSaveButtonState();
}

function setUserCSSSaveButtonState() {
	var save_user_css = $id('save_user_css');
	if ($id('user_css').value !== storage.get('UserCss')) {
		save_user_css.removeAttribute('disabled');
	} else {
		save_user_css.setAttribute('disabled', 'disabled');
	}
}

function improve_blocks() {
	var blocks = document.querySelectorAll('.bl_cell:not(.block), #pant_tbl:not(.block)');
	for (var i = 0, len = blocks.length; i < len; i++) {
		blocks[i].classList.add('block');
	}
}

function set_theme_and_background() {
	var ui_s_css = document.getElementById('ui_s_css');
	if (ui_s_css) {
		ui_s_css.parentNode.removeChild(ui_s_css);
	}
	GUIp.common.addCSSFromURL('/stylesheets/' + storage.get('ui_s') + '.css', 'ui_s_css');
	GUIp.common.setPageBackground(storage.get('Option:useBackground'));
}

var def, curr_sect, god_name;

var starterInt = worker.setInterval(function() {
	if (worker.GUIp_browser && worker.GUIp_i18n && GUIp.common.addCSSFromURL && worker.jsep) {
		worker.clearInterval(starterInt);
		if (!$q('#opt_change_profile div div')) {
			var newNode;
			newNode = doc.createTextNode(' | ');
			$q('#profile_main p').appendChild(newNode);
			newNode = doc.createElement('a');
			newNode.id = 'ui_settings';
			newNode.href = '/user/profile/settings#ui_settings';
			newNode.textContent = worker.GUIp_i18n.ui_settings;
			$q('#profile_main p').appendChild(newNode);
			return;
		}
		def = worker.GUIp_words();
		god_name = $q('#opt_change_profile div div').textContent;
		if (god_name) {
			localStorage.setItem('eGUI_CurrentUser', god_name);
		} else {
			god_name = GUIp.common.getCurrentGodname();
		}
		if (location.hash === "#ui_settings") {
			loadOptions();
		} else {
			addMenu();
		}
		GUIp.common.addCSSFromURL(worker.GUIp_getResource('options.css'), 'guip_options_css');
		set_theme_and_background();
		improve_blocks();
		if (worker.GUIp_browser !== 'Opera') {
			var observer = new MutationObserver(function(mutations) {
				for (var i = 0, len = mutations.length; i < len; i++) {
					for (var j = 0, len2 = mutations[i].addedNodes.length; j < len2; j++) {
						if (mutations[i].addedNodes[j].querySelector && mutations[i].addedNodes[j].querySelector('.bl_cell')) {
							mutations[i].addedNodes[j].querySelector('.bl_cell').classList.add('block');
						}
					}
				}
			});
			if (document.getElementById('profile_main')) {
				observer.observe(document.getElementById('profile_main'), { childList: true, subtree: true });
			}
		}
		// add a couple custom expressions to jsep
		worker.jsep.addBinaryOp("~", 6);
		worker.jsep.addBinaryOp("~*", 6);
	}
}, 100);

})();
