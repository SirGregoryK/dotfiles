(function() {
'use strict';

var worker = window;

worker.GUIp = worker.GUIp || {};


// ui_data
var ui_data = worker.GUIp.data = {};

// base variables initialization
ui_data.init = function() {
	ui_data._initVariables();
	// init mobile cookies
	GUIp.common.forceDesktopPage();
	// desktop notifications permissions
	if ((ui_storage.get('Option:enableInformerAlerts') || ui_storage.get('Option:enablePmAlerts')) && worker.GUIp_browser !== 'Opera' && worker.Notification.permission !== "granted") {
		worker.Notification.requestPermission();
	}
	ui_data._getWantedMonster();
	worker.setInterval(ui_data._getWantedMonster, 5*60*1000);
};
ui_data._initVariables = function() {
	this.currentVersion = '1.1.9.4';
	this.docTitle = document.title;
	this.isFight = ui_stats.isFight();
	this.isDungeon = ui_stats.isDungeon();
	this.isSail = ui_stats.isSail();
	this.god_name = ui_stats.godName();
	this.char_name = ui_stats.charName();
	this.char_sex = ui_stats.isMale() ? worker.GUIp_i18n.hero : worker.GUIp_i18n.heroine;
	localStorage.setItem('eGUI_CurrentUser', this.god_name);
	ui_storage.set('charIsMale', ui_stats.isMale());
	if (ui_stats.checkShop()) {
		ui_storage.set('charHasShop',true);
		this.hasShop = true;
	} else {
		this.hasShop = ui_storage.get('charHasShop') || false;
	}
	this.storedPets = JSON.parse(ui_storage.get('charStoredPets')) || [];
	if (ui_storage.get('Option:activeInformers') === null) {
		// default preset of informers
		var informersPreset = {
			full_godpower:48, much_gold:48, dead:48, low_health:48, fight:48, selected_town:48, wanted_monster:48, special_monster:16, tamable_monster:112, chosen_monster:48,pet_knocked_out:48, close_to_boss:48, close_to_rival:48, guild_quest:16, custom_informers:48,
			treasure_box:48, charge_box:48, gift_box:48, good_box:48
		};
		if (!ui_stats.hasTemple()) {
			informersPreset['smelter'] = informersPreset['smelt!'] = informersPreset['transformer'] = informersPreset['transform!'] = 48;
		}
		ui_storage.set('Option:activeInformers',JSON.stringify(informersPreset));
		ui_storage.set('Option:disableDieButton',true);
		ui_storage.set('Option:useShortPhrases',true);
		ui_storage.set('Option:enableInformerAlerts',true);
		ui_storage.set('Option:enablePmAlerts',true);
	}
	if (!ui_storage.get('ForumSubscriptions')) {
		ui_storage.set('ForumSubscriptions', '{}');
		ui_storage.set('ForumInformers', '{}');
	}
	if (!this.isFight) {
		this.lastFieldInit = ui_storage.set_with_diff('lastFieldInit',Date.now());
	}
	document.body.classList.add('superhero');
	document.body.classList.add(this.isDungeon ? 'dungeon' : this.isSail ? 'sail' : this.isFight ? 'fight' : 'field');
	if (ui_stats.hasTemple()) {
		document.body.classList.add('has_temple');
	}
	ui_utils.voiceInput = document.getElementById('god_phrase') || document.getElementById('godvoice');
};
ui_data._getWantedMonster = function(forced) {
	if (forced || isNaN(ui_storage.get('WantedMonster:Date')) ||
		ui_utils.dateToMoscowTimeZone(+ui_storage.get('WantedMonster:Date')) < ui_utils.dateToMoscowTimeZone(Date.now())) {
		GUIp.common.getXHR('/news', ui_data._parseWantedMonster);
	} else {
		ui_improver.wantedMonsters = new worker.RegExp('^(' + ui_storage.get('WantedMonster:Value') + ')$','i');
		ui_improver.wantedItems = new worker.RegExp('^(' + ui_storage.get('WantedItem:Value') + ')$','i');
		ui_improver.dailyForecast = ui_storage.get('DailyForecast');
		ui_improver.dailyForecastText = ui_storage.get('DailyForecastText');
		ui_improver.showDailyForecast();
	}
};
ui_data._parseWantedMonster = function(xhr) {
	var temp, newsDate;
	if (temp = xhr.responseText.match(/<div id="date"[^>]*>[^<]*<span>(\d+)<\/span>/)) {
		newsDate = temp[1] * 86400000 + ((worker.GUIp_locale === 'ru') ? 1195560000000 : 1273492800000);
	} else {
		newsDate = Date.now();
	}
	temp = xhr.responseText.match(/(?:Разыскиваются|Wanted)[\s\S]+?>([^<]+?)<\/a>[\s\S]+?>([^<]+?)<\/a>/)
	if (temp) {
		temp = temp[1] + '|' + temp[2];
		ui_storage.set('WantedMonster:Date', newsDate);
		ui_storage.set('WantedMonster:Value', temp);
		ui_improver.wantedMonsters = new worker.RegExp('^(' + temp + ')$','i');
	} else {
		ui_improver.wantedMonsters = null;
	} 
	temp = xhr.responseText.match(/(?:Куплю-продам|Buy and Sell)[\s\S]+?\/index\.php\/[\s\S]+?>([^<]+?)<\/a>[\s\S]+?\/index\.php\/[\s\S]+?>([^<]+?)<\/a>/);
	if (temp) {
		temp = temp[1] + '|' + temp[2];
		ui_storage.set('WantedItem:Value', temp);
		ui_improver.wantedItems = new worker.RegExp('^(' + temp + ')$','i');
	} else {
		ui_improver.wantedItems = null;
	}
	temp = xhr.responseText.match(/(?:Астропрогноз|Daily Forecast)[\s\S]+?<p>([^<]+?)<\/p>(?:[^<]+?<p>([^<]+?)<\/p>)?/);
	if (temp) {
		var forecastData, forecastText, forecast = [];
		forecastText = temp[1] ? (temp[1] + (temp[2] ? '\n' + temp[2] : '')).replace(/&#0149;/g,'•') : null;
		temp = temp[1] + '|' + temp[2];
		forecastData = [
			['распаковывается в 70% праны|accumulator charge restores 70%', 'accu70'],
			['Сегодня все дороги ведут в Годвилль|Today all roads lead to Godville', 'gvroads'],
			['улучшат слышимость гласов героями|внимательно прислушиваются к гласам|с большим успехом общаться с героями|heroes are a little more likely to hear and react', 'hearing'],
			['причиной искажения некоторых гласов|decrease godvoice hearing', 'unhearing'],
			['получить незапланированное эпическое|an unexpected epic quest', 'epic'],
			['произвести хорошее впечатление на горожан|increase guild fame in towns', 'fame'],
			['Переплавить монеты в золотые кирпичи|today melting a golden brick with a god influence', 'melting'],
			['храмовладельцев хотя бы сегодня отказаться от пьянок|put more money in savings', 'nodrinking'],
			['отрицательно влияют на свойства храмов|atmosphere is negatively affecting temples', 'nolaying'],
			['услуги по прокачиванию умений сегодня не предоставляются|coaches went into the astral plane', 'notraining'],
			['магазинах снаряжения сегодня пусто|торговые лавки без нового снаряжения|left all equipment shops', 'noequip'],
			['эффективность молитв в храмах сегодня резко возрастет|increase the efficiency of all temple prayer', 'prayer'],
			['усложняет выполнение взятых сегодня заданий|complications in progressing with quests', 'longquests'],
			['ауры действуют на них гораздо дольше|increase duration of all auras', 'longauras'],
			['ауры будут сдуваться|all auras to be half as long', 'shortauras'],
			['монстров возможно их воскрешение|monsters could self-resurrects', 'resurrectmonsters'],
			['монстра хоть что-нибудь да найдется|monsters should have something valuable', 'goldmonsters'],
			['боссы сегодня носят с собой заметно больше наличности|boss-monsters to carry more gold', 'goldbosses'],
			['Выкопать босса сегодня куда легче|underground monster lair today', 'easybosses'],
			['риск быть обманутым при продаже|likely to be fooled during a sale', 'badtraders'],
			['Умения сегодня используются заметно чаще|favors all skilled heroes', 'skills'],
			['уменьшает стоимость отправки героя на дуэль|magnetic cloud above the arena', 'arena'],
			['влияния богов сильнее склоняют чашу характера|deeper personality changes', 'personality'],
			['массовой потере зрения и трофеев|sun could cause mass loss of', 'itemsloss'],
			['активируемые трофеи могут обходиться вдвое дешевле|half as much godpower for activation', 'lowpoweractivatables'],
			['скупают спецтрофеи куда дешевле|artifacts, greatly decreasing', 'cheapactivatables'],
			['трофеи сегодня можно продать вдвое дороже|activatable artifacts are worth twice', 'expensiveactivatables'],
			['награда за бинго сегодня в разы больше обычной', 'bingo'],
			['день заставит героев садиться с удочкой почаще|Heroes are more likely to fish today', 'fishing']
		];
		for (var i = 0, len = forecastData.length; i < len; i++) {
			if (temp.match(forecastData[i][0])) {
				forecast.push(forecastData[i][1]);
			}
		}
		forecast = forecast.join(',');
		if (forecast !== ui_storage.get('DailyForecast')) {
			ui_storage.set('DailyForecast', forecast);
		}
		if (forecastText !== ui_storage.get('DailyForecastText')) {
			ui_storage.set('DailyForecastText', forecastText);
		}
		ui_improver.dailyForecast = forecast;
		ui_improver.dailyForecastText = forecastText;
	} else {
		ui_improver.dailyForecast = null;
		ui_improver.dailyForecastText = null;
	}
	ui_improver.showDailyForecast();
};


// ui_utils
var ui_utils = worker.GUIp.utils = {};

ui_utils.notiLaunch = 0;
ui_utils.hasShownErrorMessage = false;
ui_utils.hasShownInfoMessage = false;
// base phrase say algorithm
ui_utils.setVoice = function(voice, force) {
	var postv = this.voiceInput.value.match(/\/\/\ .+$/);
	if (postv && !force) {
		this.voiceInput.value = voice + ' ' + postv[0];
	} else {
		this.voiceInput.value = voice;
	}
	ui_utils.triggerChangeOnVoiceInput();
};
ui_utils.triggerChangeOnVoiceInput = function() {
	//worker.$(this.voiceInput).change();
	worker.$(this.voiceInput).trigger(worker.$.Event( "change", { originalEvent: {} } ));
};
// finds a label with given name
ui_utils.findLabel = function($base_elem, label_name) {
	return worker.$('.l_capt', $base_elem).filter(function(index) {
		return this.textContent === label_name;
	});
};
// checks if $elem already improved
ui_utils.isAlreadyImproved = function(elem) {
	if (elem.classList.contains('improved')) {
		return true;
	} else {
		elem.classList.add('improved');
		return false;
	}
};
// generic voice generator
ui_utils.getGenericVoicegenButton = function(text, section, title) {
	var voicegen = document.createElement('a');
	voicegen.title = title;
	voicegen.textContent = text;
	voicegen.className = 'voice_generator ' + (ui_data.isDungeon ? 'dungeon' : ui_data.isFight ? 'battle' : 'field') + ' ' + section;
	voicegen.onclick = function() {
		if (ui_utils.voiceInput.getAttribute('disabled') !== 'disabled') {
			if (section !== 'mnemonics') {
				ui_utils.setVoice(ui_words.longPhrase(section));
			} else {
				ui_words.mnemoVoice();
			}
			ui_words.currentPhrase = "";
		}
		return false;
	};
	return voicegen;
};
ui_utils.addVoicegen = function(elem, voicegen_name, section, title) {
	elem.parentNode.insertBefore(ui_utils.getGenericVoicegenButton(voicegen_name, section, title), elem.nextSibling);
};
ui_utils.mapVoicegen = function(e) {
	var x, y, X, Y, K, curPos = GUIp.common.getOwnCell();

	if (!curPos || ui_stats.Godpower() < 5 || ui_storage.get('Option:disableVoiceGenerators') || ui_utils.voiceInput.getAttribute('disabled') === 'disabled') {
		return;
	}

	curPos = curPos.getBoundingClientRect();
	X = e.clientX - curPos.left - curPos.width / 2;
	Y = e.clientY - curPos.top - curPos.height / 2;

	K = 1 / Math.sqrt(2);
	x = X * K - Y * K;
	y = X * K + Y * K;

	if (x > 0) {
		if (y > 0)
			ui_utils.setVoice(ui_words.longPhrase('go_east'));
		else
			ui_utils.setVoice(ui_words.longPhrase('go_north'));
	} else {
		if (y > 0)
			ui_utils.setVoice(ui_words.longPhrase('go_south'));
		else
			ui_utils.setVoice(ui_words.longPhrase('go_west'));
	}
	ui_words.currentPhrase = "";
	return;
};
// Случайный индекс в массиве
ui_utils.getRandomIndex = function(arr) {
	return Math.floor(Math.random()*arr.length);
};
// Форматирование времени
ui_utils.formatClock = function(godvilleTime) {
	return ('0' + godvilleTime.getUTCHours()).slice(-2) + ':' + ('0' + godvilleTime.getUTCMinutes()).slice(-2) + ':' + ('0' + godvilleTime.getUTCSeconds()).slice(-2);
};
// Форматирование координат относительно порта
ui_utils.formatSailPosition = function(arkData,mapSettings) {
	if (!mapSettings.match('tcrd')) {
		var cnp, cnr, rlimit = ui_improver.islandsMapRadius || ui_improver.islandsMapConds.match('small') && 15 || 22,
			cstep = (ui_improver.islandsMapConds.match('small') ? 50 : 100) - ui_stats.currentStep(),
			csup = ui_stats.Map_Supplies(),
			distance = GUIp.common.islandsMapDistance(arkData,[0,0,0]);
		if (mapSettings.match('pdpm')) {
			rlimit = ui_improver.islandsMapConds.match('small') && 16 || 24;
		}
		cnp = ui_utils.sailWarnDistance(distance,cstep,csup);
		cnr = ui_utils.sailWarnDistance((rlimit - distance),cstep,csup,ui_improver.islandsMapConds.match('locked'));
		if (worker.GUIp_locale === 'ru') {
			return '<span' + cnp + '><abbr title="Порт">П:</abbr>' + distance + '</span>, <span' + cnr + '><abbr title="Край">К:</abbr>' + (rlimit - distance) + '</span>';
		} else {
			return '<span' + cnp + '><abbr title="Port">P:</abbr>' + distance + '</span>, <span' + cnr + '><abbr title="Rim">R:</abbr>' + (rlimit - distance) + '</span>';
		}
	} else {
		var y = arkData[2], x = arkData[0] + arkData[2] / 2;
		if (worker.GUIp_locale === 'ru') {
			return (y !== 0 ? '<abbr title=' + (y > 0 ? '"Юг">Ю:' : '"Север">С:') + '</abbr>' : '') + Math.abs(y) + ', ' + '<abbr title=' + (x !== 0 ? (x > 0 ? '"Восток">В:' : '"Запад">З:') + '</abbr>' : '') + Math.ceil(Math.abs(x));
		} else {
			return (y !== 0 ? '<abbr title=' + (y > 0 ? '"South">S:' : '"North">N:') + '</abbr>' : '') + Math.abs(y) + ', ' + '<abbr title=' + (x !== 0 ? (x > 0 ? '"East">E:' : '"West">W:') + '</abbr>' : '') + Math.ceil(Math.abs(x));
		}
	}
};
// Проверка на достаточность оставшихся шагов и припасов в плавании
ui_utils.sailWarnDistance = function(stepsReq, stepsRem, supplCnt, locked) {
	var result = (stepsReq > stepsRem || locked ? 'low_steps' : (stepsReq > supplCnt ? 'low_supplies' : ''));
	return result ? ' class="e_' + result + '"' : '';
};
// Случайный элемент массива
ui_utils.getRandomItem = function(arr) {
	return arr[ui_utils.getRandomIndex(arr)];
};
// Вытаскивает случайный элемент из массива
ui_utils.popRandomItem = function(arr) {
	var ind = ui_utils.getRandomIndex(arr);
	var res = arr[ind];
	arr.splice(ind, 1);
	return res;
};
// Escapes HTML symbols
ui_utils.escapeHTML = function(str) {
	return String(str).replace(/&/g, "&amp;")
					  .replace(/"/g, "&quot;")
					  .replace(/</g, "&lt;")
					  .replace(/>/g, "&gt;");
};
ui_utils.addCSS = function () {
	GUIp.common.addCSSFromURL(worker.GUIp_getResource('superhero.css'), 'guip_css');
	if (worker.GUIp_browser === 'Opera') {
		// this thing actually breaks stuff. remove it!
		var opr_headers = document.getElementsByClassName('opera_header_fix');
		for (var i = 0, len = opr_headers.length; i < len; i++) {
			opr_headers[0].classList.remove('opera_header_fix');
		}
		// this should make minimap in dungeons a bit better
		if (document.getElementsByClassName('dml').length > 0) {
			document.getElementsByClassName('dml')[0].parentNode.style.paddingBottom = '21px';
		}
	}
};
ui_utils.showMessage = function(msg_no, msg) {
	var id = 'msg' + msg_no;
	document.getElementById('menu_bar').insertAdjacentHTML('afterend',
		'<div id="' + id + '" class="hint_bar ui_msg">'+
			'<div class="hint_bar_capt"><b>' + msg.title + '</b></div>'+
			'<div class="hint_bar_content">' + msg.content + '</div>'+
			'<div class="hint_bar_close"><a id="' + id + '_close">' + worker.GUIp_i18n.close + '</a></div>' +
		'</div>'
	);
	var msg_elem = document.getElementById(id);
	document.getElementById(id + '_close').onclick = function() {
		worker.$(msg_elem).fadeToggle(function() {
			msg_elem.parentNode.removeChild(msg_elem);
			if (!isNaN(msg_no)) {
				ui_storage.set('lastShownMessage', msg_no);
			}
		});
		return false;
	};

	worker.setTimeout(function() {
		worker.$(msg_elem).fadeToggle(500, msg.callback);
	}, 500);
};
ui_utils.getNodeIndex = function(node) {
	var i = 0;
	while ((node = node.previousElementSibling)) {
		i++;
	}
	return i;
};
ui_utils.openChatWith = function(friend, e) {
	if (e) {
		e.preventDefault();
		e.stopPropagation();
	}
	var current, friends = document.querySelectorAll('.msgDockPopupW .frline');
	for (var i = 0, len = friends.length; i < len; i++) {
		current = friends[i].querySelector('.frname');
		if (current.textContent === friend) {
			current.click();
			break;
		}
	}
};
ui_utils.dateToMoscowTimeZone = function(date) {
	var temp = new Date(date);
	temp.setTime(temp.getTime() + (temp.getTimezoneOffset() + (worker.GUIp_locale === 'en' ? 115 : 175))*60*1000);
	return temp.getFullYear() + '/' +
		  (temp.getMonth() + 1 < 10 ? '0' : '') + (temp.getMonth() + 1) + '/' +
		  (temp.getDate() < 10 ? '0' : '') + temp.getDate();
};
ui_utils.setVoiceSubmitState = function(condition, disable) {
	if (!ui_data.isFight && condition) {
		var voice_submit = document.getElementById('voice_submit');
		if (disable) {
			voice_submit.setAttribute('disabled', 'disabled');
		} else {
			voice_submit.removeAttribute('disabled');
		}
		return true;
	}
	return false;
};
ui_utils.hideElem = function(elem, hide) {
	if (!elem) {
		return;
	}
	if (hide) {
		elem.classList.add('hidden');
	} else {
		elem.classList.remove('hidden');
	}
};
ui_utils._parseVersion = function(isNewestCallback, isNotNewestCallback, failCallback, xhr) {
	//var match = xhr.responseText.match(/Godville UI\+ (\d+\.\d+\.\d+\.\d+)/);
	var match = xhr.responseText.replace(/(<([^>]+)>)/ig,"").match(/Текущая версия: v(\d+\.\d+\.\d+\.\d+)/);
	if (match) {
		var temp_cur = ui_data.currentVersion.split('.'),
			last_version = match[1],
			temp_last = last_version.split('.'),
			isNewest = +temp_cur[0] < +temp_last[0] ? false :
					   +temp_cur[0] > +temp_last[0] ? true :
					   +temp_cur[1] < +temp_last[1] ? false :
					   +temp_cur[1] > +temp_last[1] ? true :
					   +temp_cur[2] < +temp_last[2] ? false :
					   +temp_cur[2] > +temp_last[2] ? true :
					   +temp_cur[3] < +temp_last[3] ? false : true;
		if (isNewest) {
			if (isNewestCallback) {
				isNewestCallback();
			}
		} else if (isNotNewestCallback) {
			isNotNewestCallback(match[1]);
		}
	} else if (failCallback) {
		failCallback();
	}
};
ui_utils.checkVersion = function(isNewestCallback, isNotNewestCallback, failCallback) {
	//GUIp.common.getXHR(GUIp.common.erinome_url+'/checkversion?ver=' + ui_data.currentVersion, ui_utils._parseVersion.bind(null, isNewestCallback, isNotNewestCallback, failCallback), failCallback);
	if (worker.GUIp_locale === 'ru') {
		GUIp.common.getXHR('/forums/show_topic/3432', ui_utils._parseVersion.bind(null, isNewestCallback, isNotNewestCallback, failCallback), failCallback);
	} else if (failCallback) {
		failCallback();
	}
};

ui_utils.processError = function(error, isDebugMode) {
	if (isDebugMode) {
		worker.console.warn(worker.GUIp_i18n.debug_mode_warning);
	}
	var name_message = error.name + ': ' + error.message,
		stack = error.stack.replace(name_message, '').replace(/^\n|    at /g, '').replace(/(?:chrome-extension|@resource).*?:(\d+:\d+)/g, '@$1');
	worker.console.error('Godville UI+ error log:\n' +
						  name_message + '\n' +
						  worker.GUIp_i18n.error_message_stack_trace + ': ' + stack);
	ui_utils.showMessage('error', {
		title: worker.GUIp_i18n.error_message_title,
		content: (isDebugMode ? '<div><b class="debug_mode_warning">' + worker.GUIp_i18n.debug_mode_warning + '</b></div>' : '') +
				 '<div id="possible_actions">' +
					'<div>' + worker.GUIp_i18n.error_message_text + ' <b>' + name_message + '</b>.</div>' +
					'<div>' + worker.GUIp_i18n.possible_actions + '</div>' +
					'<ol>' +
						'<li>' + worker.GUIp_i18n.if_first_time + '<a id="press_here_to_reload">' + worker.GUIp_i18n.press_here_to_reload + '</a></li>' +
						'<li>' + worker.GUIp_i18n.if_repeats + '<a id="press_here_to_show_details">' + worker.GUIp_i18n.press_here_to_show_details + '</a></li>' +
					'</ol>' +
				 '</div>' +
				 '<div id="error_details" class="hidden">' +
					'<div>' + worker.GUIp_i18n.error_message_subtitle + '</div>' +
					'<div>' + worker.GUIp_i18n.browser + ' <b>' + worker.GUIp_browser + ' ' + navigator.userAgent.match(worker.GUIp_browser + '\/([\\d.]+)')[1] +'</b>.</div>' +
					'<div>' + worker.GUIp_i18n.version + ' <b>' + ui_data.currentVersion + '</b>.</div>' +
					'<div>' + worker.GUIp_i18n.error_message_text + ' <b>' + name_message + '</b>.</div>' +
					'<div>' + worker.GUIp_i18n.error_message_stack_trace + ': <b>' + stack.replace(/\n/g, '<br>') + '</b></div>' +
				 '</div>',
		callback: function() {
			document.getElementById('press_here_to_reload').onclick = location.reload.bind(location);
			document.getElementById('press_here_to_show_details').onclick = function() {
				ui_utils.hideElem(document.getElementById('possible_actions'), true);
				ui_utils.hideElem(document.getElementById('error_details'), false);
				if (!ui_storage.get('helpDialogVisible')) {
					ui_help.toggleDialog();
				}
			};
		}
	});
};

ui_utils.informAboutOldVersion = function() {
	ui_utils.showMessage('update_required', {
		title: worker.GUIp_i18n.error_message_title,
		content: '<div>' + worker.GUIp_i18n.error_message_in_old_version + '</div>',
		callback: function() {}
	});
};

ui_utils.informNewVersionAvailable = function(newVersion) {
	ui_utils.showMessage('update_required', {
		title: worker.GUIp_i18n.new_version_available,
		content: '<div>' + worker.GUIp_i18n.is_not_last_version_1 + newVersion + worker.GUIp_i18n.is_not_last_version_2 + '</div>',
		callback: function() {
			if (!ui_storage.get('helpDialogVisible')) {
				ui_help.toggleDialog();
			}
		}
	});
};

ui_utils.informNoNewVersionAvailable = function() {
	ui_utils.showMessage('update_not_required', {
		title: worker.GUIp_i18n.is_last_version,
		content: '<div>' + worker.GUIp_i18n.is_last_version_desc + '</div>',
		callback: function() {}
	});
};

ui_utils.informVersionCheckFailed = function() {
	ui_utils.showMessage('update_check_failed', {
		title: worker.GUIp_i18n.getting_version_failed,
		content: '<div>' + worker.GUIp_i18n.getting_version_failed_desc + '</div>',
		callback: function() {}
	});
};

ui_utils.showNotification = function(title,text,callback) {
	worker.setTimeout(function() {
		var notification = new worker.Notification(title, {
			icon: worker.GUIp_getResource('icon64.png'),
			body: text,
		});
		notification.onclick = function() {
			if (callback) {
				callback();
			}
			if (!document.hasFocus()) {
				window.focus();
			}
			notification.close();
		}
		var notificationTimeout = 5, customTimeout = ui_storage.get('Option:informerAlertsTimeout');
		if (parseInt(customTimeout) >= 0) {
			notificationTimeout = parseInt(customTimeout);
		}
		if (notificationTimeout > 0) {
			worker.setTimeout(function() { notification.close(); }, notificationTimeout * 1000);
		}
		worker.setTimeout(function() { if (ui_utils.notiLaunch) { ui_utils.notiLaunch--; } }, 500);
	}, 500 * this.notiLaunch++);
};

ui_utils.pmNotification = function(contact,text) {
	if (!this.pmNotificationNoted || this.pmNotificationNoted[contact] === text || worker.Notification.permission !== "granted" || !ui_storage.get('Option:enablePmAlerts')) {
		return;
	}
	this.pmNotificationNoted[contact] = text;
	var chatNotificationCallback = function(cname) {
		return function() {
			if (ui_utils.getCurrentChat() !== cname) {
				ui_utils.openChatWith(cname);
			}
		};
	};
	if (ui_utils.getCurrentChat() !== contact || !document.hasFocus()) {
		var title = '[PM] ' + contact,
			text = text.substring(0,200) + (text.length > 200 ? '...' : ''),
			callback = chatNotificationCallback(contact);
		ui_utils.showNotification(title,text,callback);
	}
}

ui_utils.getCurrentChat = function() {
	var docktitle = window.$('.frbutton_pressed .dockfrname_w .dockfrname').text().replace(/\.+/g,''),
		headtitle = window.$('.frbutton_pressed .frMsgBlock .fr_chat_header').text().match('^(.*?)(\ и\ е|\ and\ h)');
	if (docktitle && headtitle && headtitle[1].indexOf(docktitle) === 0) {
		return headtitle[1];
	}
	return null;
};

ui_utils.getLastGCM = function() {
	var gc_tab = document.querySelector('.frbutton_pressed .dockfrname');
	if (!gc_tab || !gc_tab.textContent.match(/Гильдсовет|Guild Council/)) {
		return [];
	}
	var meta, message, messages = [], messageLines = gc_tab.parentNode.parentNode.getElementsByClassName('fr_msg_l');
	for (var i = 0, len = messageLines.length; i < len; i++) {
		if (!messageLines[i].firstChild) {
			continue;
		}
		message = {};
		if (messageLines[i].firstChild.nodeType === 3) {
			message.c = messageLines[i].firstChild.textContent
		}
		meta = messageLines[i].getElementsByClassName('gc_fr_el');
		for (var j = 0, len2 = meta.length; j < len2; j++) {
  		if (meta[j].classList.contains('gc_fr_god')) {
  			message.a = meta[j].textContent;
  		} else if (meta[j].classList.contains('gc_fr_el') && meta[j].title) {
  			message.t = meta[j].title;
  		}
  	}
    if (message.c && message.a && message.t) {
    	messages.push(message);
    }
	}
	return messages;
};

ui_utils.switchTheme = function(theme,override) {
	theme = theme || localStorage.getItem('ui_s') || 'th_classic';
	document.body.className = document.body.className.replace(/th_\w+/g, '').trim() + ' ' + theme;
	if (ui_storage.get('ui_s') !== theme) {
		ui_storage.set('ui_s',theme);
	}
	if (override && localStorage.getItem('ui_s') !== theme) {
		worker.jQuery.fx.off = (theme === "th_retro" ? true : false);
		var stylesheet = document.querySelector('link[href*="' + localStorage.getItem('ui_s') + '.css');
		if (stylesheet) {
			stylesheet.parentNode.removeChild(stylesheet);
		}
		GUIp.common.addCSSFromURL('/stylesheets/' + theme + '.css','guip_theme_override');
		localStorage.setItem('ui_s',theme);
	}
};

ui_utils.getStat = function(selector,type,pos) {
	var a, b = document.querySelector(selector);
	switch (type) {
		case 'text':
			return b && b.textContent || null;
		case 'title':
			return b && b.title || null;
		case 'href':
			return b && b.href || null;
		case 'num':
			return b && parseInt(b.textContent) || 0;
		case 'dec':
			return b && parseFloat(b.textContent) || 0;
		case 'numre':
			if (b && (a = b.textContent.match(/(\d+)/))) {
				return +a[0] || 0;
			}
			return 0;
		case 'slashed':
			if (b && (a = b.textContent.match(/^(.+?) \/ (.+?)$/))) {
				return a[pos];
			}
			return null;
		case 'pointed':
			if (b && (a = b.textContent.match(/^(.+?), (.+?)$/))) {
				return a[pos];
			}
			return null;
		case 'width':
			return b && b.style.display !== 'none' && parseInt(b.style.width) || 0;
		case 'titlenumre':
			if (b && (a = b.title.match(/(\d+)/))) {
				return +a[0] || 0;
			}
			return 0;
	}
};

ui_utils.generateLightboxSetup = function(type,target,callback) {
	var span = document.createElement('span');
	span.id = 'e_' + type + '_setup';
	span.className = 'em_font e_t_icon t_icon';
	span.innerText = '⚙';
	span.title = worker.GUIp_i18n['lb_' + type + '_title'];
	span.onclick = GUIp.common.createLightbox.bind(null,type,ui_storage,ui_words.base,callback);
	document.querySelector(target).insertBefore(span,null);
};

ui_utils.jqueryExtInit = function() {
	if (!worker.jQuery) {
		return;
	}
	// the code below is required for popup window of town informer
	(function(e) {
		e.fn.ernpopover = function(t) {
			var i = {openEvent: null, closeEvent: null, offsetX: 0, offsetY: 0},
		    t = e.extend(i, t),
		    n = e(t.header).detach(),
		    s = e(t.content).detach(),
		    a = e('<div class="popover"><div class="triangle"></div><div class="header wup-title"></div><div class="content"></div></div>');
			a.appendTo("body");
			e(".header", a).append(n);
			e(".content", a).append(s);
			if (e.fn.ernpopover.openedPopup) {
				e.fn.ernpopover.openedPopup.trigger("hidePopover");
			}
			e.fn.ernpopover.openedPopup = null;
			e(document).bind("click", function(t) {
				if (e.fn.ernpopover.openedPopup != null && e(t.target).parents(".popover").length === 0 && !e(t.target).hasClass("popover-button")) {
					e.fn.ernpopover.openedPopup.trigger("hidePopover");
				}
			});
			var o = function(i) {
				if (e.fn.ernpopover.openedPopup === i) {
					e.fn.ernpopover.openedPopup.trigger("hidePopover");
					return false;
				}
				if (e.fn.ernpopover.openedPopup != null) {
					e.fn.ernpopover.openedPopup.trigger("hidePopover");
				}
				var n = e(".triangle", a).click(function() {
					i.trigger("hidePopover");
				});
				a.css("display", "block");
				var s = 0,
					o = 0,
					r = e(document).width(),
					l = parseInt(n.css("border-bottom-width")),
					d = a.outerWidth(false),
					p = i.outerWidth(false),
					c = i.outerHeight(false),
					u = i.offset();
				o = u.top + c + l;
				var h = 18;
				s = u.left + (p - d) / 2;
				var f = 0;
				if (h > s) {
					f = s - h;
				} else if (s + d > r) {
					f = s + d - r + h;
				}
				n.css("right", d / 2 - l + f);
				a.offset({top: o + t.offsetY, left: s - f + t.offsetX});
				a.show();
				window.setTimeout(function() {
					a.addClass("active");
					e(window).resize();
				}, 0);
				if (e.isFunction(t.openEvent)) {
					t.openEvent();
				}
				e.fn.ernpopover.openedPopup = i,
				i.addClass("popover-on");
				return false;
			};
			this.each(function() {
				var i = e(this);
				i.addClass("popover-button");
				i.bind("showPopover", function() {
					o(i)
				});
				i.bind("hidePopover", function() {
					i.removeClass("popover-on");
					a.removeClass("active").attr("style", "").css("display", "none");
					if (e.isFunction(t.closeEvent)) {
						t.closeEvent();
					}
					e.fn.ernpopover.openedPopup = null;
					e(".fh_content", a).empty();
					window.setTimeout(function() {
						e(window).resize();
					}, 0);
					return false;
				});
			});
		};
	})(worker.jQuery);
}

// ui_timeout
var ui_timeout = worker.GUIp.timeout = {};

ui_timeout.bar = null;
ui_timeout.timeout = 0;
ui_timeout._finishDate = 0;
ui_timeout._tickInt = 0;
ui_timeout._tick = function() {
	if (Date.now() > this._finishDate) {
		worker.clearInterval(this._tickInt);
		if (this.bar.style.transitionDuration) {
			this.bar.style.transitionDuration = '';
		}
		this.bar.classList.remove('running');
		ui_utils.setVoiceSubmitState(!ui_improver.freezeVoiceButton.match('when_empty') || ui_utils.voiceInput.value, false);
	}
};
// creates timeout bar element
ui_timeout.create = function() {
	this.bar = document.createElement('div');
	this.bar.id = 'timeout_bar';
	document.body.insertBefore(this.bar, document.body.firstChild);
};
// starts timeout bar
ui_timeout.start = function() {
	var customTimeout = ui_storage.get('Option:voiceTimeout');
	worker.clearInterval(this._tickInt);
	this.bar.style.transitionDuration = '';
	this.bar.classList.remove('running');
	if (parseInt(customTimeout) > 0) {
		this.timeout = customTimeout;
		this.bar.style.transitionDuration = customTimeout + 's';
	} else {
		this.timeout = 20;
	}
	worker.setTimeout(ui_timeout._delayedStart, 10);
	this._finishDate = Date.now() + this.timeout*1000;
	this._tickInt = worker.setInterval(ui_timeout._tick.bind(this), 100);
	ui_utils.setVoiceSubmitState(ui_improver.freezeVoiceButton.match('after_voice'), true);
};
ui_timeout._delayedStart = function() {
	ui_timeout.bar.classList.add('running');
};


// ui_help
var ui_help = worker.GUIp.help = {};

ui_help.init = function() {
	ui_help._createHelpDialog();
	ui_help._createButtons();
};
// creates ui dialog
ui_help._createHelpDialog = function() {
	document.getElementById('menu_bar').insertAdjacentHTML('afterend',
		'<div id="ui_help" class="hint_bar" style="padding-bottom: 0.7em; display: none;">' +
		'<div class="hint_bar_capt"><b>Erinome Godville UI+ (v' + ui_data.currentVersion + ')</b>, ' + worker.GUIp_i18n.help_dialog_capt + '</div>' +
		'<div class="hint_bar_content" style="padding: 0.5em 0.8em;">'+
			'<div style="text-align: left;">' +
				'<div>' + worker.GUIp_i18n.how_to_update + '</div>' +
				'<ol>' +
					worker.GUIp_i18n['help_update_all'] +
				'</ol>' +
				'<div>' + worker.GUIp_i18n.help_useful_links + '</div>' +
				'<div>' + worker.GUIp_i18n.help_ci_links + '</div>' +
				'<div>' + worker.GUIp_i18n.help_reset_links + '</div>' +
			'</div>' +
		'</div>' +
		'<div class="hint_bar_close"></div></div>'
	);
	worker.$('#checkUIUpdate').click(function() { ui_utils.checkVersion(ui_utils.informNoNewVersionAvailable, ui_utils.informNewVersionAvailable, ui_utils.informVersionCheckFailed); return false; });
	worker.$('#checkCIExpression').click(ui_informer.checkCustomExpression.bind(ui_informer));
	worker.$('#resetGVSettings').click(function() { if (worker.confirm(worker.GUIp_i18n.reset_gv_settings)) { ui_storage.clear('Godville'); }; return false; });
	worker.$('#resetUISettings').click(function() { if (worker.confirm(worker.GUIp_i18n.reset_ui_settings)) { ui_storage.clear('eGUI'); }; return false; });
	if (ui_storage.get('helpDialogVisible')) { worker.$('#ui_help').show(); }
};
ui_help._createButtons = function() {
	var menu_bar = document.querySelector('#menu_bar ul > li:last-child');
	menu_bar.insertAdjacentHTML('beforebegin', '<li><a href="user/profile#ui_settings" target="_blank">' + worker.GUIp_i18n.ui_settings_top_menu + '</a></li> | <li></li> | ');
	ui_help._addToggleButton(document.querySelector('#menu_bar ul > li:nth-last-child(2)'), '<strong>' + worker.GUIp_i18n.ui_help + '</strong>');
	if (ui_storage.get('Option:enableDebugMode')) {
		ui_help._addDumpButton('<span>dump: </span>', 'all');
		ui_help._addDumpButton('<span>, </span>', 'options', 'Option');
		ui_help._addDumpButton('<span>, </span>', 'logger', 'Logger');
		ui_help._addDumpButton('<span>, </span>', 'forum', 'Forum');
		ui_help._addDumpButton('<span>, </span>', 'log', 'Log:');
	}
	ui_help._addToggleButton(document.getElementsByClassName('hint_bar_close')[0], worker.GUIp_i18n.close);
};
// gets toggle button
ui_help._addToggleButton = function(elem, text) {
	elem.insertAdjacentHTML('beforeend', '<a class="close_button">' + text + '</a>');
	elem.getElementsByClassName('close_button')[0].onclick = function() {
		ui_help.toggleDialog();
		return false;
	};
};
// gets dump button with a given label and selector
ui_help._addDumpButton = function(text, label, selector) {
	var hint_bar_content = document.getElementsByClassName('hint_bar_content')[0];
	hint_bar_content.insertAdjacentHTML('beforeend', text + '<a class="devel_link" id="dump_' + label + '">' + label + '</a>');
	document.getElementById('dump_' + label).onclick = function() {
		ui_storage.dump(selector);
	};
};
ui_help.toggleDialog = function(visible) {
	ui_storage.set('helpDialogVisible', !ui_storage.get('helpDialogVisible'));
	worker.$('#ui_help').slideToggle('slow');
};


// ui_storage
var ui_storage = worker.GUIp.storage = {};

ui_storage.init = function() {
	ui_storage.migrate();
	worker.addEventListener('storage', ui_improver.processExternalChanges, false);
}

ui_storage._get_key = function(key) {
	return 'eGUI_' + ui_data.god_name + ':' + key;
};
// gets diff with a value
ui_storage.diff = function(id, value) {
	var diff = null;
	var old = ui_storage.get(id);
	if (old !== null) {
		diff = value - old;
	}
	return diff;
};
// stores a value
ui_storage.set = function(id, value) {
	localStorage.setItem(ui_storage._get_key(id), value);
	return value;
};
// reads a value
ui_storage.get = function(id) {
	var val = localStorage.getItem(ui_storage._get_key(id));
	switch (val) {
		case 'true': return true;
		case 'false': return false;
		case 'null': return null;
		default: return val;
	}
};
// deletes single item from storage
ui_storage.remove = function(id) {
	return localStorage.removeItem(ui_storage._get_key(id));
};
// stores value and gets diff with old
ui_storage.set_with_diff = function(id, value) {
	var diff = ui_storage.diff(id, value);
	ui_storage.set(id, value);
	return diff;
};
// dumps all values related to current god_name
ui_storage.dump = function(selector) {
	var lines = [],
		regexp = '^eGUI_' + (selector ? (ui_data.god_name + ':' + selector) : '');
	for (var key in localStorage) {
		if (key.match(regexp)) {
			lines.push(key + ' = ' + localStorage.getItem(key));
		}
	}
	lines.sort();
	worker.console.info('Godville UI+: Storage:\n' + lines.join('\n'));
};
// resets saved options
ui_storage.clear = function(what) {
	if (!what || !what.match(/^(?:eGUI|Godville|All)$/)) {
		if (worker.GUIp_locale === 'ru') {
			worker.console.log('Godville UI+: использование storage.clear:\n' +
							   'storage.clear("eGUI") для удаление только настроек Godville UI+\n' +
							   'storage.clear("Godville") для удаления настроек Годвилля, сохранив настройки Godville UI+\n' +
							   'storage.clear("All") для удаления всех настроек');
		} else {
			worker.console.log('Godville UI+: storage.clear usage:\n' +
							   'storage.clear("eGUI") to remove Godville UI+ setting only\n' +
							   'storage.clear("Godville") to remove Godville setting and keep Godville UI+ settings\n' +
							   'storage.clear("All") to remove all setting');
		}
		return;
	}
	for (var key in localStorage) {
		if (what === 'eGUI' && key.match(/^eGUI_/) ||
			what === 'Godville' && !key.match(/^eGUI_/) ||
			what === 'All') {
			localStorage.removeItem(key);
		}
	}
	location.reload();
};
ui_storage._rename = function(from, to) {
	for (var key in localStorage) {
		if (key.match(from)) {
			localStorage.setItem(key.replace(from, to), localStorage.getItem(key));
			localStorage.removeItem(key);
		}
	}
};
ui_storage._delete = function(regexp) {
	for (var key in localStorage) {
		if (key.match(/^eGUI_/) && key.match(regexp)) {
			localStorage.removeItem(key);
		}
	}
};
ui_storage.migrate = function() {
	var mid = localStorage.getItem('eGUI_migrated'),
		midc = false;
	if (!mid) {
		ui_storage._rename(/^GUIp_/, 'eGUI_');
	}
	mid = localStorage.getItem('eGUI_migrated');
	if (!mid) {
		mid = '141115';
		midc = true;
	}
	if (mid < '150510') {
		ui_storage._delete(':Stats:');
		mid = '150510';
		midc = true;
	}
	if (mid < '151003') {
		var forum, topics = {};
		for (var key in localStorage) {
			if (key.match('Forum\\d')) {
				var godn = key.split(':')[0].substr(5);
				if (!topics[godn]) topics[godn] = {};
				forum = JSON.parse(localStorage.getItem(key));
				for (var topic in forum) {
					topics[godn][topic] = forum[topic];
				}
				localStorage.removeItem(key);
			}
		}
		for (var godn in topics) {
			localStorage.setItem('eGUI_' + godn + ':ForumSubscriptions', JSON.stringify(topics[godn]));
		}
		mid = '151003';
		midc = true;
	}
	if (mid < '160310') {
		var allInformers = ['full_godpower','much_gold','dead','low_health','fight','arena_available','dungeon_available','sail_available','selected_town','wanted_monster','special_monster','tamable_monster','chosen_monster','pet_knocked_out','close_to_boss','close_to_rival','guild_quest','mini_quest','custom_informers','arena_box','aura_box','black_box','treasure_box','boss_box','charge_box','coolstory_box','friend_box','gift_box','good_box','heal_box','invite','raidboss_box','quest_box','smelter','teleporter','temper_box','to_arena_box','transformer'];
		for (var key in localStorage) {
			if (key.match('Option:forbiddenInformers')) {
				var godn = key.split(':')[0].substr(5),
					oldInformers = localStorage.getItem(key).split(','),
					newInformers = {};
				for (var i = 0, len = allInformers.length; i < len; i++) {
					if (oldInformers.indexOf(allInformers[i]) < 0) {
						newInformers[allInformers[i]] = 48;
					}
				}
				if (newInformers['tamable_monster']) {
					newInformers['tamable_monster'] = 112;
				}
				localStorage.removeItem(key);
				localStorage.setItem('eGUI_' + godn + ':Option:activeInformers', JSON.stringify(newInformers));
			}
		}
		mid = '160310';
		midc = true;
	}
	if (mid < '160320') {
		ui_storage._delete(':LEMRestrictions:');
		mid = '160320';
		midc = true;
	}
	if (mid < '170200') {
		var oldValue, customWords = [['custom_informers','title'],['custom_craft','t'],['ally_blacklist','n']];
		for (var key in localStorage) {
			for (var i = 0, len = customWords.length; i < len; i++) {
				if (key.match('CustomWords:' + customWords[i][0])) {
					oldValue = JSON.parse(localStorage.getItem(key));
					for (var j = 0, len2 = oldValue.length; j < len2; j++) {
						if (oldValue[j][customWords[i][1]] && oldValue[j][customWords[i][1]][0] === '#') {
							oldValue[j].q = true;
							oldValue[j][customWords[i][1]] = oldValue[j][customWords[i][1]].substr(1);
						}
					}
					localStorage.setItem(key,JSON.stringify(oldValue));
				}
			}
		}		
		mid = '170200';
		midc = true;
	}
	if (midc) {
		localStorage.setItem('eGUI_migrated', mid);
	}
};


// ui_words
var ui_words = worker.GUIp.words = {};

ui_words.currentPhrase = '';
// gets words from phrases.js file and splits them into sections
ui_words.init = function() {
	var sect, text, customSects = ['pets','chosen_monsters','special_monsters','custom_craft','custom_informers'];
	if (ui_data.isFight) {
		customSects = ['ally_blacklist','custom_informers'];
	}
	this.base = worker.GUIp_words();
	for (sect in this.base.phrases) {
		text = ui_storage.get('CustomPhrases:' + sect);
		if (text && text !== "") {
			this.base.phrases[sect] = text.split("||");
		}
	}
	for (sect in customSects) {
		text = ui_storage.get('CustomWords:' + customSects[sect]);
		if (text && text !== "") {
			try {
				this.base[customSects[sect]] = JSON.parse(text,function(key,value) { return value === "Infinity" ? Infinity : value; });
			} catch (error) {
				worker.console.log('Error while parsing custom words section "'+customSects[sect]+'", resetting...');
				ui_storage.remove('CustomWords:' + customSects[sect]);
			}
		}
	}
};
ui_words._changeFirstLetter = function(text) {
	return text.charAt(0).toLowerCase() + text.slice(1);
};
ui_words._addHeroName = function(text) {
	if (!ui_storage.get('Option:useHeroName')) { return text; }
	return ui_data.char_name + ', ' + ui_words._changeFirstLetter(text);
};
ui_words._addExclamation = function(text) {
	if (!ui_storage.get('Option:useExclamations')) { return text; }
	return ui_utils.getRandomItem(this.base.phrases.exclamation) + ', ' + ui_words._changeFirstLetter(text);
};
// single phrase gen
ui_words._randomPhrase = function(sect) {
	return ui_utils.getRandomItem(this.base.phrases[sect]);
};
// single phrase gen for inverted direction
ui_words._randomPhraseInvDir = function(sect) {
	var replacement = [];
	switch (sect) {
		case 'go_north': sect = 'go_south'; replacement = ['↓','↑']; break;
		case 'go_south': sect = 'go_north'; replacement = ['↑','↓']; break;
		case 'go_west': sect = 'go_east'; replacement = ['→','←']; break;
		case 'go_east': sect = 'go_west'; replacement = ['←','→']; break;
	}
	if (ui_storage.get('Option:disableInvertedArrows')) {
		return ui_utils.getRandomItem(this.base.phrases[sect]);
	} else {
		return ui_utils.getRandomItem(this.base.phrases[sect]).replace(replacement[0],replacement[1]);
	}
};
ui_words._longPhrase_recursion = function(source, len) {
	while (source.length) {
		var next = ui_utils.popRandomItem(source);
		var remainder = len - next.length - 2; // 2 for ', '
		if (remainder > 0) {
			return [next].concat(ui_words._longPhrase_recursion(source, remainder));
		}
	}
	return [];
};
// main phrase constructor
ui_words.longPhrase = function(sect, item_name, len) {
	if (ui_storage.get('phrasesChanged')) {
		ui_words.init();
		ui_storage.set('phrasesChanged', 'false');
	}
	if (!ui_data.isFight && ['heal', 'pray', 'hit'].indexOf(sect) >= 0) {
		sect += '_field';
	}
	var prefix = ui_words._addHeroName(ui_words._addExclamation(''));
	var phrases;
	if (item_name) {
		phrases = [ui_words._randomPhrase(sect) + ' ' + item_name + '!'];
	} else if (sect.match(/go_/)) {
		if (document.getElementById('map') && document.getElementById('map').textContent.match(/Противоречия|Disobedience/)) {
			phrases = [ui_words._randomPhraseInvDir(sect)];
		} else {
			phrases = [ui_words._randomPhrase(sect)];
		}
	} else if (ui_storage.get('Option:useShortPhrases')) {
		phrases = [ui_words._randomPhrase(sect)];
	} else {
		phrases = ui_words._longPhrase_recursion(this.base.phrases[sect].slice(), (len || 100) - prefix.length);
	}
	this.currentPhrase = prefix ? prefix + ui_words._changeFirstLetter(phrases.join(' ')) : phrases.join(' ');
	return this.currentPhrase;
};
// inspect button phrase gen
ui_words.inspectPhrase = function(item_name) {
	return ui_words.longPhrase('inspect_prefix', item_name);
};
// craft button phrase gen
ui_words.craftPhrase = function(items) {
	return ui_words.longPhrase('craft_prefix', items);
};
// mnemonic voices processing
ui_words.mnemoVoice = function() {
	if (ui_storage.get('phrasesChanged')) {
		ui_words.init();
		ui_storage.set('phrasesChanged', 'false');
	}
	if (!this.base.phrases.mnemonics.length) {
		return;
	}
	var i, len, result, voiceInput = ui_utils.voiceInput.value.split('//'),
		defResult = this.base.phrases.mnemonics[0].split('//')[0];
	if (!ui_utils.voiceInput.value) {
		ui_utils.setVoice('// ' + defResult.trim(), true);
		return;
	}
	if (!voiceInput[1]) {
		voiceInput.unshift('');
	}
	result = this.mnemoLookup(voiceInput[1].trim());
	if (result) {
		ui_utils.setVoice((voiceInput[0].trim() + ' // ' + result.trim()).trim(), true);
	};
};
// mnemonics lookup
ui_words.mnemoLookup = function(request) {
	var i, len, mnemoline;
	// searching through mnemonics, return first case-insensitive match
	for (i = 0, len = this.base.phrases.mnemonics.length; i < len; i++) {
		mnemoline = this.base.phrases.mnemonics[i].split('//');
		if (mnemoline[1] && (request.toLowerCase() === mnemoline[1].trim().toLowerCase())) {
			return mnemoline[0];
		}
	}
	// full text search, return one phrase after full-string match
	for (i = 0, len = this.base.phrases.mnemonics.length; i < len; i++) {
		if (request === this.base.phrases.mnemonics[i].split('//')[0].trim()) {
			if ((i + 1) < len) {
				return this.base.phrases.mnemonics[i + 1].split('//')[0];
			} else {
				return this.base.phrases.mnemonics[0].split('//')[0];
			}
		}
	}
	// partial text search, return first case-insensitive partial match
	for (i = 0, len = this.base.phrases.mnemonics.length; i < len; i++) {
		mnemoline = this.base.phrases.mnemonics[i].split('//');
		if (mnemoline[0].trim().toLowerCase().indexOf(request.toLowerCase()) > -1) {
			return mnemoline[0];
		}
	}
	return null;
};
// Checkers
ui_words.usableItemType = function(desc) {
	return this.base.usable_items.descriptions.indexOf(desc);
};
ui_words.usableItemTypeMatch = function(desc,itype) {
	return (desc === this.base.usable_items.descriptions[this.base.usable_items.types.indexOf(itype)]);
};


// ui_stats
var ui_stats = worker.GUIp.stats = {};

ui_stats.Ark_F = function() {
	return parseInt(ui_utils.getStat('#hk_ark_m .l_val','pointed',2)) || 0;
};
ui_stats.Ark_M = function() {
	return parseInt(ui_utils.getStat('#hk_ark_m .l_val','pointed',1)) || 0;
};
ui_stats.Bricks = function() {
	var a = ui_utils.getStat('#hk_bricks_cnt .l_val','dec');
	return parseInt(a === 1000 ? 1000 : a * 10) || 0;
};
ui_stats.Charges =
ui_stats.Map_Charges =
ui_stats.Hero_Charges = function() {
	return ui_utils.getStat('#cntrl .acc_val','num') || 0;
};
ui_stats.Death = function() {
	return ui_utils.getStat('#hk_death_count .l_val','num') || 0;
};
ui_stats.Enemy_Godname = function() {
	return ui_utils.getStat('#o_hk_godname .l_val a','text') || '';
};
ui_stats.Enemy_Gold = function() {
	return ui_utils.getStat('#o_hk_gold_we .l_val','numre') || 0;
};
ui_stats.Enemy_HP = function() {
	var a, b = document.querySelectorAll('#opps .opp_h'),
		hp = 0;
	if (!b.length) {
		return +ui_utils.getStat('#o_hl1 .l_val','slashed',1) || 0;
	}
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			hp += +a[1] || 0;
		}
	}
	return hp;
};
ui_stats.Enemy_MaxHP = function() {
	var a, b = document.querySelectorAll('#opps .opp_h'),
		mhp = 0;
	if (!b.length) {
		return +ui_utils.getStat('#o_hl1 .l_val','slashed',2) || 0;
	}
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			mhp += +a[2] || 0;
		}
	}
	return mhp;
};
ui_stats.Enemy_Inv = function() {
	return +ui_utils.getStat('#o_hk_inventory_num .l_val','slashed',1) || 0;
};
ui_stats.EnemySingle_HP = function(enemy) {
	var a, b = document.querySelectorAll('#opps .opp_h');
	if (b[enemy-1] && (a = b[enemy-1].textContent.match(/^(.+?) \/ (.+?)$/))) {
		return +a[1] || 0;
	}
	return 0;
};
ui_stats.EnemySingle_MaxHP = function(enemy) {
	var a, b = document.querySelectorAll('#opps .opp_h');
	if (b[enemy-1] && (a = b[enemy-1].textContent.match(/^(.+?) \/ (.+?)$/))) {
		return +a[2] || 0;
	}
	return 0;
};
ui_stats.EnemySingle_Name = function(enemy) {
	var a, b = document.querySelectorAll('#opps .opp_n:not(.opp_ng)');
	return b[enemy-1] && b[enemy-1].textContent || '';
};
ui_stats.Enemy_HasAbility = function(ability) {
	var a = document.querySelector('#o_hk_gold_we + .line .l_val');
	return a && a.textContent && !!a.textContent.match(new worker.RegExp(ability,'i'));
};
ui_stats.Enemy_HasAbilityLoc = function(ability) {
	return this.Enemy_HasAbility(ability);
};
ui_stats.Enemy_AbilitiesCount = function(ability) {
	var a = document.querySelector('#o_hk_gold_we + .line .l_val');
	return a && a.textContent && a.textContent.split(',').length || 0;
};
ui_stats.Enemy_Count = function() {
	var a = document.querySelectorAll('#opps .opp_n:not(.opp_ng)');
	return a && a.length || 0;
};
ui_stats.Enemy_AliveCount = function() {
	var a, b = document.querySelectorAll('#opps .opp_h'),
		alive = 0;
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			alive++;
		}
	}
	return alive;
};
ui_stats.Equip1 = function() {
	return ui_utils.getStat('#eq_0 .eq_level','num') || 0;
};
ui_stats.Equip2 = function() {
	return ui_utils.getStat('#eq_1 .eq_level','num') || 0;
};
ui_stats.Equip3 = function() {
	return ui_utils.getStat('#eq_2 .eq_level','num') || 0;
};
ui_stats.Equip4 = function() {
	return ui_utils.getStat('#eq_3 .eq_level','num') || 0;
};
ui_stats.Equip5 = function() {
	return ui_utils.getStat('#eq_4 .eq_level','num') || 0;
};
ui_stats.Equip6 = function() {
	return ui_utils.getStat('#eq_5 .eq_level','num') || 0;
};
ui_stats.Equip7 = function() {
	return ui_utils.getStat('#eq_6 .eq_level','num') || 0;
};
ui_stats.Exp =
ui_stats.Map_Exp =
ui_stats.Hero_Exp = function() {
	return ui_utils.getStat('#hk_level .p_bar','titlenumre') || 0;
};
ui_stats.Godpower = function() {
	return ui_utils.getStat('#cntrl .gp_val','num') || 0;
};
ui_stats.Gold =
ui_stats.Map_Gold =
ui_stats.Hero_Gold = function() {
	return ui_utils.getStat('#hk_gold_we .l_val','numre') || 0;
};
ui_stats.Map_Alls_HP =
ui_stats.Hero_Alls_HP = function() {
	var a, b = document.querySelectorAll('#alls .opp_h'),
		hp = 0;
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			hp += +a[1] || 0;
		}
	}
	return hp;
};
ui_stats.Map_Ally_HP =
ui_stats.Hero_Ally_HP = function(ally) {
	var a, b = document.querySelectorAll('#alls .opp_h');
	if (b[ally-1] && (a = b[ally-1].textContent.match(/^(.+?) \/ (.+?)$/))) {
		return +a[1] || 0;
	}
	return 0;
};
ui_stats.Hero_Alls_MaxHP = function() {
	var a, b = document.querySelectorAll('#alls .opp_h'),
		mhp = 0;
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			mhp += +a[2] || 0;
		}
	}
	return mhp;
};
ui_stats.Map_Ally_MaxHP =
ui_stats.Hero_Ally_MaxHP = function(ally) {
	var a, b = document.querySelectorAll('#alls .opp_h');
	if (b[ally-1] && (a = b[ally-1].textContent.match(/^(.+?) \/ (.+?)$/))) {
		return +a[2] || 0;
	}
	return 0;
};
ui_stats.Hero_Alls_Count = function() {
	var a = document.querySelectorAll('#alls .opp_n:not(.opp_ng)');
	return a && a.length || 0;
};
ui_stats.Hero_Alls_AliveCount = function() {
	var a, b = document.querySelectorAll('#alls .opp_h'),
		alive = 0;
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			alive++;
		}
	}
	return alive;
};
ui_stats.Hero_Alls_AliveMaxHP = function() {
	var a, b = document.querySelectorAll('#alls .opp_h'),
		mhp = 0;
	for (var i = 0, len = b.length; i < len; i++) {
		if (a = b[i].textContent.match(/^(.+?) \/ (.+?)$/)) {
			mhp += +a[2] || 0;
		}
	}
	return mhp;
};
ui_stats.Hero_Ally_Name = function(ally) {
	var a, b = document.querySelectorAll('#alls .opp_n:not(.opp_ng)');
	if (this.isSail()) {
		return b[ally-1] && b[ally-1].textContent.substr(3) || '';
	} else {
		return b[ally-1] && b[ally-1].textContent || '';
	}
};
ui_stats.HP =
ui_stats.Map_HP =
ui_stats.Hero_HP = function() {
	return +ui_utils.getStat('#hk_health .l_val','slashed',1) || 0;
};
ui_stats.Inv =
ui_stats.Map_Inv =
ui_stats.Hero_Inv = function() {
	return +ui_utils.getStat('#hk_inventory_num .l_val','slashed',1) || 0;
};
ui_stats.Map_Supplies = function() {
	return +ui_utils.getStat('#hk_water .l_val','slashed',1) || 0;
};
ui_stats.Map_MaxSupplies = function() {
	return +ui_utils.getStat('#hk_water .l_val','slashed',2) || 0;
};
ui_stats.Level = function() {
	return ui_utils.getStat('#hk_level .l_val','num') || 0;
};
ui_stats.Logs = function() {
	return ui_utils.getStat('#hk_wood .l_val','dec') * 10 || 0;
};
ui_stats.Max_Godpower = function() {
	return ui_data.hasShop ? 200 : 100;
};
ui_stats.Max_HP = function() {
	return +ui_utils.getStat('#hk_health .l_val','slashed',2) || 0;
};
ui_stats.Max_Inv = function() {
	return +ui_utils.getStat('#hk_inventory_num .l_val','slashed',2) || 0;
};
ui_stats.Monster = function() {
	return ui_utils.getStat('#hk_monsters_killed .l_val','num') || 0;
};
ui_stats.Pet_Level = function() {
	return ui_utils.getStat('#hk_pet_class + div .l_val','num') || 0;
};
ui_stats.Pet_NameType = function() {
	var pName = ui_utils.getStat('#hk_pet_name .l_val','text') || '',
		pType = ui_utils.getStat('#hk_pet_class .l_val','text') || '';
	return (pName.match(/^(.*?)(\ «.+»)?(\ “.+”)?(\ ❌)?$/) || [null,''])[1] + ':' + pType;
};
ui_stats.Task = function() {
	return ui_utils.getStat('#hk_quests_completed .p_bar','titlenumre') || 0;
};
ui_stats.Task_Name = function() {
	return ui_utils.getStat('#hk_quests_completed .q_name','text') || '';
};
ui_stats.Trader_Exp = function() {
	return ui_utils.getStat('#hk_t_level .p_bar','titlenumre') || 0;
};
ui_stats.Trader_Level = function() {
	return ui_utils.getStat('#hk_t_level .l_val','num') || 0;
};
ui_stats.Savings = function() {
	var a, b = ui_utils.getStat('#hk_retirement .l_val','text') || '';
	if (a = b.match(/^((\d+)M,? ?)?(\d+)?k?$/i)) {
		return 1000 * (a[2] || 0) + 1 * (a[3] || 0)
	} else {
		return parseInt(b) || 0;
	}
};

ui_stats.auraName = function() {
	var a, b = document.getElementById('hk_distance');
	if (b && b.previousSibling && (a = b.previousSibling.textContent.match(/^(Аура|Aura)(.*?)\ \(.*?\)$/))) {
		return a[2] || ''
	}
	return '';
};
ui_stats.auraDuration = function() {
	var a, b = document.getElementById('hk_distance');
	if (b && b.previousSibling && (a = b.previousSibling.textContent.match(/^(Аура|Aura).*?\((\d+):(\d+)\)$/))) {
		return (parseInt(a[2]) * 3600 + parseInt(a[3]) * 60) || 0;
	}
	return 0;
};
ui_stats.currentStep = function() {
	var a, b = document.querySelector('#m_fight_log h2');
	if (b && (a = b.textContent.match(/\((шаг|step) (\d+)\)$/))) {
		return +a[2];
	}
	return 0;
};
ui_stats.charName = function() {
	if (this.isSail()) {
		if (this._sailCharName) {
			return this._sailCharName;
		}
		var n, pt = document.querySelector('.dir_arrow');
		if (pt && (n = pt.classList.toString().match(/pl(\d)/))) {
			var a = document.querySelectorAll('#alls .opp_n:not(.opp_ng)');
			if (a[+n[1]-1] && a[+n[1]-1].textContent.substr(3)) {
				this._sailCharName = a[+n[1]-1].textContent.substr(3);
				return this._sailCharName;
			}
		}
	}
	return ui_utils.getStat('#hk_name .l_val','text') || '';
};
ui_stats.checkShop = function() {
	var a = document.querySelector('#trader > .block_content');
	return a && a.firstChild ? true : false;
}

ui_stats.fightType = function() {
	if (this.isFight()) {
		var mfl = document.querySelector('#m_fight_log h2');
		if (document.getElementById('map') && document.getElementById('map').style.display != 'none') {
			return 'dungeon';
		} else if (document.getElementById('s_map') && document.getElementById('s_map').style.display != 'none') {
			return 'sail';
		} else if (mfl && mfl.textContent.match('Тренировочный бой|Sparring Chronicle')) {
			return 'spar';
		} else if (mfl && mfl.textContent.match('Вести с арены|Arena Journal')) {
			return 'arena';
		} else if (this.Enemy_Godname().length > 0) {
			return 'player';
		} else if (this.Hero_Alls_Count() === 0 && this.Enemy_Count() > 1) {
			return 'multi_monster';
		} else {
			return 'monster';
		}
	}
	return '';
};
ui_stats.godName = function() {
	var result, a, b = ui_utils.getStat('#hk_name a, #hk_godname a','href') || '';
	if (a = b.match(/\/([^\/]+)$/)) {
		result = decodeURIComponent(a[1]) || '';
	}
	if (!result) {
		if (a = ui_data.docTitle.match(/(?:\([!@~]\) )?(.*?)(?: и е(го|ё) геро| and h(is|er) hero)/)) {
			return a[1].trim();
		}
		return GUIp.common.getCurrentGodname();
	}
	return result;
};
ui_stats.guildName = function() {
	return ui_utils.getStat('#hk_clan a','text') || '';
};
ui_stats.goldTextLength = function() {
	return (ui_utils.getStat('#hk_gold_we .l_val','text') || '').length;
};
ui_stats.hasArk = function() {
	return this.Logs() >= 1000;
};
ui_stats.hasTemple = function() {
	return this.Bricks() === 1000;
}
ui_stats.heroHasPet = function() {
	return (ui_utils.getStat('#hk_pet_class .l_val','text') || '').length > 0;
};
ui_stats.isArenaAvailable = function() {
	var a = document.querySelector('.arena_link_wrap a');
	return a && a.classList.contains('div_link') && a.style.display !== 'none';
};
ui_stats.isSparAvailable = function() {
	var a = document.querySelector('.e_challenge_button a');
	return a && a.classList.contains('div_link') && a.style.display !== 'none';
};
ui_stats.isDungeonAvailable = function() {
	var a = document.querySelector('.e_dungeon_button a');
	return a && a.classList.contains('div_link') && a.style.display !== 'none';
};
ui_stats.isSailAvailable = function() {
	var a = document.querySelector('.e_sail_button a');
	return a && a.classList.contains('div_link') && a.style.display !== 'none';
};
ui_stats.isFight = function() {
	return !!ui_data.docTitle.match(/^\([!@~]\)\ /);
};
ui_stats.isBossFight = function() {
	return this.fightType() === 'monster';
};
ui_stats.isDungeon = function() {
	return this.fightType() === 'dungeon';
};
ui_stats.isSail = function() {
	return this.fightType() === 'sail';
};
ui_stats.isMale = function() {
	return !document.querySelector('#stats h2, #m_info h2').textContent.match(/(героиня|heroine)/i);
};
ui_stats.isGoingBack = function() {
	return !!(ui_utils.getStat('#hk_distance .l_capt','text') || '').match(/(до столицы|to Pass)/i);
};
ui_stats.lastDiary = function() {
	var a = [], b = document.querySelectorAll('#diary .d_msg');
	for (var i = 0, len = b.length; i < len; i++) {
		a.push(b[i].textContent);
	}
	return a;
};
ui_stats.lastNews = function() {
	return ui_utils.getStat('.f_news.line','text') || '';
};
ui_stats.logId = function() {
	var a, b = ui_utils.getStat('#fbclink','href') || '';
	if (a = b.match(/\/([^\/]+)$/)) {
		return decodeURIComponent(a[1]) || '';
	}
	return '';
};
ui_stats.mileStones = function() {
	return ui_utils.getStat('#hk_distance .l_val','num') || 0;
};
ui_stats.monsterName = function() {
	var a = document.querySelector('#news .line .l_val');
	return a && a.parentNode.style.display !== 'none' && a.textContent || '';
};
ui_stats.nearbyTown = function() {
	return ((ui_utils.getStat('#hk_distance .l_val','title') || '').split(':')[1] || '').trim();
};
ui_stats.petIsKnockedOut = function() {
	var pName = ui_utils.getStat('#hk_pet_name .l_val','text') || '';
	return pName.match(/(\ ❌)$/) && true || false;
};
ui_stats.mProgress = function() {
	return ui_utils.getStat('#news .line .p_val','width') || 0;
};
ui_stats.sProgress = function() {
	return ui_utils.getStat('#news .p_bar.n_pbar .p_val','width') || 0;
};
ui_stats.progressDiff = function() {
	return Math.abs(ui_stats.sProgress() - ui_stats.Task());
};
ui_stats.sendDelayArena = function() {
	var sendToStr, sendToDesc = document.querySelector('#cntrl2 span.to_arena');
	if (sendToDesc && sendToDesc.style.display !== 'none') {
		if (sendToStr = sendToDesc.textContent.match(/(Арена откроется через|Arena available in) (?:(\d+)(?:h| ч) )?(?:(\d+)(?:m| мин))/)) {
			return ((sendToStr[2] !== undefined ? +sendToStr[2] : 0) * 60 + +sendToStr[3]) * 60 || 0;
		}
	}
	return 0;
};
ui_stats.sendDelayDungeon = function() {
	var sendToStr, sendToDesc = document.querySelectorAll('#cntrl2 div.arena_msg');
	for (var i = 0, len = sendToDesc.length; i < len; i++) {
		if (sendToDesc[i].style.display === 'none') {
			continue;
		}
		if (sendToStr = sendToDesc[i].textContent.match(/(Подземелье откроется через|Dungeon available in) (?:(\d+)(?:h| ч) )?(?:(\d+)(?:m| мин))/)) {
			return ((sendToStr[2] !== undefined ? +sendToStr[2] : 0) * 60 + +sendToStr[3]) * 60 || 0;
		}
	}
	return 0;
};
ui_stats.sendDelaySail = function() {
	var sendToStr, sendToDesc = document.querySelectorAll('#cntrl2 div.arena_msg');
	for (var i = 0, len = sendToDesc.length; i < len; i++) {
		if (sendToDesc[i].style.display === 'none') {
			continue;
		}
		if (sendToStr = sendToDesc[i].textContent.match(/(Отплыть можно через|Sail available in) (?:(\d+)(?:h| ч) )?(?:(\d+)(?:m| мин))/)) {
			return ((sendToStr[2] !== undefined ? +sendToStr[2] : 0) * 60 + +sendToStr[3]) * 60 || 0;
		}
	}
	return 0;
};
ui_stats.sendDelaySpar = function() {
	var sendToStr, sendToDesc = document.querySelectorAll('#cntrl2 div.arena_msg');
	for (var i = 0, len = sendToDesc.length; i < len; i++) {
		if (sendToDesc[i].style.display === 'none') {
			continue;
		}
		if (sendToStr = sendToDesc[i].textContent.match(/(Тренировка через|Sparring available in) (?:(\d+)(?:h| ч) )?(?:(\d+)(?:m| мин))/)) {
			return ((sendToStr[2] !== undefined ? +sendToStr[2] : 0) * 60 + +sendToStr[3]) * 60 || 0;
		}
	}
	return 0;
};
ui_stats.storedPets = function() {
	return ui_data.storedPets || [];
};
ui_stats.townName = function() {
	var a = ui_utils.getStat('#hk_distance .l_val','text') || '';
	return isNaN(parseInt(a)) && a || '';
};


/*ui_stats._cache = {};
for (var name in ui_stats) {
	var method = ui_stats[name];
	if (typeof method === "function") {
		ui_stats[name] = (function(method,name) { return function() { var args = Array.prototype.join.call(arguments); return ui_stats._cache[name+args] !== undefined ? ui_stats._cache[name+args] : (ui_stats._cache[name+args] = method.apply(this, arguments)); }; })(method,name);
	}
}*/

// ui_logger
var ui_logger = worker.GUIp.logger = {};

ui_logger.create = function() {
	this.updating = false;
	this.bar = worker.$('<ul id="logger" style="mask: url(#fader_masking);"/>');
	worker.$('#menu_bar').after(this.bar);
	if (ui_storage.get('Option:disableLogger')) {
		this.bar.hide();
	} else {
		this.bar.html('&#8203;');
	}
	this.need_separator = false;
	this.dungeonWatchers = [
		['Map_HP', 'hp', worker.GUIp_i18n.hero_health, 'hp'],
		['Map_Exp', 'exp', worker.GUIp_i18n.exp, 'exp'],
		['Map_Inv', 'inv', worker.GUIp_i18n.inventory, 'inv'],
		['Map_Gold', 'gld', worker.GUIp_i18n.gold, 'gold'],
		['Map_Charges', 'ch', worker.GUIp_i18n.charges, 'charges'],
		['Map_Alls_HP', 'a:hp', worker.GUIp_i18n.allies_health, 'allies']
	];
	this.battleWatchers = [
		['Hero_HP', 'h:hp', worker.GUIp_i18n.hero_health, 'hp'],
		['Enemy_HP', 'e:hp', worker.GUIp_i18n.enemy_health, 'death'],
		['Hero_Alls_HP', 'a:hp', worker.GUIp_i18n.allies_health, 'allies'],
		['Hero_Inv', 'h:inv', worker.GUIp_i18n.inventory, 'inv'],
		['Hero_Gold', 'h:gld', worker.GUIp_i18n.gold, 'gold'],
		['Hero_Charges', 'ch', worker.GUIp_i18n.charges, 'charges'],
		['Enemy_Gold', 'e:gld', worker.GUIp_i18n.gold, 'monster'],
		['Enemy_Inv', 'e:inv', worker.GUIp_i18n.inventory, 'monster']
	];
	this.sailWatchers = [
		['Map_HP', 'hp', worker.GUIp_i18n.hero_health, 'hp'],
		['Map_Supplies', 'spl', worker.GUIp_i18n.supplies, 'exp'],
		['Map_Charges', 'ch', worker.GUIp_i18n.charges, 'charges'],
		['Map_Alls_HP', 'a:hp', worker.GUIp_i18n.allies_health, 'allies'],
		['Enemy_HP', 'e:hp', worker.GUIp_i18n.enemy_health, 'death']
	];
	this.shopWatchers = [
		['HP', 'hp', worker.GUIp_i18n.health],
		['Charges', 'ch', worker.GUIp_i18n.charges],
		['Logs', 'wd', worker.GUIp_i18n.logs],
		['Hero_Inv', 'tr:inv', worker.GUIp_i18n.inventory, 'inv'],
		['Hero_Gold', 'tr:gld', worker.GUIp_i18n.gold, 'gold'],
		['Trader_Exp', 'tr:exp', worker.GUIp_i18n.trader_exp, 'exp'],
		['Trader_Level', 'tr:lvl', worker.GUIp_i18n.trader_level, 'level']
	];
	this.fieldWatchers = [
		['Exp', 'exp', worker.GUIp_i18n.exp],
		['Level', 'lvl', worker.GUIp_i18n.level],
		['HP', 'hp', worker.GUIp_i18n.health],
		['Charges', 'ch', worker.GUIp_i18n.charges],
		['Task', 'tsk', worker.GUIp_i18n.task],
		['Monster', 'mns', worker.GUIp_i18n.monsters],
		['Inv', 'inv', worker.GUIp_i18n.inventory],
		['Gold', 'gld', worker.GUIp_i18n.gold],
		['Bricks', 'br', worker.GUIp_i18n.bricks],
		['Logs', 'wd', worker.GUIp_i18n.logs],
		['Savings', 'rtr', worker.GUIp_i18n.savings],
		['Equip1', 'eq1', worker.GUIp_i18n.weapon, 'equip'],
		['Equip2', 'eq2', worker.GUIp_i18n.shield, 'equip'],
		['Equip3', 'eq3', worker.GUIp_i18n.head, 'equip'],
		['Equip4', 'eq4', worker.GUIp_i18n.body, 'equip'],
		['Equip5', 'eq5', worker.GUIp_i18n.arms, 'equip'],
		['Equip6', 'eq6', worker.GUIp_i18n.legs, 'equip'],
		['Equip7', 'eq7', worker.GUIp_i18n.talisman, 'equip'],
		['Death', 'death', worker.GUIp_i18n.death_count],
		['Pet_Level', 'pet_level', worker.GUIp_i18n.pet_level, 'monster'],
		['Ark_M', 'ark:m', worker.GUIp_i18n.ark_creatures, 'exp'],
		['Ark_F', 'ark:f', worker.GUIp_i18n.ark_creatures, 'exp'],
		['Trader_Exp', 'tr:exp', worker.GUIp_i18n.trader_exp, 'exp'],
		['Trader_Level', 'tr:lvl', worker.GUIp_i18n.trader_level, 'level']
	];
	this.commonWatchers = [
		['Godpower', 'gp', worker.GUIp_i18n.godpower]
	];
};
ui_logger._appendStr = function(id, klass, str, descr) {
	// append separator if needed
	if (this.need_separator) {
		this.need_separator = false;
		if (this.bar.children().length > 0) {
			this.bar.append('<li class="separator"> |</li>');
		}
	}
	// append string
	this.bar.append('<li class="' + klass + '" title="' + descr + '"> ' + str + '</li>');
	while (worker.$('#logger li:first').length && this.bar[0].scrollWidth > this.bar[0].getBoundingClientRect().width + 100 || worker.$('#logger li:first').hasClass("separator")) {
	  worker.$('#logger li:first').remove();
	}
	this.bar[0].scrollLeft = this.bar[0].scrollWidth - this.bar[0].getBoundingClientRect().width;
};
ui_logger._watchStatsValue = function(id, name, descr, klass) {
	klass = (klass || id).toLowerCase();
	var i, j, len, len2, diff;
	if (name === 'a:hp' && (!ui_storage.get('Option:sumAlliesHp') || ui_data.isSail)) {
		var damageData = [];
		a_loop:
		for (i = 1, len = ui_stats.Hero_Alls_Count(); i <= len; i++)
		{
			diff = ui_storage.set_with_diff('Logger:'+(id === 'Hero_Alls_HP' ? 'Hero' : 'Map')+'_Ally'+i+'_HP', ui_stats.Hero_Ally_HP(i));
			if (diff) {
				if (!ui_data.isSail) {
					damageData.push({ num: i, diff: diff, cnt: 0, fuzz: 0, cntf: 0 });
				} else {
					// don't display our own hp in allies block
					if (ui_stats.Hero_Ally_Name(i) === ui_stats.charName()) {
						continue a_loop;
					}
					// don't display ally hp when we're in fight with that agressive so-called ally (or maybe it's we who are agressive, but anyway)
					for (j = 1, len2 = ui_stats.Enemy_Count(); j <= len2; j++) {
						if (ui_stats.Hero_Ally_Name(i) === ui_stats.EnemySingle_Name(j)) {
							continue a_loop;
						}
					}
					ui_logger._appendStr(id, klass, 'a' + (len > 1 ? i : '') + ':hp' + (diff > 0 ? '+' : '') + diff, descr);
				}
			}
		}
		if (!damageData.length) {
			return;
		}
		for (i = 0, len = damageData.length; i < len; i++) {
			for (j = (i + 1); j < damageData.length; j++) {
				if (damageData[j].processed) {
					continue;
				}
				if (damageData[i].diff === damageData[j].diff) {
					damageData[i].cnt++;
					damageData[j].processed = true;
				} else if (Math.abs(damageData[i].diff - damageData[j].diff) < 3) {
					damageData[i].cntf++;
					damageData[i].fuzz = (damageData[i].fuzz ? damageData[i].fuzz : damageData[i].diff) + damageData[j].diff;
					damageData[j].processed = true;
				}
			}
		}
		damageData.sort(function(a,b) {return a.cnt === b.cnt ? a.num - b.num : b.cnt - a.cnt;});
		for (i = 0, len = damageData.length; i < len; i++) {
			if (damageData[i].processed) {
				continue;
			}
			if (damageData[i].fuzz) {
				ui_logger._appendStr(id, klass, 'a:hp' + (damageData[i].fuzz > 0 ? '⨦' : '≂') + Math.abs(Math.round((damageData[i].fuzz + damageData[i].diff * damageData[i].cnt)/(damageData[i].cnt + damageData[i].cntf + 1))) + 'x' + (damageData[i].cnt + damageData[i].cntf + 1), descr);
			} else if (damageData[i].cnt > 0) {
				ui_logger._appendStr(id, klass, 'a:hp' + (damageData[i].diff > 0 ? '+' : '') + damageData[i].diff + 'x' + (damageData[i].cnt + 1), descr);
			} else {
				ui_logger._appendStr(id, klass, 'a' + damageData[i].num + ':hp' + (damageData[i].diff > 0 ? '+' : '') + damageData[i].diff, descr);
			}
		}
		return;
	}
	if (name === 'e:hp' && (!ui_storage.get('Option:sumAlliesHp') || ui_data.isSail)) {
		for (i = 1, j = 1, len = ui_stats.Enemy_Count(); i <= len; i++)
		{
			diff = ui_storage.set_with_diff('Logger:Enemy'+i+'_HP', ui_stats.EnemySingle_HP(i));
			if (diff) {
				if (!ui_data.isSail) {
					ui_logger._appendStr(id, klass, 'e' + (len > 1 ? i : '') + ':hp' + (diff > 0 ? '+' : '') + diff, descr);
				} else {
					// in sail, we're not only ally to ourselves, but also an enemy too! cool, right?
					if (ui_stats.EnemySingle_Name(i) === ui_stats.charName()) {
						continue;
					}
					// in sail we do have different enemies without page reloading, so as a workaround we'll just silently update saved hp
					// when the name of current enemy[i] doesn't match with previously saved enemy[i]
					if (ui_stats.EnemySingle_Name(i) !== ui_storage.get('Logger:Enemy'+i+'_Name')) {
						ui_storage.set('Logger:Enemy'+i+'_Name', ui_stats.EnemySingle_Name(i));
						continue;
					}
					ui_logger._appendStr(id, klass, 'e' + j++ + ':hp' + (diff > 0 ? '+' : '') + diff, descr);
				}
			}
		}
		return;
	}
	var s;
	diff = ui_storage.set_with_diff('Logger:' + id, ui_stats[id]());
	if (diff) {
		// decimals parsing? todo: check if it's still required
		if (parseInt(diff) !== diff) { diff = diff.toFixed(1); }
		// adding signs or arrows when needed
		if (diff < 0) {
			if (name === 'exp' && +ui_storage.get('Logger:Level') !== ui_stats.Level()) {
				s = '→' + ui_stats.Exp();
			} else if (name === 'tsk' && ui_storage.get('Logger:Task_Name') !== ui_stats.Task_Name()) {
				ui_storage.set('Logger:Task_Name', ui_stats.Task_Name());
				s = '→' + ui_stats.Task();
			} else if (name === 'tr:exp' && ui_storage.get('Logger:Trader_Level') !== ui_stats.Trader_Level()) {
				s = '→' + ui_stats.Trader_Exp();
			} else if (name === 'spl' && diff === -1) {
				return;
			} else {
				s = diff;
			}
		} else {
			s = '+' + diff;
		}
		// when changing a pet we shouldn't display a signed diff
		if (name === 'pet_level' && ui_storage.get('Logger:Pet_NameType') !== ui_stats.Pet_NameType()) {
			ui_storage.set('Logger:Pet_NameType',ui_stats.Pet_NameType());
			s = '→' + (ui_stats.Pet_Level() || 0);
		}
		ui_logger._appendStr(id, klass, name + s, descr);
	}
};
ui_logger._updateWatchers = function(watchersList) {
	for (var i = 0, len = watchersList.length; i < len; i++) {
		ui_logger._watchStatsValue.apply(this, watchersList[i]);
	}
};
ui_logger.update = function() {
	if (document.getElementById('search_block') && document.getElementById('search_block').offsetParent !== null) {
		return;
	}
	if (ui_storage.get('Option:disableLogger')) {
		return;
	}
	if (ui_data.isDungeon) {
		ui_logger._updateWatchers(this.dungeonWatchers);
	} else if (ui_data.isSail) {
		ui_logger._updateWatchers(this.sailWatchers);
	} else if (ui_data.isFight) {
		ui_logger._updateWatchers(this.battleWatchers);
	} else if (ui_data.inShop) {
		ui_logger._updateWatchers(this.shopWatchers);
	} else {
		if (ui_data.lastFieldInit) {
			// check if digest is required
			if (ui_data.lastFieldInit > 172800000) {
				// suppress some values so digest won't get overflown
				var supList = ['HP','Godpower','Gold','Inv','Task','Equip1','Equip2','Equip3','Equip4','Equip5','Equip6','Equip7'];
				for (var i = 0, len = supList.length; i < len; i++) {
					ui_storage.set_with_diff('Logger:' + supList[i], ui_stats[supList[i]]());
				}
				// show ref date
				ui_logger._appendStr(null, 'exp', GUIp.common.formatTime(new Date(Date.now() - ui_data.lastFieldInit),'logger'), '');
				this.need_separator = true;
			}
			delete ui_data.lastFieldInit;
		}
		ui_logger._updateWatchers(this.fieldWatchers);
	}
	ui_logger._updateWatchers(this.commonWatchers);
	this.need_separator = true;
};


// ui_informer
var ui_informer = worker.GUIp.informer = {};

ui_informer.init = function() {
	//title saver
	this.title = document.title;
	//favicon saver
	this.favicon = document.querySelector('link[rel="shortcut icon"]');
	this.iconEmpty = this.iconGV = 'data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABmJLR0T///////8JWPfcAAAACXBIWXMAAABIAAAASABGyWs+AAAAF0lEQVRIx2NgGAWjYBSMglEwCkbBSAcACBAAAeaR9cIAAAAASUVORK5CYII=';
	// init actual icon
	/*var img = new Image();
	img.crossOrigin = 'Anonymous';
	img.onload = function() {
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		canvas.height = this.height;
		canvas.width = this.width;
		ctx.drawImage(this, 0, 0);
		ui_informer.iconGV = canvas.toDataURL('image/x-icon');
		canvas = null; 
	};
	img.src = 'images/favicon.ico';*/
	// container
	document.getElementById('main_wrapper').insertAdjacentHTML('afterbegin', '<div id="informer_bar" />');
	this.container = document.getElementById('informer_bar');
	// load
	ui_informer._load();
	// custom data
	ui_informer.initCustomInformersData();
	// forcefully update page title
	worker.setTimeout(function() { document.title = ui_informer._getTitleNotices() + ui_informer.title; }, 100);
};
ui_informer._load = function() {
	this.activeInformers = JSON.parse(ui_storage.get('Option:activeInformers') || '{}');
	this.flags = JSON.parse(ui_storage.get('informer_flags') || '{}');
	for (var flag in this.flags) {
		if (this.flags[flag] === 'e' || (flag.match(/^ci /) && !this.getCustomInformer(flag))) {
			delete this.flags[flag];
		}
	}
	ui_informer._save();
};
ui_informer._save = function() {
	ui_storage.set('informer_flags', JSON.stringify(this.flags));
};
ui_informer._createLabel = function(flag) {
	var id = flag.replace(/ /g, '_');
	this.container.insertAdjacentHTML('beforeend', '<div id="' + id + '">' + flag.replace(/^ci /,'') + '</div>');
	document.getElementById(id).onclick = function(e) {
		ui_informer.hide(flag);
		e.stopPropagation();
	};
};
ui_informer._deleteLabel = function(flag) {
	var label = document.getElementById(flag.replace(/ /g, '_'));
	if (label) {
		this.container.removeChild(label);
	}
};
ui_informer._tick = function() {
	// iterate through all the flags and choose enabled ones
	var activeFlags = [];
	for (var flag in this.flags) {
		if (this.flags[flag] === 'e') {
			activeFlags.push(flag.replace(/^ci /,''));
		}
	}
	activeFlags.sort();
	// update title if there're active informers
	if (activeFlags.length) {
		ui_informer._updateTitle(activeFlags);
		this.tref = worker.setTimeout(ui_informer._tick.bind(ui_informer), 700);
	} else {
		ui_informer.clearTitle();
		this.tref = 0;
	}
};
ui_informer.clearTitle = function() {
	for (var flag in this.flags) {
		if (this.flags[flag] === 'e') {
			return;
		}
	}
	document.title = ui_informer._getTitleNotices() + this.title;
	/*if (!this.favicon.href.match('images/favicon.ico')) {
		this.favicon.href = this.iconGV;
	}*/
};
ui_informer._getTitleNotices = function() {
	var forbidden_title_notices = ui_storage.get('Option:forbiddenTitleNotices') || '';
	var titleNotices = (!forbidden_title_notices.match('pm') ? ui_informer._getPMTitleNotice() : '') +
					   (!forbidden_title_notices.match('gm') ? ui_informer._getGMTitleNotice() : '') +
					   (!forbidden_title_notices.match('fi') ? ui_informer._getFITitleNotice() : '');
	return titleNotices ? titleNotices + ' ' : '';
};
ui_informer._getPMTitleNotice = function() {
	var pm = 0,
		pm_badge = document.querySelector('.fr_new_badge_pos');
	if (pm_badge && pm_badge.style.display !== 'none') {
		pm = +pm_badge.textContent;
	}
	var stars = document.querySelectorAll('.msgDock .fr_new_msg');
	for (var i = 0, len = stars.length; i < len; i++) {
		if (!stars[i].parentNode.getElementsByClassName('dockfrname')[0].textContent.match(/Гильдсовет|Guild Council/)) {
			pm++;
		}
	}
	return pm ? '[' + pm + ']' : '';
};
ui_informer._getGMTitleNotice = function() {
	var gm = document.getElementsByClassName('gc_new_badge')[0].style.display !== 'none',
		stars = document.querySelectorAll('.msgDock .fr_new_msg');
	for (var i = 0, len = stars.length; i < len; i++) {
		if (stars[i].parentNode.getElementsByClassName('dockfrname')[0].textContent.match(/Гильдсовет|Guild Council/)) {
			gm = true;
			break;
		}
	}
	return gm ? '[g]' : '';
};
ui_informer._getFITitleNotice = function() {
	return document.querySelector('#forum_informer_bar a') ? '[f]' : '';
};
ui_informer._updateTitle = function(activeFlags) {
	this.odd_tick = !this.odd_tick;
	var sep = this.odd_tick ? '!!!' : '...';
	document.title = ui_informer._getTitleNotices() + sep + ' ' + activeFlags.join('! ') + ' ' + sep;
	/*if (worker.GUIp_browser !== 'Opera') {
		this.favicon.href = this.odd_tick ? this.iconGV : this.iconEmpty;
	}*/
};
ui_informer._getDateGVT = function() {
	if (typeof ui_informer._dateGVT === 'undefined') {
		ui_informer._dateGVT = {offset: undefined, inreq: false, reqs: 0};
	}
	if (typeof ui_informer._dateGVT.offset === 'undefined' && ui_informer._dateGVT.inreq === false && ui_informer._dateGVT.reqs < 5) {
		ui_informer._dateGVT.inreq = true;
		ui_informer._dateGVT.reqs++;
		//GUIp.common.getXHR('//time.akamai.com/?iso',function(xhr){ui_informer._dateGVT.offset = (new Date(xhr.responseText) - new Date()) || 0; ui_informer._dateGVT.inreq = false;},function(){ui_informer._dateGVT.inreq = false;});
		GUIp.common.getXHR('/forum',function(xhr){ui_informer._dateGVT.offset = (new Date(xhr.getResponseHeader("Date")) - new Date()) || 0; ui_informer._dateGVT.inreq = false;},function(){ui_informer._dateGVT.inreq = false;});
	}
	return ui_informer._dateGVT.offset ? new Date((new Date).getTime() + ui_informer._dateGVT.offset) : new Date();
}
ui_informer.getInformerType = function(flag) {
	var type;
	if (flag.match(/^ci /)) {
		var informer = this.getCustomInformer(flag);
		if (informer && informer.type > 1) {
			type = informer.type || 0;
		} else {
			type = this.activeInformers['custom_informers'] || 0;
		}
	} else {
		type = this.activeInformers[flag.replace(/ /g, '_')] || 0;
	}
	return type;
};
ui_informer.activateLabelNotification = function(flag,type) {
	if (!(type & 0x10)) {
		return;
	}
	ui_informer._createLabel(flag);
	if (!this.tref) {
		ui_informer._tick();
	}
};
ui_informer.activateDesktopNotification = function(flag,type) {
	if (!(type & 0x20)) {
		return;
	}
	if (ui_storage.get('Option:enableInformerAlerts') && worker.GUIp_browser !== 'Opera' && worker.Notification.permission === "granted") {
		var title = '[☆] ' + ui_data.god_name,
			text = flag.replace(/^ci /,''),
			callback = function(){ui_informer.hide(flag);};
		ui_utils.showNotification(title,text,callback);
	}
	if (!(type & 0x10)) {
		this.flags[flag] = 'd';
	}
};
ui_informer.activateSoundNotification = function(flag,type) {
	if (!(type & 0x40)) {
		return;
	}
	GUIp.common.playSound(ui_storage.get('Option:informerCustomSound') || 'arena');
	if (!(type & 0x10)) {
		this.flags[flag] = 'd';
	}
};
ui_informer.update = function(flag, value) {
	if (value) {
		if ((this.activeInformers[flag.replace(/ /g, '_')] || flag.match(/^ci /)) && (flag === 'fight' || flag === 'low health' || flag.match(/^ci /) || !(ui_data.isFight && !ui_data.isDungeon && !ui_data.isSail)) && 
			!(flag === 'much gold' && ui_stats.hasTemple() && ui_stats.townName()) &&
			!(flag === 'smelter' && this.flags['smelt!'] === 'e') &&
			!(flag === 'transformer' && this.flags['transform!'] === 'e')) {
			var infType = this.getInformerType(flag);
			if (this.flags[flag] === undefined) {
				this.flags[flag] = 'e';
				this.activateLabelNotification(flag,infType);
				this.activateDesktopNotification(flag,infType);
				this.activateSoundNotification(flag,infType);
				ui_informer._save();
			} else if (this.flags[flag] === 's') {
				this.flags[flag] = 'e';
				this.activateLabelNotification(flag,infType);
				ui_informer._save();
			}
		} else if (this.flags[flag] === 'e') {
			this.flags[flag] = 's';
			ui_informer._deleteLabel(flag);
			ui_informer._save();
		}
	} else if (this.flags[flag] !== undefined) {
		delete this.flags[flag];
		ui_informer._deleteLabel(flag);
		ui_informer._save();
	}
};
ui_informer.hide = function(flag) {
	this.flags[flag] = 'd';
	ui_informer._deleteLabel(flag);
	if (flag === 'selected town') {
		delete this.flags[flag];
		ui_improver.distanceInformerReset();
	}
	ui_informer._save();
};
ui_informer.getCustomInformer = function(title) {
	var customInformer;
	title = title.replace(/^ci /,'');
	for (var i = 0, len = ui_words.base.custom_informers.length; i < len; i++) {
		customInformer = ui_words.base.custom_informers[i];
		if (customInformer.title === title) {
			return customInformer;
		}
	}
	return null;
};
ui_informer.updateCustomInformers = function() {
	if (!this.activeInformers['custom_informers']) {
		return;
	}
	var customInformer, customInformerState;
	for (var i = 0, len = ui_words.base.custom_informers.length; i < len; i++) {
		customInformer = ui_words.base.custom_informers[i];
		if (customInformer.q) {
			continue;
		}
		customInformerState = this.parseCustomExpression(customInformer.expr);
		if ((customInformer.type % 2) === 0) {
			this.update('ci ' + customInformer.title, customInformerState);
		} else {
			if (customInformerState) {
				this.update('ci ' + customInformer.title, true);
			} else if (this.flags['ci ' + customInformer.title] === 'd') {
				this.update('ci ' + customInformer.title, false);
			}
		}
	}
	// clear guildchat last message cache
	if (this.CIDstate._lgcc) {
		this.CIDstate._lgcc = '';
	}
};
ui_informer.initCustomInformersData = function() {
	this.CIDstate = {
		get health() { return ui_stats.HP(); },
		get healthMax() { return ui_stats.Max_HP(); },
		get healthPrc() { return 100 * this.health / this.healthMax; },
		get gold() { return ui_stats.Gold(); },
		get supplies() { return ui_stats.Map_Supplies(); },
		get suppliesMax() { return ui_stats.Map_MaxSupplies(); },
		get suppliesPrc() { return 100 * this.supplies / this.suppliesMax; },
		get inventory() { return ui_stats.Inv(); },
		get inventoryMax() { return ui_stats.Max_Inv(); },
		get inventoryPrc() { return 100 * this.inventory / this.inventoryMax; },
		get inventoryHealing() { return ui_inventory.getHealingItems(); },
		get inventoryUnsaleable() { return ui_inventory.getUnsellableItems(); },
		get inventoryUnsellable() { return ui_inventory.getUnsellableItems(); },
		get portDistance() { return ui_improver.sailPortDistance || 0; },
		get auraName() { return ui_stats.auraName(); },
		get auraDuration() { return ui_stats.auraDuration(); },
		get enemyHealth() { return ui_stats.Enemy_HP(); },
		get enemyHealthMax() { return ui_stats.Enemy_MaxHP(); },
		get enemyHealthPrc() { return 100 * this.enemyHealth / this.enemyHealthMax; },
		get enemyCount() { return ui_stats.Enemy_Count(); },
		get enemyAliveCount() { return ui_stats.Enemy_AliveCount(); },
		get enemyAbilitiesCount() { return ui_stats.Enemy_AbilitiesCount(); },
		get enemyGold() { return ui_stats.Enemy_Gold(); },
		enemyHasAbility: ui_stats.Enemy_HasAbility,
		enemyHasAbilityLoc: ui_stats.Enemy_HasAbilityLoc,
		get alliesHealth() { return ui_stats.Hero_Alls_HP(); },
		get alliesHealthMax() { return ui_stats.Hero_Alls_MaxHP(); },
		get alliesHealthPrc() { return 100 * this.alliesHealth / this.alliesHealthMax; },
		get alliesCount() { return ui_stats.Hero_Alls_Count(); },
		get alliesAliveCount() { return ui_stats.Hero_Alls_AliveCount(); },
		get alliesAliveHealthMax() { return ui_stats.Hero_Alls_AliveMaxHP(); },
		get godpower() { return ui_stats.Godpower(); },
		get godpowerMax() { return ui_stats.Max_Godpower(); },
		get godpowerPrc() { return 100 * this.godpower / this.godpowerMax; },
		get charges() { return ui_stats.Charges(); },
		get arenaAvailable() { return ui_stats.isArenaAvailable(); },
		get sparAvailable() { return ui_stats.isSparAvailable(); },
		get dungeonAvailable() { return ui_stats.isDungeonAvailable(); },
		get sailAvailable() { return ui_stats.isSailAvailable(); },
		get arenaSendDelay() { return ui_stats.sendDelayArena(); },
		get sparSendDelay() { return ui_stats.sendDelaySpar(); },
		get dungeonSendDelay() { return ui_stats.sendDelayDungeon(); },
		get sailSendDelay() { return ui_stats.sendDelaySail(); },
		get fightMode() { return ui_stats.fightType(); },
		get fightType() { return ui_stats.fightType(); },
		get fightStep() { return ui_stats.currentStep(); }, 
		get sailConditions() { return ui_improver.islandsMapConds; },
		get inBossFight() { return ui_stats.isBossFight(); },
		get inFight() { return ui_stats.isFight(); },
		get inTown() { return ui_stats.townName().length > 0; },
		get nearestTown() { return ui_stats.nearbyTown(); },
		get currentTown() { return ui_stats.townName(); },
		get mileStones() { return ui_stats.mileStones(); },
		get lastNews() { return ui_stats.lastNews(); },
		get lastDiary() {
			var lastDiary = ui_stats.lastDiary();
			for (var i = 0; i < lastDiary.length; i++) {
				if (lastDiary[i].match('☣')) {
					continue;
				}
				return lastDiary[i];
			}
			return '';
		},
		get lastDiaryVoice() {
			var lastDiary = ui_stats.lastDiary();
			for (var i = 0; i < lastDiary.length; i++) {
				if (lastDiary[i].match('☣')) {
					return lastDiary[i];
				}
			}
			return '';
		},
		get lastGuildChat() {
			if (this._lgcc) {
				return this._lgcc;
			}
			var msgsc, msgs = ui_utils.getLastGCM();
			if (!msgs.length) {
				return '';
			}
			msgsc = msgs.length - 1;
			if (!this._lgcid) {
				this._lgcid = JSON.stringify(msgs[msgsc]);
				return '';
			}
			var found = false, filtered = '';
			for (var i = 0, len = msgs.length; i < len; i++) {
				if (JSON.stringify(msgs[i]) === this._lgcid) {
					found = true;
					continue;
				}
				if (!found || msgs[i].a === ui_data.god_name) {
					continue;
				}
				filtered += msgs[i].a + ': ' + msgs[i].c + '\n';
			}
			if (!found) {
				for (var i = 0, len = msgs.length; i < len; i++) {
					if (msgs[i].a !== ui_data.god_name) {
						filtered += msgs[i].a + ': ' + msgs[i].c + '\n';
					}
				}
			}
			this._lgcid = JSON.stringify(msgs[msgsc]);
			return filtered.length ? (this._lgcc = filtered) : '';
		},
		get isGoingBack() { return ui_stats.isGoingBack(); },
		get isGoingForth() { return ui_improver.detectors.stateGTF.res; },
		get isTrading() { return ui_improver.detectors.stateTP.res; },
		get dailyForecast() { return ui_improver.dailyForecastText; },
		get hasTemple() { return ui_stats.hasTemple(); },
		get hasArk() { return  ui_stats.hasArk(); },
		get currentMonster() { return ui_stats.monsterName(); },
		get questName() { return ui_stats.Task_Name(); },
		get questProgress() { return ui_stats.Task(); },
		get expTimeout() { var ref = ui_timers._lastLayingDate ? ui_timers._lastLayingDate : ui_timers._earliestEntryDate; return (ref ? Math.max(0,(2160 - Math.ceil((Date.now() + 1 - ref)/1000/60))) : 10080); },
		get logTimeout() { var ref = ui_timers._penultLogDate ? ui_timers._penultLogDate : ui_timers._earliestEntryDate; return (ref ? Math.max(0,(1440 - Math.ceil((Date.now() + 1 - ref)/1000/60))) : 10080); },
		get sparTimeout() { var ref = ui_timers._lastSparDate ? ui_timers._lastSparDate : ui_timers._earliestEntryDate; return (ref ? Math.max(0,(1320 - Math.ceil((Date.now() + 1 - ref)/1000/60))) : 10080); },
		get getSeconds() { return (ui_informer._getDateGVT()).getSeconds(); },
		get getMinutes() { return (ui_informer._getDateGVT()).getMinutes(); },
		get getHours() { return (ui_informer._getDateGVT()).getHours(); },
		get getDay() { return (ui_informer._getDateGVT()).getDay() || 7; },
		get voiceCooldown() { return Math.max(0,Math.round((ui_timeout._finishDate - Date.now()) / 1000)); },
		get windowFocused() { return document.hasFocus(); }
	};
	worker.jsep.addBinaryOp("~", 6);
	worker.jsep.addBinaryOp("~*", 6);
};
ui_informer.checkCustomExpression = function() {
	var tree, input, content = [],
		result = [];
	if (ui_words.base.custom_informers.length > 0) {
		input = ui_words.base.custom_informers[Math.floor(Math.random()*ui_words.base.custom_informers.length)].expr;
	} else {
		input = 'gv.healthPrc > 70 || gv.godpower == gv.godpowerMax';
	}
	input = worker.prompt(worker.GUIp_i18n.custom_informers_input,(this._debugLastExpr || input));
	if (!input || !input.length) {
		return false;
	}
	this._debugLastExpr = input;
	try {
		tree = worker.jsep(input);
		content.push('<br>' + worker.GUIp_i18n.custom_informers_check_result + '<b>' + !!this.processCustomExpression(tree,result) + '</b>');
	} catch (e) {
		content.push(worker.GUIp_i18n.custom_informers_error + '.');
	}
	for (var i = result.length; i > 0; i--) {
		content.push(i + '. ' + result[i - 1]);
	}
	content.push(worker.GUIp_i18n.custom_informers_check_expr + '<b>' + input + '</b><br>');
	content.reverse();
	ui_utils.showMessage('custom_expression_check', {
		title: worker.GUIp_i18n.custom_informers_check,
		content: '<div style="text-align: left;">' + content.join('<br>') + '</div>',
		callback: function() {}
	});
};
ui_informer.parseCustomExpression = function(input) {
	var tree, result = false;
	try {
		tree = worker.jsep(input);
		result = this.processCustomExpression(tree);
	} catch (e) {
		console.log('[eGUI+] error: parsing custom expression failed: ' + e);
	}
	return result;
};
ui_informer.processCustomExpression = function(expr,debug) {
	var res, arg1, arg2, args = [];
	switch (expr.type)
	{
		case 'LogicalExpression':
		case 'BinaryExpression':
			arg1 = this.processCustomExpression(expr.left,debug);
			arg2 = this.processCustomExpression(expr.right,debug);
			switch (expr.operator)
			{
				case '&&': res = (arg1 && arg2); break;
				case '||': res = (arg1 || arg2); break;
				case '+': res = (arg1 + arg2); break;
				case '-': res = (arg1 - arg2); break;
				case '*': res = (arg1 * arg2); break;
				case '/': res = (arg1 / arg2); break;
				case '==': res = (arg1 == arg2); break;
				case '!=': res = (arg1 != arg2); break;
				case '>':  res = (arg1 > arg2); break;
				case '>=': res = (arg1 >= arg2); break;
				case '<':  res = (arg1 < arg2); break;
				case '<=': res = (arg1 <= arg2); break;
				case '~': res = (arg1 && arg1.match && arg1.match(new worker.RegExp(arg2))); break;
				case '~*': res = (arg1 && arg1.match && arg1.match(new worker.RegExp(arg2,'i'))); break;
				default:
					res = false;
					debug && debug.push('<span class="debug_mode_warning">operator "' + expr.operator + '" is not valid</span>');
					worker.console.log('[eGUI+] error: BE/LE operator "'+expr.operator+'" unsupported in custom informers.');
			}
			debug && debug.push('' + this._debugExprName(expr.left,arg1) + ' <b>' + expr.operator + '</b> ' + this._debugExprName(expr.right,arg2) + ' → ' + this._debugExprValue(res,true) + '');
			return res;
			break;
		case 'UnaryExpression':
			arg1 = this.processCustomExpression(expr.argument,debug);
			switch (expr.operator)
			{
				case '!': res = !arg1; break;
				case '+': res = +arg1; break;
				case '-': res = -arg1; break;
				default:
					res = false;
					debug && debug.push('<span class="debug_mode_warning">Operator "' + expr.operator + '" not valid</span>');
					worker.console.log('[eGUI+] error: UE operator "'+expr.operator+'" unsupported in custom informers.');
			}
			debug && debug.push('<b>' + expr.operator + '</b>' + this._debugExprName(expr.argument,arg1) + ' → ' + this._debugExprValue(res,true) + '');
			return res;
			break;
		case 'MemberExpression':
			arg1 = this.processCustomExpression(expr.object,debug)
			arg2 = this.processCustomExpression(expr.property,debug);
			if (arg1 && (res = arg1[arg2]) !== undefined) {
				debug && debug.push('<b>' + this._debugExprName(expr.object,arg1) + (expr.computed ? '[' : '.') + this._debugExprName(expr.property,arg2) + (expr.computed ? ']' : '') + '</b> → ' + this._debugExprValue(res,true));
				return res;
			}
			debug && debug.push('<b>' + this._debugExprName(expr.object,arg1) + '[' + this._debugExprName(expr.property,arg2) + ']</b> → <span class="debug_mode_warning">undefined</span>');
			return false;
			break;
		case 'CallExpression':
			arg1 = this.processCustomExpression(expr.callee,debug);
			args = [];
			for (var i = 0, len = expr.arguments.length; i < len; i++) {
				args.push(this.processCustomExpression(expr.arguments[i],debug));
			}
			if (arg1 && typeof arg1 === 'function') {
				res = arg1.apply(null,args);
				debug && debug.push('<b>' + this._debugExprName(expr.callee,arg1) + '(' + this._debugExprName(expr.arguments,args) + ')</b> → ' + this._debugExprValue(res,true));
				return res;
			}
			debug && debug.push('<b>' + this._debugExprName(expr.callee) + '(' + this._debugExprName(expr.arguments) + ')</b> → <span class="debug_mode_warning">invalid call</span>');
			return false;
		case 'Literal': return expr.value;
		case 'Identifier':
			switch (expr.name)
			{
				case 'gv': return this.CIDstate;
				default: return expr.name;
			}
			break;
		default:
			worker.console.log('[eGUI+] error: expression type "'+expr.type+'" unsupported in custom informers.');
			return false;
	}
};
ui_informer._debugExprName = function(expr,value) {
	if (expr instanceof Array) {
		var res = [];
		for (var i = 0, len = expr.length; i < len; i++) {
			if (value && value[i]) {
				res.push(this._debugExprName(expr[i],value[i]));
			} else {
				res.push(this._debugExprName(expr[i],'unavailable'));
			}
		}
		return res.join(', ');
	}
	if (expr.type) {
		switch (expr.type) {
			case 'Literal': return expr.raw;
			case 'Identifier': return expr.name;
			case 'UnaryExpression': 
			case 'LogicalExpression':
			case 'BinaryExpression':
			case 'MemberExpression':
			case 'CallExpression': return this._debugExprValue(value);
			default: return 'unsupported';
		}
	} else {
		return 'unknown';
	}
};
ui_informer._debugExprValue = function(value,full) {
	if (value === null) {
		return 'null';
	}
	if (value instanceof Array) {
		var res = [];
		for (var i = 0, len = value.length; i < len; i++) {
			res.push('"' + value[i] + '"');
		}
		if (!full) {
			return '<span title="[' + res.join(', ').replace(/"/g,'&quot;') + ']">array';
		} else {
			return '[' + res.join(', ') + ']';
		}
	}
	if (typeof value === 'function') {
		return value.name || 'function';
	}
	if (typeof value === 'string') {
		if (!full && value.length > 30) {
			return '"<span title="' + value.replace(/"/g,'&quot;') + '">' + value.substring(0,27) + '..."</span>';
		}
		return '"' + value + '"';
	}
	if (typeof value === 'object') {
		var res = [], keys = worker.Object.keys(value).sort();
		for (var i = 0, len = keys.length; i < len; i++) {
			res.push('obj[' + keys[i].replace(/"/g,'&quot;') + ']');
			if (i > 50) {
				res.push('...');
				break;
			}
		}
		return '<span title="' + res.join('\n') + '">object</span>';
	}
	return value;
}

// ui_forum
var ui_forum = worker.GUIp.forum = {};

ui_forum.init = function() {
	document.body.insertAdjacentHTML('afterbegin', '<div id="forum_informer_bar" />');
	var subscriptions = JSON.parse(ui_storage.get('ForumSubscriptions')),
		informers = JSON.parse(ui_storage.get('ForumInformers')) || {},
		topics = worker.Object.keys(informers);
	// update data from cache at first since online check might be unavailable due to new insane request limit restrictions
	for (var tid, i = 0, len = topics.length; i < len; i++) {
		tid = topics[i];
		if (!subscriptions[tid] || informers[tid].obsolete) {
			delete informers[tid];
			continue;
		}
		ui_forum._setInformer(tid, informers[tid], subscriptions[tid], GUIp.common.formatTime(new worker.Date(subscriptions[tid].date)));
	}
	ui_storage.set('ForumInformers', JSON.stringify(informers));
	// list of already updated topics
	ui_forum.processed = [];
	// first attempt to check for new posts
	ui_forum._check();
	worker.setInterval(ui_forum._check.bind(ui_forum), 200*1000);
};
ui_forum.externalSync = function(informers) {
	informers = JSON.parse(informers);
	for (var topic in informers) {
		if (informers[topic].obsolete) {
			delete informers[topic];
			ui_forum._unsetInformer(topic);
		}
	}
	ui_storage.set('ForumInformers', JSON.stringify(informers));
};
ui_forum._check = function() {
	var topics, subscriptions = JSON.parse(ui_storage.get('ForumSubscriptions')),
		prepared = [],
		available = [],
		requests = 0;
	topics = worker.Object.keys(subscriptions);
	if (topics.length) {
		ui_improver.showSubsLink();
	}
	if (topics.length < 20) {
		prepared = topics;
	} else {
		topics.sort();
		// process prioritized topics
		for (var i = 0, len = topics.length; i < len; i++) {
			if (subscriptions[topics[i]].rapid) {
				if (prepared.length < 19) {
					prepared.push(topics[i]);
				}
			}
		}
		// prepare a list of available topics
		for (var i = 0, len = topics.length; i < len; i++) {
			if (prepared.indexOf(topics[i]) < 0 && ui_forum.processed.indexOf(topics[i]) < 0) {
				available.push(topics[i]);
			}
		}
		if ((prepared.length + available.length) < 20) {
			prepared = prepared.concat(available);
			ui_forum.processed = [];
			available = [];
			for (var i = 0, len = topics.length; i < len; i++) {
				if (prepared.indexOf(topics[i]) < 0) {
					available.push(topics[i]);
				}
			}
		}
		for (var temp, j, i = available.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			temp = available[i];
			available[i] = available[j];
			available[j] = temp;
		}
		// append random available topics to list of prepared ones up to 20
		prepared = prepared.concat(available.slice(0,Math.max(20 - prepared.length,0)));
	}
	// request update if there's anything we're interested in
	if (prepared.length) {
		for (var i = 0, len = prepared.length; i < len; i++) {
			prepared[i] = 'topic_ids[]=' + prepared[i];
		}
		this._request(prepared, requests++);
	}
};
ui_forum._request = function(postdata, requests) {
	worker.setTimeout(GUIp.common.postXHR.bind(ui_forum, '/forums/last_in_topics', postdata.join('&'), ui_forum._parse.bind(ui_forum)), 500*requests);
};
ui_forum._setInformer = function(topic_no, topic_data, subscription_data, last_date) {
	var informer = document.getElementById('topic' + topic_no);
	if (!informer) {
		document.getElementById('forum_informer_bar').insertAdjacentHTML('beforeend',
			'<a id="topic' + topic_no + '" target="_blank"><span></span><div class="fr_new_badge"></div></a>'
		);
		informer = document.getElementById('topic' + topic_no);
		informer.onclick = function(e) {
			if (e.which === 1) {
				e.preventDefault();
			}
			e.stopPropagation();
		};
		informer.onmouseup = function(e) {
			if (e.which === 1 || e.which === 2) {
				var topic = this.id.match(/\d+/)[0],
					informers = JSON.parse(ui_storage.get('ForumInformers'));
				delete informers[topic];
				ui_storage.set('ForumInformers', JSON.stringify(informers));
				ui_forum._unsetInformer(topic);
			}
		};
	}
	var page = Math.floor((subscription_data.posts - topic_data.diff)/25) + 1;
	informer.title = worker.GUIp_i18n.forum_subs_info + subscription_data.by + ' (' + last_date + ')';
	informer.href = '/forums/show_topic/' + topic_no + '?page=' + page + '#guip_' + (subscription_data.posts - topic_data.diff + 25 - page*25 + 1);
	informer.style.paddingRight = (16 + String(topic_data.diff).length*6) + 'px';
	informer.getElementsByTagName('span')[0].textContent = subscription_data.name;
	informer.getElementsByTagName('div')[0].textContent = topic_data.diff;
};
ui_forum._unsetInformer = function(topic_no) {
	var informer = worker.$('#topic' + topic_no);
	if (informer.length) {
		informer.slideToggle("fast", function() {
			if (this.parentElement) {
				this.parentElement.removeChild(this);
				ui_informer.clearTitle();
			}
		});
	}
};
ui_forum._parse = function(xhr) {
	var response;
	try {
		response = JSON.parse(xhr.responseText);
		if (response.status !== 'success' || !response.topics) {
			return;
		}
	} catch(e) {
		worker.console.log('[eGUI+] error: unexpected response to forum subscriptions request: ' + xhr.responseText);
		return;
	}
	var topic, diff, old_diff, changes = false,
		subscriptions = JSON.parse(ui_storage.get('ForumSubscriptions')),
		informers = JSON.parse(ui_storage.get('ForumInformers')),
		topics = response.topics;
	for (var tid in topics) {
		if (ui_forum.processed.indexOf(tid) < 0) {
			ui_forum.processed.push(tid);
		}
		topics[tid].date = (new worker.Date(topics[tid].last_post_at)).getTime();
		topic = topics[tid];
		diff = topic.cnt - subscriptions[tid].posts;
		if (diff <= 0 && subscriptions[tid].date < topic.date) {
			diff = 1;
		}
		subscriptions[tid].posts = topic.cnt;
		subscriptions[tid].date = topic.date;
		subscriptions[tid].name = topic.title;
		subscriptions[tid].by = topic.last_post_by;
		if (diff > 0) {
			if (topic.last_post_by !== ui_data.god_name) {
				old_diff = informers[tid] ? informers[tid].diff : 0;
				informers[tid] = { diff: old_diff + diff, posts: topic.cnt };
			} else {
				delete informers[tid];
				ui_forum._unsetInformer(tid);
			}
		}
		if (diff < 0) {
			delete informers[tid];
			ui_forum._unsetInformer(tid);
		}
		if (informers[tid]) {
			ui_forum._setInformer(tid, informers[tid], subscriptions[tid], GUIp.common.formatTime(new worker.Date(topics[tid].last_post_at)));
		}
	}
	ui_storage.set('ForumSubscriptions', JSON.stringify(subscriptions));
	ui_storage.set('ForumInformers', JSON.stringify(informers));
 	ui_informer.clearTitle();
};


// ui_improver
var ui_improver = worker.GUIp.improver = {};

ui_improver.improveTmt = 0;
ui_improver.isFirstTime = true;
ui_improver.voiceSubmitted = false;
ui_improver.wantedMonsters = null;
ui_improver.wantedItems = null;
ui_improver.dailyForecast = null;
ui_improver.dailyForecastText = null;
ui_improver.windowResizeInt = 0;
// dungeon
ui_improver.chronicles = {};
ui_improver.directionlessMoveIndex = 0;
ui_improver.wormholeMoveIndex = 0;
ui_improver.dungeonPhrases = [
	'bossHint',
	'boss',
	'bonusGodpower',
	'bonusHealth',
	'trapUnknown',
	'trapTrophy',
	'trapGold',
	'trapLowDamage',
	'trapModerateDamage',
	'trapMoveLoss',
	'jumpingDungeon',
	'treasureChest',
	'pointerMarker',
	'longJump'
];
ui_improver.corrections = { n: 'north', e: 'east', s: 'south', w: 'west' };
ui_improver.pointerRegExp = new worker.RegExp('[^а-яa-z](северо-восток|северо-запад|юго-восток|юго-запад|' +
														'север|восток|юг|запад|' +
														'очень холодно|холодно|свежо|тепло|очень горячо|горячо|' +
														'north-east|north-west|south-east|south-west|' +
														'north|east|south|west|' +
														'freezing|very cold|cold|mild|warm|hot|burning|very hot|hot)', 'gi');
ui_improver.dungeonXHRCount = 0;
ui_improver.needLog = true;
ui_improver.islandsMapConds = '';
// resresher
ui_improver.softRefreshInt = 0;
ui_improver.hardRefreshInt = 0;
ui_improver.softRefresh = function() {
	worker.console.info('Godville UI+ log: Soft reloading...');
	document.getElementById('d_refresh') && document.getElementById('d_refresh').click();
};
ui_improver.hardRefresh = function() {
	worker.console.warn('Godville UI+ log: Hard reloading...');
	location.reload();
};
ui_improver.improve = function() {
	this.improveInProcess = true;
	ui_informer.update('fight', ui_data.isFight && !ui_data.isDungeon && !ui_data.isSail);
	ui_informer.update('arena available', ui_stats.isArenaAvailable());
	ui_informer.update('dungeon available', ui_stats.isDungeonAvailable());
	ui_informer.update('sail available', ui_stats.isSailAvailable());

	if (this.isFirstTime) {
		if (!ui_data.isFight && !ui_data.isDungeon && !ui_data.isSail) {
			ui_improver.improveDiary();
			ui_improver.distanceInformerInit();
		}
		if (ui_data.isDungeon) {
			ui_improver.getDungeonPhrases();
		}
		if (ui_data.isSail) {
			ui_improver.improveSailChronicles();
			ui_improver.improveIslandsMap();
		}
		if (ui_data.isFight) {
			worker.setTimeout(function() { ui_improver.improveAllies(); },250);
		}
	}
	ui_improver.improveStats();
	ui_improver.improveVoiceDialog();
	if (!ui_data.isFight) {
		ui_improver.improveNews();
		ui_improver.improveEquip();
		ui_improver.improveSkills();
		ui_improver.improvePet();
		ui_improver.improveSendButtons();
		ui_improver.detectors.detectGTF();
		ui_improver.detectors.detectTP();
	}
	if (ui_data.isDungeon) {
		ui_improver.improveDungeon();
	}
	ui_improver.improveInterface();
	ui_improver.improveChat();
	ui_improver.calculateButtonsVisibility();
	this.isFirstTime = false;
	this.improveInProcess = false;

	ui_informer.updateCustomInformers();
};
ui_improver.processExternalChanges = function(event) {
	// we're interested in keys related to current godname only
	if (event.key.substring(0,event.key.indexOf(':') + 1) !== ui_storage._get_key('')) {
		return;
	}
	// convert some special values
	var newValue = event.newValue;
	switch (newValue) {
		case 'true': newValue = true; break;
		case 'false': newValue = false; break;
		case 'null': newValue = null; break;
	}
	// strip prefix from actual key name and switch by eGUI+ storage keys
	switch (event.key.substring(event.key.indexOf(':') + 1)) {
		case 'UserCss':
			GUIp.common.addCSSFromString(newValue);
			break;
		case 'ForumInformers':
			ui_forum.externalSync(newValue);
			break;
		case 'Option:disableDieButton':
		case 'Option:disableVoiceGenerators':
		case 'Option:fixedCraftButtons':
			ui_improver.calculateButtonsVisibility(true);
			break;
		case 'Option:disableLayingTimer':
			if (ui_stats.hasTemple()) {
				ui_timers.layingTimerIsDisabled = newValue;
				ui_utils.hideElem(ui_timers.layingTimer ? ui_timers.layingTimer : ui_timers.logTimer, ui_timers.layingTimerIsDisabled); // todo: if it's got enabled, it should also be made clickable and switchable
				ui_timers.tick();
			}
			break;
		case 'Option:disableLogger':
			if (newValue) {
				ui_logger.bar.hide();
			} else {
				ui_logger.bar.show();
			}
			break;
		case 'Option:enableInformerAlerts':
		case 'Option:enablePmAlerts':
			if (newValue && worker.GUIp_browser !== 'Opera' && worker.Notification.permission !== "granted") {
				worker.Notification.requestPermission();
			}
			break;
		case 'Option:forbiddenCraft':
			ui_inventory.forbiddenCraft = newValue || '';
			break;
		case 'Option:activeInformers':
			ui_informer.activeInformers = JSON.parse(newValue || '{}');
			break;
		case 'Option:freezeVoiceButton':
			ui_improver.freezeVoiceButton = newValue || '';
			break;
		case 'Option:relocateDuelButtons':
			ui_improver.improveSendButtons(true);
			break;
		case 'Option:relocateMap':
			if (ui_data.isDungeon) {
				ui_improver.improveDungeon(true);
			}
			break;
		case 'Option:useBackground':
			ui_improver.improveInterface(true);
			break;
		case 'CustomWords:pets':
		case 'CustomWords:chosen_monsters':
		case 'CustomWords:special_monsters':
		case 'CustomWords:custom_informers':
			ui_words.init();
			break;
		case 'CustomWords:ally_blacklist':
			ui_words.init();
			ui_improver.improveAllies();
			break;
		case 'CustomWords:custom_craft':
			ui_words.init();
			ui_inventory.rebuildCustomCraft();
			ui_improver.calculateButtonsVisibility(true);
			break;
	}
};
ui_improver.improveVoiceDialog = function() {
	// If playing in pure ZPG mode there won't be present voice input block at all;
	if (!document.getElementById('voice_edit_wrap') && !document.getElementById('ve_wrap')) {
		return;
	}
	// Add voicegens and show timeout bar after saying
	if (this.isFirstTime) {
		this.freezeVoiceButton = ui_storage.get('Option:freezeVoiceButton') || '';
		ui_utils.setVoiceSubmitState(this.freezeVoiceButton.match('when_empty'), true);
		worker.$(document).on('change keypress paste focus textInput input', '#god_phrase, #godvoice', function() {
			if (!ui_utils.setVoiceSubmitState(this.value && !(ui_improver.freezeVoiceButton.match('after_voice') && parseInt(ui_timeout.bar.style.width)), false)) {
				ui_utils.setVoiceSubmitState(ui_improver.freezeVoiceButton.match('when_empty'), true);
			}
			ui_utils.hideElem(document.getElementById('clear_voice_input'), !this.value);
		});
		(document.getElementById('voice_edit_wrap') || document.getElementById('ve_wrap')).insertAdjacentHTML('afterbegin', '<div id="clear_voice_input" class="div_link_nu gvl_popover hidden" title="' + worker.GUIp_i18n.clear_voice_input + '">×</div>');
		document.getElementById('clear_voice_input').onclick = function() {
			ui_utils.setVoice('');
		};
		document.getElementById('voice_submit').onclick = function() {
			ui_improver.voiceSubmitted = true;
			ui_utils.hideElem(document.getElementById('clear_voice_input'), true);
			document.getElementById('voice_submit').blur();
		};
		if (!ui_utils.isAlreadyImproved(document.getElementById('cntrl'))) {
			var gp_label = document.getElementsByClassName('gp_label')[0];
			gp_label.classList.add('l_capt');
			document.getElementsByClassName('gp_val')[0].classList.add('l_val');
			if (ui_words.base.phrases.mnemonics.length) {
				ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.mnemo_button, 'mnemonics', worker.GUIp_i18n.mnemo_title);
			}
			if (ui_data.isDungeon) {
				ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.east, 'go_east', worker.GUIp_i18n.ask3 + ui_data.char_sex[0] + worker.GUIp_i18n.go_east);
				ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.west, 'go_west', worker.GUIp_i18n.ask3 + ui_data.char_sex[0] + worker.GUIp_i18n.go_west);
				ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.south, 'go_south', worker.GUIp_i18n.ask3 + ui_data.char_sex[0] + worker.GUIp_i18n.go_south);
				ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.north, 'go_north', worker.GUIp_i18n.ask3 + ui_data.char_sex[0] + worker.GUIp_i18n.go_north);
				if (worker.navigator.userAgent.match(/Android/) && document.getElementById('map')) {
					document.getElementById('map').onclick = ui_utils.mapVoicegen.bind(null);
				}
			} else if (!ui_data.isSail) {
				if (ui_data.isFight) {
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.defend, 'defend', worker.GUIp_i18n.ask4 + ui_data.char_sex[0] + worker.GUIp_i18n.to_defend);
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.pray, 'pray', worker.GUIp_i18n.ask5 + ui_data.char_sex[0] + worker.GUIp_i18n.to_pray);
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.heal, 'heal', worker.GUIp_i18n.ask6 + ui_data.char_sex[1] + worker.GUIp_i18n.to_heal);
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.hit, 'hit', worker.GUIp_i18n.ask7 + ui_data.char_sex[1] + worker.GUIp_i18n.to_hit);
				} else {
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.sacrifice, 'sacrifice', worker.GUIp_i18n.ask8 + ui_data.char_sex[1] + worker.GUIp_i18n.to_sacrifice);
					ui_utils.addVoicegen(gp_label, worker.GUIp_i18n.pray, 'pray', worker.GUIp_i18n.ask5 + ui_data.char_sex[0] + worker.GUIp_i18n.to_pray);
				}
			}
		}
	}
	//hide_charge_button
	var charge_button = document.querySelector('#cntrl .hch_link');
	if (charge_button) {
		charge_button.style.visibility = ui_storage.get('Option:hideChargeButton') ? 'hidden' : '';
	}
	ui_informer.update('full godpower', ui_stats.Godpower() === ui_stats.Max_Godpower() && !ui_data.isFight);
};
ui_improver.improveNews = function() {
	if (!ui_utils.isAlreadyImproved(document.getElementById('news'))) {
		ui_utils.addVoicegen(document.querySelector('#news .l_capt'), worker.GUIp_i18n.hit, 'hit', worker.GUIp_i18n.ask7 + ui_data.char_sex[1] + worker.GUIp_i18n.to_hit);
	}
	var isWantedMonster = false,
		isSpecialMonster = false,
		isTamableMonster = false,
		isFavoriteMonster = false;
	// Если герой дерется с монстром
	var currentMonster = ui_stats.monsterName();
	if (currentMonster) {
		isWantedMonster = currentMonster.match(/(☠|WANTED) /);
		if (ui_words.base.special_monsters.length) {
			isSpecialMonster = currentMonster.match(new worker.RegExp(ui_words.base.special_monsters.join('|'),'i'));
		}
		if (ui_words.base.chosen_monsters.length) {
			isFavoriteMonster = currentMonster.match(new worker.RegExp(ui_words.base.chosen_monsters.join('|'),'i'));
		}
		if (!ui_stats.heroHasPet()) {
			var pet, hero_level = ui_stats.Level();
			for (var i = 0; i < ui_words.base.pets.length; i++) {
				pet = ui_words.base.pets[i];
				if (currentMonster.toLowerCase() === pet.name.toLowerCase() && ui_stats.storedPets().indexOf(pet.name.toLowerCase()) < 0 && hero_level >= pet.min_level && hero_level <= (pet.max_level ? pet.max_level : (pet.min_level + (ui_stats.hasArk() ? 29 : 14)))) {
					isTamableMonster = true;
					break;
				}
			}
		}
	}
	ui_informer.update('wanted monster', isWantedMonster);
	ui_informer.update('special monster', isSpecialMonster);
	ui_informer.update('tamable monster', isTamableMonster);
	ui_informer.update('chosen monster', isFavoriteMonster);
};
ui_improver.improveDungeon = function(forcedUpdate) {
	if (this.isFirstTime || forcedUpdate) {
		var control = document.getElementById('m_control'),
			map = document.getElementById('map'),
			right_block = document.getElementById('a_right_block');
		if (ui_storage.get('Option:relocateMap')) {
			if (!document.querySelector('#a_central_block #map')) {
				control.parentNode.insertBefore(map, control);
				right_block.insertBefore(control, null);
				document.querySelector('#m_control .block_title').textContent = worker.GUIp_locale === 'ru' ? 'Пульт' : 'Remote';
			}
		} else if (forcedUpdate) {
			if (!document.querySelector('#a_right_block #map')) {
				map.parentNode.insertBefore(control, map);
				right_block.insertBefore(map, null);
				document.querySelector('#m_control .block_title').textContent = worker.GUIp_locale === 'ru' ? 'Пульт вмешательства в личную жизнь' : 'Remote Control';
			}
		}
	}
	this.updateDungeonVoicegen(); // todo: place this into dungeon colorization? also run this from here but only at first time?
};
ui_improver.updateDungeonVoicegen = function() {
	if (document.querySelectorAll('#map .dml').length) {
		var i, j, chronolen = +worker.Object.keys(this.chronicles).reverse()[0],
			$box = worker.$('#cntrl .voice_generator'),
			$boxML = worker.$('#map .dml'),
			$boxMC = worker.$('#map .dmc'),
			kRow = $boxML.length,
			kColumn = $boxML[0].textContent.length,
			isJumping = document.getElementById('map').textContent.match(/Прыгучести|Jumping|Загадки|Mystery/);
		if (!$box.length) {
			return;
		}
		for (i = 0; i < 4; i++) {
			$box[i].style.visibility = 'hidden';
		}
		for (var si = 0; si < kRow; si++) {
			for (var sj = 0; sj < kColumn; sj++) {
				if ($boxMC[si * kColumn + sj].textContent !== '@') {
					continue;
				}
				var isMoveLoss = [];
				for (i = 0; i < 4; i++) {
					isMoveLoss[i] = chronolen > i && this.chronicles[chronolen - i].marks.indexOf('trapMoveLoss') !== -1;
				}
				var directionsShouldBeShown = !isMoveLoss[0] || (isMoveLoss[1] && (!isMoveLoss[2] || isMoveLoss[3]));
				if (directionsShouldBeShown) {
					if ($boxMC[(si - 1) * kColumn + sj].textContent !== '#' || isJumping && (si === 1 || si !== 1 && $boxMC[(si - 2) * kColumn + sj].textContent !== '#')) {
						$box[0].style.visibility = '';	//	Север
					}
					if ($boxMC[(si + 1) *kColumn + sj].textContent !== '#' || isJumping && (si === kRow - 2 || si !== kRow - 2 && $boxMC[(si + 2) *kColumn + sj].textContent !== '#')) {
						$box[1].style.visibility = '';	//	Юг
					}
					if ($boxMC[si * kColumn + sj - 1].textContent !== '#' || isJumping && $boxMC[si * kColumn + sj - 2].textContent !== '#') {
						$box[2].style.visibility = '';	//	Запад
					}
					if ($boxMC[si * kColumn + sj + 1].textContent !== '#' || isJumping && $boxMC[si * kColumn + sj + 2].textContent !== '#') {
						$box[3].style.visibility = '';	//	Восток
					}
					if (isJumping && ui_storage.get('Option:jumpingOverrideDirections')) {
						for (i = 0; i < 4; i++) {
							$box[i].style.visibility = '';
						}
					}
				}
			}
		}
	}
};
ui_improver.improveStats = function() {
	//	Парсер строки с золотом
	var i;
	var gold_parser = function(val) {
		return parseInt(val.replace(/[^0-9]/g, '')) || 0;
	};

	if (ui_data.isDungeon) {
		if (ui_storage.get('Logger:Location') === 'Field') {
			ui_storage.set('Logger:Location', 'Dungeon');
			ui_storage.set('Logger:Map_HP', ui_stats.HP());
			ui_storage.set('Logger:Map_Exp', ui_stats.Exp());
			ui_storage.set('Logger:Map_Gold', ui_storage.get('Logger:Gold'));
			ui_storage.set('Logger:Map_Inv', ui_stats.Inv());
			ui_storage.set('Logger:Map_Charges',ui_stats.Charges());
			ui_storage.set('Logger:Map_Alls_HP', ui_stats.Map_Alls_HP());
			for (i = 1; i <= 4; i++) {
				ui_storage.set('Logger:Map_Ally'+i+'_HP', ui_stats.Map_Ally_HP(i));
			}
		}
		ui_informer.update('low health', ui_stats.Map_HP() < 130 && ui_stats.Map_HP() > 1);
		return;
	}
	if (ui_data.isSail) {
		if (ui_storage.get('Logger:Location') === 'Field') {
			ui_storage.set('Logger:Location', 'Sail');
			ui_storage.set('Logger:Map_HP', ui_stats.HP());
			ui_storage.set('Logger:Map_Charges',ui_stats.Charges());
			ui_storage.set('Logger:Map_Supplies',ui_stats.Map_Supplies());
			for (i = 1; i <= 4; i++) {
				ui_storage.set('Logger:Map_Ally'+i+'_HP', ui_stats.Map_Ally_HP(i));
			}
			for (i = 1; i <= 4; i++) {
				ui_storage.set('Logger:Enemy'+i+'_Name', '');
			}
		}
		ui_informer.update('low health', ui_stats.HP() < 0.2 * ui_stats.Max_HP() && ui_stats.HP() > 0);
		return;
	}
	if (ui_data.isFight) {
		if (this.isFirstTime) {
			ui_storage.set('Logger:Hero_HP', ui_stats.HP());
			ui_storage.set('Logger:Hero_Gold', ui_stats.Gold());
			ui_storage.set('Logger:Hero_Inv', ui_stats.Inv());
			ui_storage.set('Logger:Hero_Charges', ui_stats.Charges());
			ui_storage.set('Logger:Enemy_HP', ui_stats.Enemy_HP());
			ui_storage.set('Logger:Enemy_Gold', ui_stats.Enemy_Gold());
			ui_storage.set('Logger:Enemy_Inv', ui_stats.Enemy_Inv());
			ui_storage.set('Logger:Hero_Alls_HP', ui_stats.Hero_Alls_HP());
			for (i = 1; i <= 4; i++) {
				ui_storage.set('Logger:Hero_Ally'+i+'_HP', ui_stats.Hero_Ally_HP(i));
			}
			for (i = 1; i <= 6; i++) {
				ui_storage.set('Logger:Enemy'+i+'_HP', ui_stats.EnemySingle_HP(i));
			}
			ui_storage.set('Logger:Enemy_AliveCount', ui_stats.Enemy_AliveCount());
		}
		var health_lim;
		if (ui_stats.fightType() === 'multi_monster') { // corovan
			health_lim = ui_stats.Max_HP() * 0.05 * ui_stats.Enemy_AliveCount();
		} else if (ui_stats.Hero_Alls_Count() === 0) { // single enemy
			health_lim = ui_stats.Max_HP() * 0.15;
		} else { // raid boss or dungeon boss
			health_lim = (ui_stats.Hero_Alls_MaxHP() + ui_stats.Max_HP()) * (ui_stats.Enemy_HasAbility("nimble|бойкий") ? 0.094 : 0.068);
			if (ui_stats.Enemy_AliveCount() > 1) { // boss has an active minion
				health_lim *= 1.3;
			}
			if (ui_stats.Hero_Alls_Count() < 4) { // allies count less than 4 -- clearly speculative calculation below!
				health_lim *= (4 - ui_stats.Hero_Alls_Count()) * 0.2 + 1;
			}
		}
		ui_informer.update('low health', ui_stats.HP() < health_lim && ui_stats.HP() > 1);
		return;
	}
	if (ui_data.inShop) {
		return;
	}
	if (ui_storage.get('Logger:Location') !== 'Field') {
		ui_storage.set('Logger:Location', 'Field');
	}
	if (!ui_utils.isAlreadyImproved(document.getElementById('stats'))) {
		// Add voicegens
		ui_utils.addVoicegen(document.querySelector('#hk_level .l_capt'), worker.GUIp_i18n.study, 'exp', worker.GUIp_i18n.ask9 + ui_data.char_sex[1] + worker.GUIp_i18n.to_study);
		ui_utils.addVoicegen(document.querySelector('#hk_health .l_capt'), worker.GUIp_i18n.heal, 'heal', worker.GUIp_i18n.ask6 + ui_data.char_sex[1] + worker.GUIp_i18n.to_heal);
		ui_utils.addVoicegen(document.querySelector('#hk_gold_we .l_capt'), worker.GUIp_i18n.dig, 'dig', worker.GUIp_i18n.ask10 + ui_data.char_sex[1] + worker.GUIp_i18n.to_dig);
		ui_utils.addVoicegen(document.querySelector('#hk_quests_completed .l_capt'), worker.GUIp_i18n.cancel_task, 'cancel_task', worker.GUIp_i18n.ask11 + ui_data.char_sex[0] + worker.GUIp_i18n.to_cancel_task);
		ui_utils.addVoicegen(document.querySelector('#hk_quests_completed .l_capt'), worker.GUIp_i18n.do_task, 'do_task', worker.GUIp_i18n.ask12 + ui_data.char_sex[1] + worker.GUIp_i18n.to_do_task);
		ui_utils.addVoicegen(document.querySelector('#hk_death_count .l_capt'), worker.GUIp_i18n.die, 'die', worker.GUIp_i18n.ask13 + ui_data.char_sex[0] + worker.GUIp_i18n.to_die);
	}
	if (!document.querySelector('#hk_distance .voice_generator')) {
		ui_utils.addVoicegen(document.querySelector('#hk_distance .l_capt'), document.querySelector('#main_wrapper.page_wrapper_5c') ? '回' : worker.GUIp_i18n.return, 'town', worker.GUIp_i18n.ask14 + ui_data.char_sex[0] + worker.GUIp_i18n.to_return);
	}

	ui_informer.update('much gold', ui_stats.Gold() >= (ui_stats.hasTemple() ? 10000 : 3000));
	ui_informer.update('dead', ui_stats.HP() === 0);
	var questName = ui_stats.Task_Name();
	ui_informer.update('guild quest', questName.match(/членом гильдии|member of the guild/) && !questName.match(/\((отменено|cancelled)\)/));
	ui_informer.update('mini quest', questName.match(/\((мини|mini)\)/) && !questName.match(/\((отменено|cancelled)\)/));
	
	var townInformer = false;
	if (!ui_stats.isGoingBack() && ui_stats.townName() === '') {
		if (this.informTown === ui_stats.nearbyTown()) {
			townInformer = true;
		}
	} else if (this.informTown === ui_stats.townName()) {
		delete ui_improver.informTown;
		ui_storage.remove('townInformer');
		ui_improver.distanceInformerUpdate();
	}
	ui_informer.update('selected town', townInformer);

	// shovel imaging
	var digVoice = document.querySelector('#hk_gold_we .voice_generator');
	if (this.isFirstTime) {
		if (worker.GUIp_browser !== 'Opera') {
			digVoice.style.backgroundImage = 'url(' + worker.GUIp_getResource('images/shovel.png') + ')';
		} else {
			worker.GUIp_getResource('images/shovel.png',digVoice);
		}
	}
	if (ui_stats.goldTextLength() > 16 - 2*document.getElementsByClassName('page_wrapper_5c').length) {
		digVoice.classList.add('shovel');
		if (ui_stats.goldTextLength() > 20 - 3*document.getElementsByClassName('page_wrapper_5c').length) {
			digVoice.classList.add('compact');
		} else {
			digVoice.classList.remove('compact');
		}
	} else {
		digVoice.classList.remove('shovel');
	}
};
ui_improver.improvePet = function() {
	var petBadge = document.getElementById('pet_badge');
	if (ui_stats.petIsKnockedOut()) {
		if (!ui_utils.isAlreadyImproved(document.getElementById('pet'))) {
			document.querySelector('#pet .r_slot').insertAdjacentHTML('afterbegin', '<div id="pet_badge" class="fr_new_badge equip_badge_pos hidden">0</div>');
			petBadge = document.getElementById('pet_badge');
		}
		if (document.querySelector('#pet .block_content').style.display !== 'none') {
			petBadge.title = worker.GUIp_i18n.badge_pet2;
			petBadge.textContent = (ui_stats.Pet_Level() * 0.4 + 0.5).toFixed(1) + 'k';
		} else {
			petBadge.title = worker.GUIp_i18n.badge_pet1;
			petBadge.textContent = ui_utils.findLabel(worker.$('#pet'), worker.GUIp_i18n.pet_status_label).siblings('.l_val').text().replace(/[^0-9:]/g, '');
		}
		ui_utils.hideElem(petBadge, false);
	} else if (petBadge) {
		ui_utils.hideElem(petBadge, true);
	}
	// knock out informer
	ui_informer.update('pet knocked out', ui_stats.petIsKnockedOut());
};
ui_improver.improveEquip = function() {
	if (!ui_utils.isAlreadyImproved(document.getElementById('equipment'))) {
		document.querySelector('#equipment .r_slot').insertAdjacentHTML('afterbegin', '<div id="equip_badge" class="fr_new_badge equip_badge_pos">0</div>');
	}
	var equipBadge = document.getElementById('equip_badge'),
		averageEquipLevel = 0;
	for (var i = 1; i <= 7; i++) {
		averageEquipLevel += ui_stats['Equip' + i]();
	}
	averageEquipLevel = (averageEquipLevel/7).toFixed(1) + '';
	if (equipBadge.textContent !== averageEquipLevel) {
		equipBadge.title = worker.GUIp_i18n.badge_equip;
		equipBadge.textContent = averageEquipLevel;
	}
};
ui_improver.improveSkills = function() {
	if (!ui_utils.isAlreadyImproved(document.getElementById('skills'))) {
		document.querySelector('#skills .r_slot').insertAdjacentHTML('afterbegin', '<div id="skill_badge" class="fr_new_badge equip_badge_pos"></div>');
	}
	var skillBadge = document.getElementById('skill_badge'),
		skillList = document.getElementsByClassName('skill_info'),
		minSkillLevel = Infinity;
	for (var i = 0, len = skillList.length; i < len; i++) {
		var skillLevel = +(skillList[i].textContent.match(/(\d+)/) || [])[1] || 0;
		if (skillLevel < minSkillLevel) {
			minSkillLevel = skillLevel;
		}
	}
	if (minSkillLevel !== Infinity) {
		minSkillLevel = ((1 + minSkillLevel) / 2).toFixed(1) + 'k';
		if (skillBadge.textContent !== minSkillLevel) {
			skillBadge.title = worker.GUIp_i18n.badge_skill;
			skillBadge.textContent = minSkillLevel;
		}
	}
	ui_utils.hideElem(skillBadge,minSkillLevel === Infinity);
};
ui_improver.improveAllies = function() {
	var ally, matched = false,
		allies = document.querySelectorAll('#alls .opp_n.opp_ng span'),
		blacklist = ui_words.base.ally_blacklist || [];
	for (var i = 0, len = allies.length; i < len; i++) {
		matched = false;
		ally = (allies[i].textContent.match(/\((.*?)\)/) || [])[1];
		for (var j = 0, len2 = blacklist.length; j < len2; j++) {
			if (blacklist[j].q) {
				continue;
			}
			if (ally === blacklist[j].n) {
				matched = true;
				if (!allies[i].classList.contains('ally_blacklisted')) {
					allies[i].etitle = allies[i].title;
					allies[i].ecss = allies[i].style.cssText;
				}
				allies[i].classList.add('ally_blacklisted');
				allies[i].title = worker.GUIp_i18n.ally_blacklisted + (blacklist[j].r.length ? ': \n' + blacklist[j].r : '');
				if (blacklist[j].s && blacklist[j].s.length) {
					allies[i].style.cssText = allies[i].ecss + ' ' + blacklist[j].s;
				}
			}
		}
		if (!matched && allies[i].classList.contains('ally_blacklisted')) {
			allies[i].classList.remove('ally_blacklisted');
			allies[i].title = allies[i].etitle ? allies[i].etitle : '';
			allies[i].style.cssText = allies[i].ecss ? allies[i].ecss : '';
		}
	}
};
ui_improver.improveSendButtons = function(forcedUpdate) {
	var pants = document.querySelector('#pantheons .block_content');
	if (this.isFirstTime) {
		var sendToButtons = document.querySelectorAll('#cntrl div.chf_link_wrap a');
		for (var i = 0, len = sendToButtons.length; i < len; i++) {
			if (sendToButtons[i].textContent.match(/(Послать на тренировку|Spar a Friend)/i)) {
				sendToButtons[i].parentNode.classList.add("e_challenge_button");
			} else if (sendToButtons[i].textContent.match(/(Направить в подземелье|Drop to Dungeon)/i)) {
				sendToButtons[i].parentNode.classList.add("e_dungeon_button");
			} else if (sendToButtons[i].textContent.match(/(Снарядить в плавание|Set Sail)/i)) {
				sendToButtons[i].parentNode.classList.add("e_sail_button");
			}
		}
		pants.insertAdjacentHTML('afterbegin', '<div class="guip p_group_sep" />');
	}
	var sendToDelay, sendToStr, sendToDesc = document.querySelectorAll('#cntrl2 div.arena_msg, #cntrl2 span.to_arena');
	for (var i = 0, len = sendToDesc.length; i < len; i++) {
		if (sendToDesc[i].style.display === 'none') {
			continue;
		}
		if ((!sendToDesc[i].title.length || (sendToDesc[i].dataset.expires < Date.now() + 5000)) && (sendToStr = sendToDesc[i].textContent.match(/(Подземелье откроется через|Отплыть можно через|Арена откроется через|Тренировка через|Arena available in|Dungeon available in|Sail available in|Sparring available in) (?:(\d+)(?:h| ч) )?(?:(\d+)(?:m| мин))/))) {
			sendToDelay = ((sendToStr[2] !== undefined ? +sendToStr[2] : 0) * 60 + +sendToStr[3]) * 60;
			sendToStr = sendToStr[1].replace(/ через/,' в').replace(/ in/,' at');
			sendToDesc[i].dataset.expires = Date.now() + sendToDelay * 1000;
			sendToDesc[i].title = sendToStr + ' ' + GUIp.common.formatTime(new Date(+sendToDesc[i].dataset.expires),'simpletime');
		}
	}
	if (this.isFirstTime || forcedUpdate) {
		var relocated, buttonInPantheons, relocateDuelButtons = ui_storage.get('Option:relocateDuelButtons') || '';
		relocated = relocateDuelButtons.match('arena');
		buttonInPantheons = document.querySelector('#pantheons .arena_link_wrap');
		if (relocated && !buttonInPantheons) {
			pants.insertBefore(document.getElementsByClassName('arena_link_wrap')[0], pants.firstChild);
		} else if (!relocated && buttonInPantheons) {
			document.getElementById('cntrl2').insertBefore(buttonInPantheons, document.querySelector('#control .arena_msg'));
		}
		relocated = relocateDuelButtons.match('chf');
		buttonInPantheons = document.querySelector('#pantheons .e_challenge_button');
		if (relocated && !buttonInPantheons) {
			pants.insertBefore(document.getElementsByClassName('e_challenge_button')[0], document.getElementsByClassName('guip p_group_sep')[0]);
		} else if (!relocated && buttonInPantheons) {
			document.getElementById('cntrl2').insertBefore(buttonInPantheons, document.querySelector('#control .arena_msg').nextSibling);
		}
		relocated = relocateDuelButtons.match('dun');
		buttonInPantheons = document.querySelector('#pantheons .e_dungeon_button');
		if (relocated && !buttonInPantheons) {
			pants.insertBefore(document.getElementsByClassName('e_dungeon_button')[0], document.getElementsByClassName('guip p_group_sep')[0]);
		} else if (!relocated && buttonInPantheons) {
			document.getElementById('cntrl2').insertBefore(buttonInPantheons, document.querySelectorAll('#control .arena_msg')[1]);
		}
		relocated = relocateDuelButtons.match('sail');
		buttonInPantheons = document.querySelector('#pantheons .e_sail_button');
		if (relocated && !buttonInPantheons) {
			pants.insertBefore(document.getElementsByClassName('e_sail_button')[0], document.getElementsByClassName('guip p_group_sep')[0]);
		} else if (!relocated && buttonInPantheons) {
			document.getElementById('cntrl2').insertBefore(buttonInPantheons, document.querySelectorAll('#control .arena_msg')[2]);
		}
	}
};
ui_improver.improveDiary = function() {
	var i, len, messages = document.querySelectorAll('#diary .d_msg:not(.parsed)');
	if (!ui_improver.isFirstTime) {
		if (messages.length && ui_improver.voiceSubmitted) {
			if (messages.length - document.querySelectorAll('#diary .d_msg:not(.parsed) .vote_links_b').length >= 2) {
				ui_timeout.start();
			}
			ui_improver.voiceSubmitted = false;
		}
	}
	for (i = 0, len = messages.length; i < len; i++) {
		if (ui_timers._fallbackThirdEye && messages[i].textContent.match(/^(?:Возложила?.+?алтарь|Выставила? тридцать золотых столбиков|I placed \w+? bags of gold)/i)) {
			var ntime, dtime = messages[i].parentNode.firstChild.textContent;
			if (dtime = dtime.match(/(\d+):(\d+)( PM)?/)) {
				ntime = new Date();
				if (worker.ampm === '12h') {
					if (dtime[3]) {
						dtime[1] = (+dtime[1] + 12) % 24;
					} else if (+dtime[1] === 12) {
						dtime[1] = 0;
					}
				}
				ntime.setHours(+dtime[1],+dtime[2],60,0);
				if (ui_timers._thirdEyeContent) {
					ui_timers._thirdEyeContent.unshift({msg:messages[i].textContent, date:ntime});
					ui_timers.tick();
				}
			}
		}
		messages[i].classList.add('parsed');
	}
	ui_improver.improvementDebounce();
};
ui_improver.detectors = {};
ui_improver.detectors.stateGTF = {dst: 0, cnt: 0, res: false};
ui_improver.detectors.detectGTF = function() {
	if (ui_stats.monsterName() || ui_stats.townName() || ui_stats.mileStones() < this.stateGTF.dst) {
		this.stateGTF.dst = ui_stats.mileStones();
		this.stateGTF.cnt = 0;
		this.stateGTF.res = false;
		return;
	}
	if (ui_stats.mileStones() > this.stateGTF.dst && ui_stats.progressDiff() > 2) {
		this.stateGTF.cnt++;
		if (this.stateGTF.cnt >= 2) {
			this.stateGTF.res = true;
		}
	}
	this.stateGTF.dst = ui_stats.mileStones();
};
ui_improver.detectors.stateTP = {ic: 0, dst: 0, gld: 0, cnt: 0, res: false};
ui_improver.detectors.detectTP = function() {
	if (ui_stats.monsterName() || ui_stats.mileStones() != this.stateTP.dst || ui_stats.Gold() < this.stateTP.gld) {
		this.stateTP.dst = ui_stats.mileStones();
		this.stateTP.ic = ui_stats.Inv();
		this.stateTP.gld = ui_stats.Gold();
		this.stateTP.cnt = 0;
		this.stateTP.res = false;
		return;
	}
	if (ui_stats.Inv() < this.stateTP.ic && ui_stats.Gold() > this.stateTP.gld) {
		this.stateTP.cnt++;
		if (this.stateTP.cnt >= 2) {
			this.stateTP.res = true;
		}
	}
	this.stateTP.ic = ui_stats.Inv();
	this.stateTP.gld = ui_stats.Gold();
};
ui_improver.distanceInformerInit = function() {
	var dstSelected, dstTown, dstContent, dstHeader,
		dstLine = worker.$('#hk_distance .l_capt'),
		dstSaved = ui_storage.get('townInformer'),
		activeInformers = JSON.parse(ui_storage.get('Option:activeInformers') || '{}');
	if (dstLine && activeInformers['selected_town']) {
		worker.$('<div id="edst_popover" style="display:none;"><div class="fh_header"></div><div id="edst_popover_c" class="fh_content"></div></div>').insertBefore(worker.$('#page_settings'));
		dstLine.ernpopover({
			header: '#edst_popover > .fh_header',
			content: '#edst_popover > .fh_content'
		});
		dstSelected = worker.$('<div class="edst_line"></div>');
		dstSelected.click(ui_improver.distanceInformerReset);
		dstSelected.insertBefore($('#edst_popover_c').parent());
		dstLine.click(function(e) {
			worker.$(".fh_header").text(worker.GUIp_i18n.town_informer);
			dstContent = worker.$("#edst_popover_c");
			dstContent.empty();
			if (!ui_improver.dailyForecast || !ui_improver.dailyForecast.match('gvroads'))
			for (var i = 1, len = ui_words.base.town_list.length; i < len; i++) {
				var town = ui_words.base.town_list[i];
				dstTown = worker.$('<div class="chf_line"></div>').html('<div class="l">' + town.name + '</div><div class="r">' + (town.dst ? '(' + town.dst + ')' : '') + '</div>');
				dstTown.click((function(town) {
					return function() {
						ui_storage.set('townInformer',town.name);
						ui_improver.informTown = town.name;
						ui_improver.distanceInformerUpdate();
					};
				})(town));
				dstTown.appendTo(dstContent);
			} else {
				dstTown = worker.$('<div class="chf_line"></div>').html('<div class="c">' + worker.GUIp_i18n.town_informer_gvroads + '</div>');
				dstTown.appendTo(dstContent);
			}
			ui_improver.distanceInformerUpdate();
			return dstLine.trigger("showPopover"), e.preventDefault(), false;
		});
		dstLine.css({cursor:'pointer',borderBottom:'1px dashed silver'});
		if (dstSaved) {
			ui_improver.informTown = dstSaved;
			dstLine.css('color','rgb(220,20,20)');
		}
	}
};
ui_improver.distanceInformerUpdate = function() {
	var dstLine = worker.$('#hk_distance .l_capt'),
		dstSelected = worker.$('.edst_line');
	if (ui_improver.informTown) {
		dstSelected.html(worker.GUIp_i18n.town_informer_curtown + ': <strong>' + ui_improver.informTown + '</strong> [x]');
		dstSelected.attr('title',worker.GUIp_i18n.town_informer_reset);
		dstSelected.css('cursor','pointer');
		dstLine.css('color','rgb(220,20,20)');
	} else {
		dstSelected.text(worker.GUIp_i18n.town_informer_choose);
		dstSelected.attr('title','');
		dstSelected.css('cursor','');
		dstLine.css('color','');
	}
};
ui_improver.distanceInformerReset = function() {
	if (ui_improver.informTown) {
		delete ui_improver.informTown;
		ui_storage.remove('townInformer');
		ui_improver.distanceInformerUpdate();
	}
	return false;
};
ui_improver.showDailyForecast = function() {
	var dfcTimer, forecastLink = document.getElementById('e_forecast'),
		news = document.getElementById('m_hero').previousElementSibling;
	if (forecastLink) {
		if (this.dailyForecastText) {
			forecastLink.title = worker.GUIp_i18n.daily_forecast + ':\n' + this.dailyForecastText;
		} else {
			forecastLink.parentNode.removeChild(forecastLink);
		}
	} else if (news && this.dailyForecastText) {
		forecastLink = document.createElement('a');
		forecastLink.id = 'e_forecast';
		forecastLink.textContent = '❅';
		forecastLink.href = '/news';
		forecastLink.title = worker.GUIp_i18n.daily_forecast + ':\n' + this.dailyForecastText;
		if (worker.navigator.userAgent.match(/Android/)) {
			forecastLink.onclick = function() { worker.alert(this.title); return false; }
		}
		news.insertBefore(forecastLink, null);
	}
	news.onmousedown = function(e) {
		dfcTimer = worker.setTimeout(function() {
			e.preventDefault();
			ui_data._getWantedMonster(true);
			worker.alert(worker.GUIp_i18n.daily_forecast_update_notice);
		},1200);
	}
	news.onmouseup = function(e) {
		if (dfcTimer) {
			worker.clearTimeout(dfcTimer);
		}
	}
};
ui_improver.showSubsLink = function() {
	var forumLink, subsLink = document.getElementById('e_subs');
	if (!subsLink) {
		forumLink = document.querySelector('#menu_bar a[href="/forums"]');
		if (forumLink) {
			subsLink = document.createElement('a');
			subsLink.id = 'e_subs';
			subsLink.textContent = '▶';
			subsLink.href = '/forums/show/1/#guip_subscriptions';
			subsLink.title = worker.GUIp_i18n.forum_subs;
			forumLink.parentElement.insertBefore(document.createTextNode(' '),null)
			forumLink.parentElement.insertBefore(subsLink,null);
		}
	}
};
ui_improver.parseDungeonPhrases = function(xhr) {
	var i, j, len, line, temp;
	for (i = 0, j = 0, temp, len = this.dungeonPhrases.length; i < len; i++) {
		line = null;
		if (temp = xhr.responseText.match(new worker.RegExp('<p>' + this.dungeonPhrases[i] + '\\b([\\s\\S]+?)<\/p>'))) {
			line = temp[1].replace(/&#8230;/g, '...').replace(/<br \/>/g, '<br>').replace(/^<br>\n|<br>$/g, '').replace(/<br>\n/g, '|');
		}
		if (temp = xhr.responseText.match(new worker.RegExp('<pre><code>' + this.dungeonPhrases[i] + '\n([\\s\\S]+?)<\/code><\/pre>'))) {
			line = temp[1].replace(/&#8230;/g, '...').replace(/\n/g, '|');
		}
		if (!line) {
			continue;
		}
		this[this.dungeonPhrases[i] + 'RegExp'] = new worker.RegExp(line);
		localStorage.setItem('LogDB:' + this.dungeonPhrases[i] + 'Phrases', line);
		j++;
	}
	if (j === this.dungeonPhrases.length) {
		localStorage.setItem('LogDB:lastUpdate', Date.now());
		ui_improver.getDungeonPhrases();
	} else {
		worker.console.log('[eGUI+] error: not enough data to update phrases database (parsed ' + j + ' of ' + this.dungeonPhrases.length + ' sections)');
		ui_improver.getDungeonPhrases(true);
	}
};
ui_improver.getDungeonPhrases = function(update_failure) {
	var update_required = false;
	// check if DB is outdated
	if (+localStorage.getItem('LogDB:lastUpdate') < (Date.now() - 5*60*60*1000)) {
		update_required = true;
	}
	// if we've tried to update but failed
	if (update_failure)
	{
		// check whether we have 'cached' database and use it
		if (localStorage.getItem('LogDB:' + this.dungeonPhrases[this.dungeonPhrases.length - 1] + 'Phrases')) {
			update_required = false;
		} else {
			return;
		}
	}
	// if DB is empty or outdated download a new one
	if (update_required || !localStorage.getItem('LogDB:' + this.dungeonPhrases[this.dungeonPhrases.length - 1] + 'Phrases')) {
		this.dungeonXHRCount++;
		var customChronicler = ui_storage.get('Option:customDungeonChronicler') || '';
		GUIp.common.getXHR('/gods/' + (customChronicler.length >= 3 ? customChronicler : 'Dungeoneer'), ui_improver.parseDungeonPhrases.bind(ui_improver), this.getDungeonPhrases.bind(this,true));
		return;
	}
	// prepare regular expressions
	for (var i = 0, temp, len = this.dungeonPhrases.length; i < len; i++) {
		this[this.dungeonPhrases[i] + 'RegExp'] = new worker.RegExp(localStorage.getItem('LogDB:' + this.dungeonPhrases[i] + 'Phrases'));
	}
	// process chronicles
	ui_improver.improveChronicles();
};
ui_improver.parseChronicles = function(xhr) {
	this.needLog = false;
	this.dungeonXHRCount++;

	if (worker.Object.keys(this.chronicles)[0] === '1') {
		return;
	}

	var lastNotParsed, texts = [], infls = [],
		step = 1,
		step_max = +worker.Object.keys(this.chronicles)[0],
		matches = xhr.responseText.match(/<div class="new_line ?" style='[^']*'>[\s\S]*?<div class="text_content .*?">[\s\S]+?<\/div>/g);
	worker.chronicles = matches;
	worker.response = xhr.responseText;
	if (!matches) {
		worker.console.log('[eGUI+] warning: initial parsing chronicles from the campaign page failed, map colorization disabled!');
		return;
	}
	for (var i = 0; step <= step_max; i++) {
		lastNotParsed = true;
		if (!matches[i].match(/<div class="text_content infl">/)) {
			texts.push(matches[i].match(/<div class="text_content ">([\s\S]+?)<\/div>/)[1].trim().replace(/&#39;/g, "'"));
		} else {
			infls.push(matches[i].match(/<div class="text_content infl">([\s\S]+?)(<span|<\/div>)/)[1].trim().replace(/&#39;/g, "'"));
		}
		if (matches[i].match(/<div class="new_line ?" style='[^']+'>/)) {
			GUIp.common.parseSingleChronicle.call(ui_improver, texts, infls, step);
			lastNotParsed = false;
			texts = [];
			infls = [];
			step++;
		}
	}
	if (lastNotParsed) {
		GUIp.common.parseSingleChronicle.call(ui_improver, texts, infls, step);
	}

	ui_improver.colorDungeonMap();
};
ui_improver.deleteInvalidChronicles = function() {
	var isHiddenChronicles = true,
		chronicles = document.querySelectorAll('#m_fight_log .line.d_line');
	for (var i = chronicles.length - 1; i >= 0; i--) {
		if (isHiddenChronicles) {
			if (chronicles[i].style.display !== 'none') {
				isHiddenChronicles = false;
			}
		} else {
			if (chronicles[i].style.display === 'none') {
				chronicles[i].parentNode.removeChild(chronicles[i]);
			}
		}
	}
};
ui_improver.improveChronicles = function() {
	if (!ui_improver.treasureChestRegExp) {
		if (this.dungeonXHRCount < 5) {
			ui_improver.getDungeonPhrases();
		}
	} else {
		//ui_improver.deleteInvalidChronicles();
		var i, len, lastNotParsed, texts = [], infls = [],
			chronicles = document.querySelectorAll('#m_fight_log .d_msg:not(.parsed)'),
			ch_down = document.querySelector('.sort_ch').textContent === '▼',
			step = ui_stats.currentStep();
		for (len = chronicles.length, i = ch_down ? 0 : len - 1; (ch_down ? i < len : i >= 0) && step; ch_down ? i++ : i--) {
			lastNotParsed = true;
			if (!chronicles[i].className.match('m_infl')) {
				texts = [chronicles[i].textContent].concat(texts);
			} else {
				infls = [chronicles[i].textContent].concat(infls);
			}
			if (chronicles[i].parentNode.className.match('turn_separator')) {
				GUIp.common.parseSingleChronicle.call(ui_improver, texts, infls, step);
				lastNotParsed = false;
				texts = [];
				infls = [];
				step--;
			}
			if (chronicles[i].textContent.match(this.bossHintRegExp)) {
				chronicles[i].parentNode.classList.add('bossHint');
			}
			chronicles[i].classList.add('parsed');
		}
		if (lastNotParsed) {
			GUIp.common.parseSingleChronicle.call(ui_improver, texts, infls, step);
		}

		if (!this.initial) {
			this.initial = true;
		}

		if (this.needLog) {
			if (worker.Object.keys(this.chronicles)[0] === '1') {
				this.needLog = false;
				ui_improver.colorDungeonMap();
			} else if (this.dungeonXHRCount < 5) {
				GUIp.common.getXHR('/duels/log/' + ui_stats.logId(), ui_improver.parseChronicles.bind(ui_improver));
			}
		}
		// informer
		if (worker.Object.keys(this.chronicles).length) {
			ui_informer.update('close to boss', this.chronicles[worker.Object.keys(this.chronicles).reverse()[0]].marks.indexOf('bossHint') !== -1);
		}

		if (ui_storage.get('Log:current') !== ui_stats.logId()) {
			ui_storage.set('Log:current', ui_stats.logId());
			ui_storage.set('Log:' + ui_stats.logId() + ':corrections', '');
			ui_storage.set('Log:' + ui_stats.logId() + ':wormholes', '[]');
		}
		ui_storage.set('Log:' + ui_stats.logId() + ':steps', ui_stats.currentStep());
		ui_storage.set('Log:' + ui_stats.logId() + ':map', JSON.stringify(ui_improver.getDungeonMap()));
	}
	ui_improver.improvementDebounce();
};

ui_improver.getDungeonMap = function() {
	var result = [], cells, row, rows = document.querySelectorAll('#map .dml');
	for (var i = 0, len = rows.length; i < len; i++) {
		row = [];
		cells = rows[i].querySelectorAll('.dmc');
		for (var j = 0, len2 = cells.length; j < len2; j++) {
			row.push(cells[j].textContent.trim());
		}
		result.push(row);
	}
	return result;
};

ui_improver.colorDungeonMap = function() {
	if (!ui_data.isDungeon) {
		return;
	}
	var step, mapCells, currentCell, trapMoveLossCount = 0,
		coords = GUIp.common.calculateExitXY(),
		heroesCoords = GUIp.common.calculateXY(GUIp.common.getOwnCell()),
		steps = worker.Object.keys(this.chronicles),
		steps_max = steps.length;
	if (steps_max !== ui_stats.currentStep()) {
		worker.console.log('[eGUI+] warning: step count mismatch: parsed=' + steps_max + ', required=' + ui_stats.currentStep() + '.');
		return;
	}
	// describe map
	mapCells = document.querySelectorAll('#map .dml');
	for (step = 1; step <= steps_max; step++) {
		if (!this.chronicles[step]) {
			worker.console.log('[eGUI+] error: data for step #' + step + ' is missing, colorizing map failed.');
			return;
		}
		// directionless step
		if (this.chronicles[step].directionless) {
			var shortCorrection = ui_storage.get('Log:' + ui_stats.logId() + ':corrections')[this.directionlessMoveIndex++];
			if (shortCorrection) {
				this.chronicles[step].direction = this.corrections[shortCorrection];
			} else {
				var corrections = GUIp.common.calculateDirectionlessMove.call(ui_improver, '#map', coords, step);
				this.chronicles[step].direction = this.corrections[corrections[0]];
				ui_storage.set('Log:' + ui_stats.logId() + ':corrections',(ui_storage.get('Log:' + ui_stats.logId() + ':corrections') || '') + corrections);
			}
			this.chronicles[step].directionless = false;
		}
		// normal step
		GUIp.common.moveCoords(coords, this.chronicles[step]);
		// wormhole jump
		if (this.chronicles[step].wormhole) {
			if (this.chronicles[step].wormholedst === null) {
				var wormholeDst = JSON.parse(ui_storage.get('Log:' + ui_stats.logId() + ':wormholes')) || [];
				if (wormholeDst[this.wormholeMoveIndex]) {
					this.chronicles[step].wormholedst = wormholeDst[this.wormholeMoveIndex];
				} else if (step === steps_max) {
					worker.console.log('[eGUI+] debug: getting wormhole target from actual coords mismatch.');
					this.chronicles[step].wormholedst = [heroesCoords.y - coords.y, heroesCoords.x - coords.x];
					wormholeDst.push(this.chronicles[step].wormholedst);
					ui_storage.set('Log:' + ui_stats.logId() + ':wormholes',JSON.stringify(wormholeDst));
				} else {
					var result = ui_storage.get('Option:fastWormholes') ? GUIp.common.calculateWormholeMove2.call(ui_improver, '#map', coords, step) : GUIp.common.calculateWormholeMove.call(ui_improver, '#map', coords, step);
					if (result.length) {
						worker.console.log('[eGUI+] debug: found possible targets: [' + result.toString() + ']');
						this.chronicles[step].wormholedst = result[0];
						wormholeDst = wormholeDst.concat(result);
						ui_storage.set('Log:' + ui_stats.logId() + ':wormholes',JSON.stringify(wormholeDst));
					} else {
						worker.console.log('[eGUI+] error: unknown wormhole destination!');
					}
				}
				this.wormholeMoveIndex++;
			}
			if (this.chronicles[step].wormholedst !== null) {
				if (mapCells[coords.y] && mapCells[coords.y].children[coords.x]) {
					currentCell = mapCells[coords.y].children[coords.x];
					GUIp.common.describeCell(currentCell,step,steps_max,this.chronicles[step],trapMoveLossCount,true);
				}
				coords.y += this.chronicles[step].wormholedst[0];
				coords.x += this.chronicles[step].wormholedst[1];
			}
		}
		if (!mapCells[coords.y] || !mapCells[coords.y].children[coords.x]) {
			break;
		}
		currentCell = mapCells[coords.y].children[coords.x];
		if (currentCell.textContent.trim() === '#') {
			worker.console.log('[eGUI+] error: parsed chronicle does not match the map at step #' + step + ': either direction ("' + this.chronicles[step].direction + '") is invalid or map is out of sync!');
			break;
		}
		if (currentCell.textContent.trim() === '✖') {
			this.chronicles[step].chamber = true;
		}
		trapMoveLossCount = GUIp.common.describeCell(currentCell,step,steps_max,this.chronicles[step],trapMoveLossCount);
	}
	if (heroesCoords.x !== coords.x || heroesCoords.y !== coords.y) {
		worker.console.log('[eGUI+] error: chronicle processing failed, coords diff: x: ' + (heroesCoords.x - coords.x) + ', y: ' + (heroesCoords.y - coords.y) + '.');
		//worker.console.log('current chronicles');
		//worker.console.log(this.chronicles);
		//worker.console.log(JSON.stringify(this.chronicles));
		//worker.console.log('m_fight_log');
		//worker.console.log(document.getElementById('m_fight_log').innerHTML);
		if (ui_utils.hasShownInfoMessage !== true) {
			ui_utils.showMessage('info', {
				title: worker.GUIp_i18n.coords_error_title,
				content: '<div>' + worker.GUIp_i18n.coords_error_desc + ': [x:' + (heroesCoords.x - coords.x) + ', y:' + (heroesCoords.y - coords.y) + '].</div>'
			});
			ui_utils.hasShownInfoMessage = true;
		}
		if (this.wormholeMoveIndex) {
			this.wormholeMoveIndex = 0;
			ui_storage.set('Log:' + ui_stats.logId() + ':wormholes','[]');
		}
	}
	// highlight treasury on the map
	GUIp.common.improveMap.call(this,'map');
};

ui_improver.improveIslandsMap = function() {
	if (!ui_data.isSail) {
		return;
	}
	var mapSettings = ui_storage.get('Option:islandsMapSettings') || '';
	if (this.isFirstTime) {
		if (!document.querySelector('#s_map .block_title')) {
			ui_data.isSail = false;
			return;
		}
		if (mapSettings.match('widen')) {
			this.sailPageResize = true;
			this.whenWindowResize();
		}
		ui_improver.islandsMapPoints = GUIp.common.islandsMapLoadPOI(ui_storage.get('Log:' + ui_stats.logId() + ':points'),ui_stats.logId());
	}
	// write useless info to console
	var currentStep = ui_stats.currentStep();
	worker.console.log('[eGUI+] debug: sail map update on step: ' + currentStep);
	// detect missing beasties in our lists
	var enemies = document.querySelectorAll('#opps .opp_n:not(.improved)');
	if (ui_improver.seaMonstersRE)
	for (var i = 0, len = enemies.length; i < len; i++) {
		if (ui_stats.EnemySingle_MaxHP(i+1) >= 100) {
			continue;
		}
		if (enemies[i].textContent && !(enemies[i].textContent + ' ').match(ui_improver.seaMonstersRE)) {
			enemies[i].insertAdjacentHTML('beforeend', '<span class="e_beareport"> <a title="' + worker.GUIp_i18n.sea_monster_report + '" href="//gv.erinome.net/beastiereport?name=' + encodeURIComponent(enemies[i].textContent) + '&hp=' + encodeURIComponent(ui_stats.EnemySingle_MaxHP(i+1)) + '&locale=' + worker.GUIp_locale + '" target="_blank">[?]</a></span>');
			enemies[i].classList.add('improved');
		}
	}
	// detect map size
	var transform, pborder, qborder = [];
	if ((pborder = document.querySelectorAll('g.tile.border')).length) {
		for (var i = 0, len = pborder.length; i < len; i++) {
			transform = pborder[i].transform.baseVal[0].matrix;
			qborder = qborder.concat(GUIp.common.tconv(11,transform.e,transform.f));
		}
		ui_improver.islandsMapRadius = Math.max.apply(null,qborder.map(Math.abs));
	}
	// update hints
	if (!mapSettings.match('shh')) {
		GUIp.common.islandsMapImproveHints.call(ui_improver,{fhp:true,dhh:mapSettings.match('dhh')});
	} else {
		GUIp.common.islandsMapImproveHints2.call(ui_improver,{fhp:true,dhh:mapSettings.match('dhh')});
	}
	// update pois
	var tiles, pos, colorIndex, changedPoints = false;
	for (var i = 1; i <= 7; i++) {
		tiles = document.querySelectorAll('g.tile.i' + i + ', g.tile.oi' + i);
		if (tiles.length) {
			colorIndex = GUIp.common.islandsMapGetPOIColor(ui_improver.islandsMapPoints, mapSettings.match('rndc'));
		}
		cpLoop:
		for (var j = 0, len = tiles.length; j < len; j++) {
			transform = tiles[j].transform.baseVal[0].matrix;
			pos = GUIp.common.array2lb(GUIp.common.tconv(11,transform.e,transform.f).concat([0]));
			for (var k = 0, len2 = ui_improver.islandsMapPoints.length; k < len2; k++) {
				if (pos === (ui_improver.islandsMapPoints[k] & 0xFFFFFF)) {
					continue cpLoop;
				}
			}
			ui_improver.islandsMapPoints.push(pos + colorIndex * 16777216);
			changedPoints = true;
		}
	}
	GUIp.common.islandsMapHighlightPOI(ui_improver.islandsMapPoints,{fhp:true,dhh:mapSettings.match('dhh')});
	if (changedPoints) {
		ui_storage.set('Log:' + ui_stats.logId() + ':points',GUIp.common.islandsMapSavePOI(ui_storage.get('Log:' + ui_stats.logId() + ':points'),ui_stats.logId(),ui_improver.islandsMapPoints));
	}
	// update visited islands for multipass seas
	if (this.islandsMapConds.match('multipass')) {
		if (this.islandsMapVisited === undefined) {
			this.islandsMapVisited = JSON.parse(ui_storage.get('Log:' + ui_stats.logId() + ':visited')) || {};
		}
		tiles = document.querySelectorAll('g.tile.island text');
		for (var i = 0, len = tiles.length; i < len; i++) {
			pos = tiles[i].parentNode.getAttribute('transform');
			if (this.islandsMapVisited[pos]) {
				tiles[i].parentNode.classList.add('e_visited');
			} else if (tiles[i].textContent.length === 0) {
				this.islandsMapVisited[pos] = 1;
			}
		}
		ui_storage.set('Log:' + ui_stats.logId() + ':visited', JSON.stringify(this.islandsMapVisited));
	}
	// check distances
	var tile, arks = [null,null,null,null], ownArk = -1;
	for (var i = 1; i <= 4; i++) {
		if (tile = document.querySelector('g.pl' + i)) {
			transform = tile.transform.baseVal[0].matrix;
			arks[i - 1] = (GUIp.common.tconv(11,transform.e,transform.f));
			if (ui_stats.Hero_Ally_Name(i) === ui_stats.charName()) {
				ownArk = i - 1;
			}
		}
	}
	if (arks[ownArk]) {
		var smapTitle = document.querySelector('#s_map .block_title');
		ui_improver.sailPortDistance = GUIp.common.islandsMapDistance(arks[ownArk],[0,0,0]);
		if (smapTitle) {
			smapTitle.innerHTML = smapTitle.innerHTML.replace(/\ \(.*\)$/,'') + ' (' + ui_utils.formatSailPosition(arks[ownArk],mapSettings) + ')';
		}
		var rivalsNearby = false;
		if (currentStep > 4) {
			for (var i = 0; i < 4; i++) {
				if (i === ownArk || !arks[i]) {
					continue;
				}
				if (GUIp.common.islandsMapDistance(arks[ownArk],arks[i]) < 4) {
					rivalsNearby = true;
				}
			}
		}
		ui_informer.update('close to rival', rivalsNearby);
	}
	if (currentStep !== +ui_storage.get('Log:' + ui_stats.logId() + ':steps')) {
		ui_storage.set('Log:current', ui_stats.logId());
		ui_storage.set('Log:' + ui_stats.logId() + ':steps', ui_stats.currentStep());
		if (mapSettings.match('conv')) {
			ui_storage.set('Log:' + ui_stats.logId() + ':map', JSON.stringify(GUIp.common.islandsMapConvert(11)));
		}
	}
};
ui_improver.parseSailPhrases = function() {
	ui_improver.seaMonstersData = JSON.parse(localStorage.getItem('LogDB:seaBeastiesList')) || [];
	ui_improver.seaMonstersRE = new worker.RegExp(('(' + ui_improver.seaMonstersData.map(function(a){return a.name;}).join('|') + ')([^<])'),'g');
	ui_improver.improveSailChronicles();
};
ui_improver.getSailPhrases = function() {
	if (+localStorage.getItem('LogDB:lastSailUpdate') < (Date.now() - 3*60*60*1000) || !localStorage.getItem('LogDB:seaBeastiesList')) {
		this.dungeonXHRCount++;
		GUIp.common.getXHR('/gods/' + (ui_storage.get('Option:customSailChronicler') || (worker.GUIp_locale === 'ru' ? 'Kreon' : 'El Kreono')), function(xhr) {
			var response, stats, beastie, result = [];
			try {
				if (!(response = xhr.responseText.match(new worker.RegExp('<p>seaBeasties\\b([\\s\\S]+?)<\/p>')))) {
					throw 'required data not found';
				}
				response = response[1].replace(/&#8230;/g, '...').replace(/^<br>\n|<br>$/g, '').split('| |');
				for (var i = 0, len = response.length; i < len; i++) {
					stats = response[i].split('|');
					beastie = {};
					beastie.name = stats[0];
					if (stats[1] !== '5') {
						beastie.hp = stats[1] + '0-' + stats[1] + '9';
					} else { 
						beastie.hp = '50+';
						beastie.tre = 1;
					}
					result.push(beastie);
				}
				localStorage.setItem('LogDB:seaBeastiesList', JSON.stringify(result));
				localStorage.setItem('LogDB:lastSailUpdate', Date.now());
			} catch(e) {
				worker.console.log('[eGUI+] error: sea beasties list update failed: ' + e);
			}
			ui_improver.parseSailPhrases();
		}, function() {
			ui_improver.parseSailPhrases();
		});
		return;
	}
	ui_improver.parseSailPhrases();
};
ui_improver.parseSailChronicles = function(texts) {
	if (!texts) {
		worker.console.log('[eGUI+] warning: initial parsing chronicles from the campaign page failed!');
		return;
	}
	this.islandsMapConds = GUIp.common.islandsMapGetConds(texts).join(',');
	this.improveIslandsMap();
};
ui_improver.improveSailChronicles = function() {
	if (this.needLog) {
		if (ui_stats.currentStep() < 5) {
			var conds = document.querySelector('#m_fight_log .d_imp .d_msg');
			if (conds) {
				ui_improver.parseSailChronicles(conds.textContent);
			}
		} else if (this.dungeonXHRCount < 5) {
			this.dungeonXHRCount++;
			GUIp.common.getXHR('/duels/log/' + ui_stats.logId(), function(xhr) {
				var matches = xhr.responseText.match(/<div class="new_line saild_" style='[^']*'>[\s\S]*?<div class="text_content .*?">[\s\S]+?<\/div>/g);
				if (matches) {
					ui_improver.parseSailChronicles(matches[1]);
				}
			});
		}
		this.needLog = false;
	}
	if (ui_improver.seaMonstersData === undefined) {
		if (this.dungeonXHRCount < 5) {
			ui_improver.getSailPhrases();
		}
		return;
	}
	if (!ui_improver.seaMonstersData.length) {
		return;
	}
	var i, len, len2, content, chronicles = document.querySelectorAll('#m_fight_log .d_msg:not(.parsed)'),
		replacer = function(m, p1, p2) {
			var beastie = ui_improver.seaMonstersData.filter(function(beastie) { return beastie.name === p1; })[0];
			if (beastie) {
				return '<span class="e_smonster' + (beastie.tre ? ' e_smonster_tre' : '') + '" title="' + worker.GUIp_i18n.sea_monster + ' [' + beastie.hp + ']">' + p1 + '</span>' + p2;
			}
			return p1 + p2;
		};
	for (i = 0, len = chronicles.length; i < len; i++) {
		if (chronicles[i].innerHTML.match(ui_improver.seaMonstersRE)) {
			chronicles[i].innerHTML = chronicles[i].innerHTML.replace(ui_improver.seaMonstersRE,replacer);
		}
		chronicles[i].classList.add('parsed');
	}
};
ui_improver.whenWindowResize = function() {
	ui_improver.chatsFix();
	// sail mode column resizing
	if (ui_improver.sailPageResize) {
		var sccwidth,
			sclwidth = worker.$('#a_left_block').outerWidth(true),
			scrwidth = worker.$('#a_right_block').outerWidth(true),
			scl2width = worker.$('#a_left_left_block'),
			scr2width = worker.$('#a_right_right_block'),
			maxwidth = worker.$(worker).width() * 0.85;
		scl2width = scl2width[0] && scl2width[0].offsetWidth ? scl2width.outerWidth(true) : 0;
		scr2width = scr2width[0] && scr2width[0].offsetWidth ? scr2width.outerWidth(true) : 0;
		sccwidth = Math.max(Math.min((maxwidth - sclwidth - scl2width - scrwidth - scr2width),932),448); // todo: get rid of hardcoded values?
		worker.$('#a_central_block').width(sccwidth);
		sccwidth = worker.$('#a_central_block').outerWidth(true);
		//worker.$('#main_wrapper').width(sccwidth + sclwidth + scl2width + scrwidth + scr2width + 20);
		worker.$('.c_col .block_title').each(function() { worker.$(this).width(sccwidth - 115); });
	}
	// body widening
	worker.$('body').width(worker.$(worker).width() < worker.$('#main_wrapper').width() ? worker.$('#main_wrapper').width() : '');
};
ui_improver._clockToggle = function(e) {
	if (e) {
		e.stopPropagation();
	}
	if (!ui_improver.clockToggling) {
		ui_improver.clockToggling = true;
	} else {
		return;
	}
	var restoreText, clockElem = worker.$('#control .block_title');
	if (ui_improver.clock) {
		worker.clearInterval(ui_improver.clock.updateTimer);
		restoreText = ui_improver.clock.prevText;
		clockElem.fadeOut(500, function() {
			clockElem.css('color', '');
			clockElem.text(restoreText).fadeIn(500);
			clockElem.prop('title', worker.GUIp_i18n.show_godville_clock);
			ui_improver.clockToggling = false;
		});
		delete ui_improver.clock;
	} else {
		ui_improver.clock = {};
		ui_improver.clock.prevText = clockElem.text();
		ui_improver.clock.blocked = true;
		clockElem.fadeOut(500, function() {
			clockElem.text('--:--:--').fadeIn(500);
			clockElem.prop('title', worker.GUIp_i18n.hide_godville_clock);
			ui_improver.clock.timeBegin = new Date();
			ui_improver.clock.useGVT = true || (document.location.protocol === 'https:');
			if (ui_improver.clock.useGVT) {
				GUIp.common.getXHR('/forum', ui_improver._clockSync, function(xhr) {ui_improver.clockToggling = false; ui_improver._clockToggle(e);}); /* syncing this way is too inaccurate unfortunately */
			} else {
				GUIp.common.getXHR('//time.akamai.com/?iso', ui_improver._clockSync, function(xhr) {ui_improver.clockToggling = false; ui_improver._clockToggle();});
			}
		});
	}
};
ui_improver._clockSync = function(xhr) {
	ui_improver.clockToggling = false;
	var currentTime = new Date(),
		offsetHours = ui_storage.get("Option:offsetGodvilleClock") || 3,
		clockTitle = worker.$('#control .block_title');
	if (currentTime - ui_improver.clock.timeBegin > 500) {
		clockTitle.css('color', '#CC0000');
	}
	if (!ui_improver.clock.useGVT) {
		ui_improver.clock.timeDiff = new Date(xhr.responseText) - currentTime + (ui_storage.get('Option:localtimeGodvilleClock') ? (currentTime.getTimezoneOffset() * -60000) : (offsetHours * 3600000));
	} else {
		ui_improver.clock.timeDiff = new Date(xhr.getResponseHeader("Date")) - currentTime + (ui_storage.get('Option:localtimeGodvilleClock') ? (currentTime.getTimezoneOffset() * -60000) : (offsetHours * 3600000));
	}
	ui_improver.clock.updateTimer = worker.setInterval(ui_improver._clockUpdate, 250);
	ui_improver._clockUpdate();
};
ui_improver._clockUpdate = function() {
	var currentTime = new Date();
	if (currentTime.getTime() - ui_improver.clock.timeBegin.getTime() > (300 * 1000)) {
		ui_improver._clockToggle();
		return;
	}
	var clockElem = worker.$('#control .block_title'),
		godvilleTime = new Date(currentTime.getTime() + ui_improver.clock.timeDiff);
	if (!ui_improver.clock.useGVT) {
		clockElem.text(ui_utils.formatClock(godvilleTime));
	} else {
		clockElem.text(ui_utils.formatClock(godvilleTime) + ' (via GVT)');
		clockElem.prop('title', worker.GUIp_i18n.warning_godville_clock);
	}
};

ui_improver.improveInterface = function(forcedUpdate) {
	if (this.isFirstTime) {
		worker.$('a[href=#]').removeAttr('href');
		ui_improver.whenWindowResize();
		worker.onresize = function() {
			worker.clearInterval(ui_improver.windowResizeInt);
			ui_improver.windowResizeInt = worker.setTimeout(ui_improver.whenWindowResize.bind(ui_improver), 250);
		};
		if (ui_storage.get('Option:themeOverride')) {
			ui_utils.switchTheme(ui_storage.get('ui_s'),true);
		} else {
			ui_utils.switchTheme();
		}
		worker.addEventListener('focus', function() {
			ui_improver.checkGCMark('focus');
			ui_informer.updateCustomInformers();
			// forcefully fire keyup event on focus to prevent possible issues with alt key processing
			worker.$(document).trigger(worker.$.Event( "keyup", { originalEvent: {} } ))
		});
		// cache private messages
		worker.setTimeout(function() {
			var contact, msgs = document.querySelectorAll('.frline .frmsg_i');
			ui_utils.pmNotificationNoted = {};
			for (var i = 0, len = msgs.length; i < len; i++) {
				contact = msgs[i].parentNode.getElementsByClassName('frname')[0];
				contact = contact ? contact.textContent : 'unknown';
				ui_utils.pmNotificationNoted[contact] = msgs[i].textContent;
			}
		},5e3);
		// experimental keep-screen-awake feature for Firefox Mobile
		if (worker.navigator.userAgent.match(/Android/) && worker.navigator.requestWakeLock) {
			ui_improver.createWakelock();
		}
		if (!ui_data.isFight && !ui_storage.get('Option:disableGodvilleClock') && document.querySelector('#control .block_title')) {
			var controlTitle = document.querySelector('#control .block_title');
			controlTitle.title = worker.GUIp_i18n.show_godville_clock;
			controlTitle.style.cursor = 'pointer';
			controlTitle.onclick = ui_improver._clockToggle.bind(null);
		}
		if (ui_storage.get('Option:improveDischargeButton')) {
			var dischargeHandlers, dischargeButton = worker.$('#acc_links_wrap .dch_link');
			worker.$('#cntrl .enc_link').click(function() { ui_improver.last_infl = 'enc'; });
			worker.$('#cntrl .pun_link').click(function() { ui_improver.last_infl = 'pun'; });
			worker.$('#cntrl .mir_link').click(function() { ui_improver.last_infl = 'mir'; });
			if (dischargeButton.length) {
				dischargeHandlers = worker.$._data(dischargeButton[0],'events');
				if (dischargeHandlers.click && dischargeHandlers.click.length === 1) {
					dischargeButton.click(function() {
						try {
							var limit = ui_stats.Max_Godpower() - 50;
							if (ui_improver.dailyForecast && ui_improver.dailyForecast.match('accu70')) {
								limit -= 20;
							}
							if (worker.$('#voice_submit').attr('disabled') === 'disabled') {
								limit += 5;
							}
							if (!worker.$('#cntrl .enc_link').hasClass('div_link')) {
								if (ui_improver.last_infl === 'mir') {
									limit += 50;
								} else {
									limit += 25;
								}
							}
							worker.console.log('[eGUI+] debug: acc_discharge dynamic limit = ' + limit);
							localStorage.setItem('gp_thre',limit);
						} catch (e) {
							worker.console.log('[eGUI+] error: setting discharge dynamic limit failed.');
							worker.console.log(e);
						}
					});
					dischargeHandlers.click.reverse();
				}
			}
		}
		if (worker.GUIp_browser === 'Firefox') {
			try {
				worker.$(document).bind('click', function(e) {
					if (e.which !== 1) {
						e.stopImmediatePropagation();
					}
				});
				var rmClickFix, clickHandlers = worker.$._data(document,'events');
				if (clickHandlers.click && clickHandlers.click.length) {
					rmClickFix = clickHandlers.click.pop();
					clickHandlers.click.splice(clickHandlers.click.delegateCount || 0,0,rmClickFix);
				}
			} catch (e) {
				worker.console.log('[eGUI+] error: failed to init rmclickfix workaround:');
				worker.console.log(e);
			}
		}
		GUIp.common.addCSSFromString(ui_storage.get('UserCss'));
	}
	if (ui_data.isFight && !document.getElementById('e_broadcast')) {
		var qselector = ui_data.isSail ? '#control .block_title, #m_control .block_title' : ui_data.isDungeon ? '#map .block_title, #control .block_title, #m_control .block_title' : '#control .block_title, #m_control .block_title';
		if (document.querySelector(qselector)) {
			document.querySelector(qselector).insertAdjacentHTML('beforeend', ' <a id="e_broadcast" class="broadcast" href="/duels/log/' + ui_stats.logId() + '" target="_blank">' + worker.GUIp_i18n.broadcast + '</a>');
		}
	}
	if (!document.getElementById('e_custom_informers_setup') && ui_informer.activeInformers.custom_informers) {
		ui_utils.generateLightboxSetup('custom_informers','#stats .block_title, #m_info .block_title',function() { ui_words.init(); });
	}
	if (!ui_data.isFight && !document.getElementById('e_custom_craft_setup') && ui_storage.get('Option:enableCustomCraft')) {
		ui_utils.generateLightboxSetup('custom_craft','#inventory .block_title',function() { ui_words.init(); ui_inventory.rebuildCustomCraft(); ui_improver.calculateButtonsVisibility(true); });
	}
	if (ui_data.isFight && !document.getElementById('e_ally_blacklist_setup') && document.querySelector('#alls .block_title')) {
		ui_utils.generateLightboxSetup('ally_blacklist','#alls .block_title',function() { ui_words.init(); ui_improver.improveAllies(); });
	}
	if (this.isFirstTime || forcedUpdate) {
		GUIp.common.setPageBackground(ui_storage.get('Option:useBackground'));
	}
};
ui_improver.improveLastFights = function() {
	if (!document.getElementById('lf_popover_c')) {
		worker.clearInterval(ui_improver.improveLastFightsInt);
		delete ui_improver.improveLastFightsInt;
		return;
	}
	var lflinks = document.querySelectorAll('#lf_popover_c .wl_ftype.wl_stats a');
	if (!lflinks.length) {
		return;
	}
	worker.clearInterval(ui_improver.improveLastFightsInt);
	delete ui_improver.improveLastFightsInt;
	if (ui_timers._sparResults === undefined) {
		return;
	}
	for (var i = 0, len = lflinks.length; i < len; i++) {
		if (lflinks[i] && lflinks[i].textContent.match('Тренировка|Spar')) {
			var logId = (lflinks[i].href.match(/\/duels\/log\/(.*?)$/) || '')[1];
			for (var j = 0, len = ui_timers._sparResults.length; j < len; j++) {
				if (ui_timers._sparResults[j].id === logId && ui_timers._sparResults[j].won) {
					var span = document.createElement('span');
					span.classList.add('e_awl_won');
					span.textContent = '★';
					if (ui_timers._sparResults[j].exp) {
						span.classList.add('e_awl_exp');
					}
					lflinks[i].parentNode.insertBefore(span,null);
					break;
				}
			}
		}
	}
};
ui_improver.improveLastVoices = function() {
	if (!document.querySelector('#gv_popover_c .gv_list_empty')) {
		return;
	}
	var lvContent = document.querySelectorAll('.lv_text .div_link_nu');
	if (!lvContent.length) {
		return;
	}
	for (var i = 0, len = lvContent.length; i < len; i++) {
		lvContent[i].onclick = function() { ui_utils.triggerChangeOnVoiceInput(); };
	}
};
ui_improver.improveStoredPets = function() {
	var splinks = document.querySelectorAll('.wup-content .pets_line > a:not(.no_link)');
	if (!splinks.length) {
		return;
	}
	var sp = [];
	for (var i = 0, len = splinks.length; i < len; i++) {
		sp.push(splinks[i].textContent.toLowerCase());
	}
	ui_storage.set('charStoredPets',JSON.stringify(sp));
	ui_data.storedPets = sp;
};
ui_improver.calculateButtonsVisibility = function(forcedUpdate) {
	var i, j, len, baseCond = (document.getElementById('godvoice') || {}).offsetParent && !ui_storage.get('Option:disableVoiceGenerators') && ui_stats.HP() > 0,
		isMonster = ui_stats.monsterName();
	if (!ui_data.isFight) {
		// inspect buttons
		var inspBtns = document.getElementsByClassName('inspect_button'),
			inspBtnsBefore = [], inspBtnsAfter = [];
		for (i = 0, len = inspBtns.length; i < len; i++) {
			inspBtnsBefore[i] = !inspBtns[i].classList.contains('hidden');
			inspBtnsAfter[i] = baseCond && !isMonster;
		}
		ui_improver.setButtonsVisibility(inspBtns, inspBtnsBefore, inspBtnsAfter);
		// craft buttons
		if (this.isFirstTime || forcedUpdate) {
			this.crftBtns = [document.getElementsByClassName('craft_button b_b')[0],
							 document.getElementsByClassName('craft_button b_r')[0],
							 document.getElementsByClassName('craft_button r_r')[0],
							 document.getElementsByClassName('craft_button span')[0],
							 document.getElementsByClassName('craft_group b_b')[0],
							 document.getElementsByClassName('craft_group b_r')[0],
							 document.getElementsByClassName('craft_group r_r')[0]
							];
			this.crftCustom = [[],[],[]];
			for (i = 0; i < 3; i++) {
				var ccrbs = this.crftBtns[i+4].getElementsByClassName('craft_button');
				for (j = 0, len = ccrbs.length; j < len; j++) {
					this.crftCustom[i].push(this.crftBtns.length);
					this.crftBtns.push(ccrbs[j]);
				}
			}
		}
		var crftBtnsBefore = [], crftBtnsAfter = [],
			crftFixed = ui_storage.get('Option:fixedCraftButtons');
		for (i = 0, len = this.crftBtns.length; i < len; i++) {
			crftBtnsBefore[i] = !this.crftBtns[i].classList.contains('hidden');
			crftBtnsAfter[i] = !(!crftFixed && (!baseCond || isMonster));
		}
		crftBtnsAfter[0] = crftBtnsAfter[0] && ui_inventory.b_b.length;
		crftBtnsAfter[1] = crftBtnsAfter[1] && ui_inventory.b_r.length;
		crftBtnsAfter[2] = crftBtnsAfter[2] && ui_inventory.r_r.length;
		crftBtnsAfter[3] = crftBtnsAfter[0] || crftBtnsAfter[1] || crftBtnsAfter[2];

		for (i = 7, len = this.crftBtns.length; i < len; i++) {
			crftBtnsAfter[i] = crftBtnsAfter[i] && ui_inventory[this.crftBtns[i].id] && ui_inventory[this.crftBtns[i].id].length;
		}
		for (i = 0; i < 3; i++) {
			var crftGroupActive = false;
			for (j = 0, len = this.crftCustom[i].length; j < len; j++) {
				if (crftBtnsAfter[this.crftCustom[i][j]]) {
					crftGroupActive = true;
					break;
				}
			}
			crftBtnsAfter[i+4] = crftBtnsAfter[i+4] && crftGroupActive && crftBtnsAfter[i];
		}
		ui_improver.setButtonsVisibility(this.crftBtns, crftBtnsBefore, crftBtnsAfter);

		if (crftFixed) {
			for (i = 0, len = this.crftBtns.length; i < len; i++) {
				if (baseCond && !isMonster) {
					this.crftBtns[i].classList.remove('crb_inactive');
				} else {
					this.crftBtns[i].classList.add('crb_inactive');
				}
			}
		}
		// if we're in trader mode then try to mark some buttons as unavailable (TODO: move this code somewhere else?)
		if (ui_data.hasShop) {
			var activityButtons = document.querySelectorAll('#cntrl1 a, #cntrl2 a, a.voice_generator, a.craft_button, a.inspect_button'),
				inShop = document.querySelectorAll('#trader .line a');
			if (inShop[1] && inShop[1].style.display !== 'none' || ui_improver.inShopTest) {
				if (!ui_data.inShop) {
					ui_improver.activity();
					ui_data.inShop = true;
					for (i = 0, len = activityButtons.length; i < len; i++) {
						activityButtons[i].classList.add('crb_inactive');
					}
					if (document.getElementById('voice_submit')) {
						document.getElementById('voice_submit').style.color = 'silver';
					}
					ui_storage.set('Logger:Hero_Gold', ui_stats.Gold());
					ui_storage.set('Logger:Hero_Inv', ui_stats.Inv());
				}
			} else if (ui_data.inShop) {
				ui_improver.activity();
				ui_data.inShop = false;
				for (i = 0, len = activityButtons.length; i < len; i++) {
					activityButtons[i].classList.remove('crb_inactive');
				}
				if (document.getElementById('voice_submit')) {
					document.getElementById('voice_submit').style.color = '';
				}
			}
		}
	}
	// voice generators
	if (this.isFirstTime) {
		this.voicegens = document.getElementsByClassName('voice_generator');
		this.voicegenClasses = [];
		for (i = 0, len = this.voicegens.length; i < len; i++) {
			this.voicegenClasses[i] = this.voicegens[i].className;
		}
	}
	var voicegensBefore = [], voicegensAfter = [],
		specialConds, specialClasses;
	if (!ui_data.isFight) {
		var isGoingBack = ui_stats.isGoingBack(),
			isTown = ui_stats.townName(),
			isSearching = ui_stats.lastNews().match('дорогу'),
			dieIsDisabled = ui_storage.get('Option:disableDieButton'),
			isFullGP = ui_stats.Godpower() === ui_stats.Max_Godpower(),
			isFullHP = ui_stats.HP() === ui_stats.Max_HP(),
			canQuestBeAffected = !ui_stats.Task_Name().match(/\((?:выполнено|completed|отменено|cancelled)\)/);
		specialClasses = ['heal', 'do_task', 'cancel_task', 'die', 'exp', 'dig', 'town', 'pray'];
		specialConds = [isMonster || isGoingBack || isTown || isSearching || isFullHP,				// heal
						isMonster || isGoingBack || isTown || isSearching || !canQuestBeAffected,	// do_task
																			 !canQuestBeAffected,	// cancel_task
						isMonster ||				isTown ||				 dieIsDisabled,			// die
						isMonster,																	// exp
						isMonster ||										 isTown,				// dig
						isMonster || isGoingBack || isTown ||				 isSearching,			// town
						isMonster ||										 isFullGP				// pray
					   ];
	}
	baseCond = baseCond && !worker.$('.r_blocked:visible').length;
	for (i = 0, len = this.voicegens.length; i < len; i++) {
		voicegensBefore[i] = !this.voicegens[i].classList.contains('hidden');
		voicegensAfter[i] = baseCond;
		if (baseCond && !ui_data.isFight) {
			for (var j = 0, len2 = specialConds.length; j < len2; j++) {
				if (specialConds[j] && this.voicegenClasses[i] && this.voicegenClasses[i].match(specialClasses[j])) {
					voicegensAfter[i] = false;
				}
			}
		}
	}
	ui_improver.setButtonsVisibility(this.voicegens, voicegensBefore, voicegensAfter);
};
ui_improver.setButtonsVisibility = function(btns, before, after) {
	for (var i = 0, len = btns.length; i < len; i++) {
		if (before[i] && !after[i]) {
			ui_utils.hideElem(btns[i], true);
		}
		if (!before[i] && after[i]) {
			ui_utils.hideElem(btns[i], false);
		}
	}
};
ui_improver.chatsFix = function() {
	var i, len, cells = document.querySelectorAll('.frDockCell');
	for (i = 0, len = cells.length; i < len; i++) {
		cells[i].classList.remove('left');
		cells[i].style.zIndex = len - i;
		if (cells[i].getBoundingClientRect().right < 350) {
			cells[i].classList.add('left');
		}
	}
	//padding for page settings link
	var chats = document.getElementsByClassName('frDockCell'),
		clen = chats.length,
		padding_bottom = clen ? chats[0].getBoundingClientRect().bottom - chats[clen - 1].getBoundingClientRect().top : worker.GUIp_browser === 'Opera' ? 27 : 0,
		isBottom = worker.scrollY >= document.documentElement.scrollHeight - document.documentElement.clientHeight - 10;
	padding_bottom = Math.floor(padding_bottom*10)/10 + 10;
	padding_bottom = (padding_bottom < 0) ? 0 : padding_bottom + 'px';
	document.getElementsByClassName('reset_layout')[0].style.paddingBottom = padding_bottom;
	if (isBottom) {
		worker.scrollTo(0, document.documentElement.scrollHeight - document.documentElement.clientHeight);
	}
};
ui_improver.improveChat = function() {
	// godnames in gc paste fix
	worker.$('.gc_fr_god:not(.improved)').unbind('click').click(function() {
		var ta = this.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('textarea'),
			pos = ta.selectionDirection === 'backward' ? ta.selectionStart : ta.selectionEnd;
		ta.value = ta.value.slice(0, pos) + '@' + this.textContent + ', ' + ta.value.slice(pos);
		ta.focus();
		ta.selectionStart = ta.selectionEnd = pos + this.textContent.length + 3;
	}).addClass('improved');
};
ui_improver.checkGCMark = function(csource) {
	var gc_tab = document.querySelector('.msgDock.frDockCell.frbutton_pressed .dockfrname');
	if (gc_tab && gc_tab.textContent.match(/Гильдсовет|Guild Council/) && gc_tab.parentNode.getElementsByClassName('fr_new_msg').length) {
		worker.console.log('[eGUI+] debug: triggering focus for gcmr (on ' + csource + ')');
		worker.$('.frbutton_pressed textarea').triggerHandler('focus');
	}
};
ui_improver.createWakelock = function() {
	var wakelockSwitch = document.createElement('div');
	wakelockSwitch.id = 'wakelock_switch';
	wakelockSwitch.textContent = '💡';
	wakelockSwitch.onclick = this.switchWakelock.bind(null);
	document.getElementById('main_wrapper').insertBefore(wakelockSwitch,null);
	if (ui_storage.get('wakelockEnabled')) {
		wakelockSwitch.click();
	}
};
ui_improver.switchWakelock = function() {
	var wakelockSwitch = document.getElementById('wakelock_switch');
	if (ui_improver.wakeLock) {
		ui_improver.wakeLock.unlock();
		ui_improver.wakeLock = null;
		ui_storage.set('wakelockEnabled',false);
		wakelockSwitch.classList.remove('wakelock_enabled');
	} else {
		ui_improver.wakeLock = worker.navigator.requestWakeLock('screen');
		if (ui_improver.wakeLock) {
			ui_storage.set('wakelockEnabled',true);
			wakelockSwitch.classList.add('wakelock_enabled');
		}
	}
};
ui_improver.activity = function() {
	if (!ui_logger.updating) {
		ui_logger.updating = true;
		worker.setTimeout(function() {
			ui_logger.updating = false;
		}, 500);
		ui_logger.update();
	}
};
ui_improver.improvementDebounce = function(mutations) {
	worker.clearTimeout(ui_improver.improveTmt);
	ui_improver.improveTmt = worker.setTimeout(function() {
		ui_improver.improve();
		if (ui_data.isFight) {
			ui_logger.update();
		}
	}, 250);
};


// ui_inventory
var ui_inventory = worker.GUIp.inventory = {};

ui_inventory.observer = {
	config: {
		childList: true,
		attributes: true,
		subtree: true,
		attributeFilter: ['style']
	},
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) {
			return mutation.target.tagName.toLowerCase() === 'li' && mutation.type === "attributes" &&
				   mutation.target.style.display === 'none' && mutation.target.parentNode ||
				   mutation.target.tagName.toLowerCase() === 'ul' && mutation.addedNodes.length;
		}, ui_inventory._update.bind(ui_inventory));
	},
	target: ['#inventory ul']
};
ui_inventory.init = function() {
	if (ui_data.isFight) {
		return;
	}
	this.forbiddenCraft = ui_storage.get('Option:forbiddenCraft') || '';
	this._createCraftButtons();
	this._update();
	ui_observers.start(ui_inventory.observer);
};
ui_inventory.rebuildCustomCraft = function() {
	var groupType, rebuiltGroup, craftGroups = document.getElementsByClassName('craft_group');
	for (var i = 0, len = craftGroups.length; i < len; i++)
	{
		while (craftGroups[i].firstChild) {
			craftGroups[i].removeChild(craftGroups[i].firstChild);
		}
		groupType = craftGroups[i].className.match(/(b_b|b_r|r_r)/g);
		if (groupType) {
			rebuiltGroup = ui_inventory._createCraftSubGroup(groupType[0]);
			rebuiltGroup.className = craftGroups[i].className;
			craftGroups[i].parentNode.replaceChild(rebuiltGroup,craftGroups[i]);
		}
	}
	ui_inventory._update();
};
ui_inventory._createCraftButtons = function() {
	var customGroup, relocateButtons = ui_storage.get('Option:relocateCraftButtons'),
		invContent = document.querySelector('#inventory .block_content'),
		craftContent = document.createElement('span');
	if (!invContent) {
		return;
	}
	craftContent.className = 'craft_button span';
	craftContent.insertBefore(ui_inventory._createCraftButton(worker.GUIp_i18n.b_b, 'b_b', worker.GUIp_i18n.b_b_hint), null);
	craftContent.insertBefore(ui_inventory._createCraftSubGroup('b_b'), null);
	craftContent.insertBefore(ui_inventory._createCraftButton(worker.GUIp_i18n.b_r, 'b_r', worker.GUIp_i18n.b_r_hint), null);
	craftContent.insertBefore(ui_inventory._createCraftSubGroup('b_r'), null);
	craftContent.insertBefore(ui_inventory._createCraftButton(worker.GUIp_i18n.r_r, 'r_r', worker.GUIp_i18n.r_r_hint), null);
	craftContent.insertBefore(ui_inventory._createCraftSubGroup('r_r'), null);
	invContent.insertBefore(craftContent, relocateButtons ? invContent.firstChild : null);
};
ui_inventory._createInspectButton = function(item_name) {
	var a = document.createElement('a');
	a.className = 'inspect_button' + (ui_data.inShop ? ' crb_inactive' : '');
	a.title = worker.GUIp_i18n.ask1 + ui_data.char_sex[0] + worker.GUIp_i18n.inspect + item_name;
	a.textContent = '?';
	a.onclick = ui_inventory._inspectButtonClick.bind(null, item_name);
	return a;
};
ui_inventory._inspectButtonClick = function(item_name) {
	ui_utils.setVoice(ui_words.inspectPhrase(worker.GUIp_i18n.trophy + item_name));
	return false;
};
ui_inventory._createCraftButton = function(combo, combo_list, hint) {
	var a = document.createElement('a');
	if (combo_list.indexOf('customCraft-') < 0) {
		a.className = 'craft_button ' + combo_list + (ui_data.inShop ? ' crb_inactive' : '');
		a.title = worker.GUIp_i18n.ask2 + ui_data.char_sex[0] + worker.GUIp_i18n.craft1 + hint + worker.GUIp_i18n.craft2;
	} else {
		a.className = 'craft_button' + (ui_data.inShop ? ' crb_inactive' : '');
		a.id = combo_list;
		a.title = worker.GUIp_i18n.ask2 + ui_data.char_sex[0] + worker.GUIp_i18n.craft1a + hint + worker.GUIp_i18n.craft2a;
	}
	a.innerHTML = combo;
	a.onclick = ui_inventory._craftButtonClick.bind(a, combo_list);
	return a;
};
ui_inventory._craftButtonClick = function(combo_list) {
	if (this.classList.contains('crb_inactive')) {
		return false;
	}
	var rand = Math.floor(Math.random()*ui_inventory[combo_list].length),
		items = ui_inventory[combo_list][rand];
	if (Math.random() < 0.5) {
		items.reverse();
	}
	ui_utils.setVoice(ui_words.craftPhrase(items[0] + worker.GUIp_i18n.and + items[1]));
	return false;
};
ui_inventory._createCraftSubGroup = function(combo_group) {
	var span = document.createElement('span'),
		customCraftGroups = ui_inventory._customCraftCheckGrp(combo_group);
	span.className = 'craft_group ' + combo_group + ' hidden';
	span.insertBefore(document.createElement('wbr'), null);
	span.insertBefore(document.createTextNode('('), null);
	for (var i = 0, len = customCraftGroups.length; i < len; i++) {
		span.insertBefore(document.createElement('wbr'), null);
		span.insertBefore(ui_inventory._createCraftButton(customCraftGroups[i].t, 'customCraft-'+combo_group+'-'+customCraftGroups[i].i, customCraftGroups[i].d), null);
	}
	span.insertBefore(document.createTextNode(')'), null);
	span.insertBefore(document.createElement('wbr'), null);
	return span;
};
ui_inventory._customCraftCheckGrp = function(grp) {
	var grpm, result = [];
	switch (grp) {
		case 'b_b': grpm = new worker.RegExp('ж|b','i'); break;
		case 'b_r': grpm = new worker.RegExp('с|m','i'); break;
		default: grpm = new worker.RegExp('н|r','i');
	}
	for (var i = 0, len = ui_words.base.custom_craft.length; i < len; i++) {
		var customCombo = ui_words.base.custom_craft[i];
		if (customCombo.q) {
			continue;
		}
		if (customCombo.g.match(grpm)) {
			result.push(customCombo);
		}
	}
	return result;
};
ui_inventory._update = function() {
	var i, len, item, count, usable, flags = [],
		bold_items = 0,
		trophy_type = {};
	// there's no inventory li-s in sail mode, but state.inventory is present nevertheless
	if (ui_data.isSail) {
		return;
	}
	for (i = 0, len = ui_words.base.usable_items.types.length; i < len; i++) {
		flags[i] = false;
	}
	// Parse items
	var inventory = document.querySelectorAll('#inventory ul li');
	for (i = 0, len = inventory.length; i < len; i++) {
		if (inventory[i].style.display === 'none') {
			continue;
		}
		item = inventory[i].firstChild.textContent;
		count = 1;
		if (inventory[i].firstChild.nextSibling && (count = inventory[i].firstChild.nextSibling.textContent.match(/\((\d+)( шт|pcs)\)$/))) {
			count = +count[1] || 1;
		}
		// color items and add buttons
		if (usable = inventory[i].querySelector('a.item_act_link_div')) { // usable item
			var description = (usable.title.match(/^(.*?) \([^\)]+\)$/) || [])[1],
				bold = inventory[i].style.fontWeight === 'bold',
				sect = ui_words.usableItemType(description);
			if (bold) {
				bold_items += count || 1;
			}
			if (sect !== -1) {
				flags[sect] = true;
			} else if (!ui_utils.hasShownInfoMessage) {
				ui_utils.hasShownInfoMessage = true;
				ui_utils.showMessage('info', {
					title: worker.GUIp_i18n.unknown_item_type_title,
					content: '<div>' + worker.GUIp_i18n.unknown_item_type_content + '<b>"' + description + '</b>"</div>'
				});
			}
			if (!(this.forbiddenCraft.match('usable') || (this.forbiddenCraft.match('b_b') && this.forbiddenCraft.match('b_r'))) && 
				!ui_words.usableItemTypeMatch(description, 'to arena box') && !ui_words.usableItemTypeMatch(description, 'temper box')) {
				trophy_type[item] = {a:true, b:bold};
			}
			// confirm dialog on item activation for firefox on Android
			if (worker.navigator.userAgent.match(/Android/)) {
				var ilink2, ilink = inventory[i].getElementsByTagName('a')[0];
				if (ilink && !inventory[i].getElementsByTagName('a')[1]) {
					ilink2 = document.createElement('a');
					ilink.parentNode.insertBefore(ilink2,ilink.nextSibling);
					ilink.style.display = 'none';
				} else {
					ilink2 = inventory[i].getElementsByTagName('a')[1];
				}
				if (ilink && ilink2) {
					ilink2.title = ilink.title;
					ilink2.className = ilink.className;
					ilink2.textContent = '★';
					ilink2.onclick = function(link) {
						return function() {
							if (link.classList.contains('div_link') && worker.confirm(link.title + '. ' + worker.GUIp_i18n.confirm_item_activate) || !link.classList.contains('div_link')) {
								link.click();
							}
						}
					}(ilink);
				}
			}
			if (ui_improver.dailyForecast && ui_improver.dailyForecast.match('cheapactivatables')) {
				inventory[i].classList.add('usable_item_fcc');
				inventory[i].classList.remove('usable_item_fce');
			} else if (ui_improver.dailyForecast && ui_improver.dailyForecast.match('expensiveactivatables')) {
				inventory[i].classList.add('usable_item_fce');
				inventory[i].classList.remove('usable_item_fcc');
			} else {
				inventory[i].classList.remove('usable_item_fcc,usable_item_fce');
			}
		} else if (inventory[i].style.fontStyle === 'italic') { // healing item
			// if item quantity has increased, it seems that class needs to be re-added again
			inventory[i].classList.add('heal_item');
			if (!(this.forbiddenCraft.match('heal') || (this.forbiddenCraft.match('b_r') && this.forbiddenCraft.match('r_r')))) {
				trophy_type[item] = {b:false};
			}
		} else {
			if (inventory[i].style.fontWeight === 'bold') { // bold item
				bold_items += count;
				if (!(this.forbiddenCraft.match('b_b') && this.forbiddenCraft.match('b_r')) &&
					!item.match('золотой кирпич| босса |старую шмотку')) {
					trophy_type[item] = {b:true};
				}
			} else {
				if (!(this.forbiddenCraft.match('b_r') && this.forbiddenCraft.match('r_r')) &&
					!item.match('пушистого триббла')) {
					trophy_type[item] = {b:false};
				}
			}
			if (!inventory[i].classList.contains('improved')) {
				inventory[i].insertBefore(ui_inventory._createInspectButton(item), null);
			}
		}
		if (ui_improver.wantedItems && item.match(ui_improver.wantedItems)) {
			inventory[i].classList.add('wanted_item');
		}
		inventory[i].classList.add('improved');
	}

	for (i = 0, len = flags.length; i < len; i++) {
		ui_informer.update(ui_words.base.usable_items.types[i], flags[i]);
	}
	ui_informer.update('transform!', flags[ui_words.base.usable_items.types.indexOf('transformer')] && bold_items >= 2);
	ui_informer.update('smelt!', flags[ui_words.base.usable_items.types.indexOf('smelter')] && ui_stats.Gold() >= 3000);

	ui_inventory._updateCraftCombos(trophy_type);
};
ui_inventory._updateCraftCombos = function(trophy_type) {
	// Склейка трофеев, формирование списков
	ui_inventory.b_b = [];
	ui_inventory.b_r = [];
	ui_inventory.r_r = [];
	var item_names = worker.Object.keys(trophy_type).sort(),
		ccraft_enabled = ui_storage.get('Option:enableCustomCraft');
	if (item_names.length) {
		for (var i = 0, len = item_names.length - 1; i < len; i++) {
			for (var j = i + 1; j < len + 1; j++) {
				if (item_names[i][0] === item_names[j][0]) {
					if (trophy_type[item_names[i]].b && trophy_type[item_names[j]].b) {
						if (!this.forbiddenCraft.match('b_b')) {
							ui_inventory.b_b.push([item_names[i], item_names[j]]);
						}
					} else if (!trophy_type[item_names[i]].b && !trophy_type[item_names[j]].b) {
						if (!this.forbiddenCraft.match('r_r')) {
							ui_inventory.r_r.push([item_names[i], item_names[j]]);
						}
					} else {
						if (!this.forbiddenCraft.match('b_r')) {
							ui_inventory.b_r.push([item_names[i], item_names[j]]);
						}
					}
				} else {
					break;
				}
			}
		}
		for (var i = 0, len = ui_words.base.custom_craft.length; i < len; i++) {
			var customCombo = ui_words.base.custom_craft[i];
			if (customCombo.g.match(/а|ж|a|b/i)) {
				ui_inventory['customCraft-b_b-'+customCombo.i] = [];
				if (ccraft_enabled) {
					for (var j = 0, len2 = ui_inventory.b_b.length; j < len2; j++) {
						if (customCombo.l.indexOf(ui_inventory.b_b[j][0][0].toLowerCase()) > -1) {
							/*if (customCombo.g.match(/а|a/i) && !customCombo.g.match(/ж|b/i) && (!trophy_type[ui_inventory.b_b[j][0]].a || !trophy_type[ui_inventory.b_b[j][1]].a)) {
								continue;
							}*/
							ui_inventory['customCraft-b_b-'+customCombo.i].push(ui_inventory.b_b[j]);
						}
					}
				}
			}
			if (customCombo.g.match(/с|m/i)) {
				ui_inventory['customCraft-b_r-'+customCombo.i] = [];
				if (ccraft_enabled) {
					for (var j = 0, len2 = ui_inventory.b_r.length; j < len2; j++) {
						if (customCombo.l.indexOf(ui_inventory.b_r[j][0][0].toLowerCase()) > -1) {
							ui_inventory['customCraft-b_r-'+customCombo.i].push(ui_inventory.b_r[j]);
						}
					}
				}
			}
			if (customCombo.g.match(/н|r/i)) {
				ui_inventory['customCraft-r_r-'+customCombo.i] = [];
				if (ccraft_enabled) {
					for (var j = 0, len2 = ui_inventory.r_r.length; j < len2; j++) {
						if (customCombo.l.indexOf(ui_inventory.r_r[j][0][0].toLowerCase()) > -1) {
							ui_inventory['customCraft-r_r-'+customCombo.i].push(ui_inventory.r_r[j]);
						}
					}
				}
			}
		}
	}
	// fixme! this shouldn't be called until everything in improver has finished loading
	if (!ui_improver.isFirstTime) {
		ui_improver.calculateButtonsVisibility();
	}
};
ui_inventory.getHealingItems = function() {
	var count, potions = 0,
		inventory = document.querySelectorAll('#inventory ul li');
	for (i = 0, len = inventory.length; i < len; i++) {
		if (inventory[i].style.display === 'none') {
			continue;
		}
		if (inventory[i].firstChild.nextSibling && (count = inventory[i].firstChild.nextSibling.textContent.match(/\((\d+)( шт|pcs)\)$/))) {
			count = +count[1] || 1;
		}
		if (inventory[i].style.fontStyle === 'italic') {
			potions += count || 1;
		}
	}
	return potions;
};
ui_inventory.getUnsellableItems = function() {
	var count, items = 0,
		inventory = document.querySelectorAll('#inventory ul li');
	for (i = 0, len = inventory.length; i < len; i++) {
		if (inventory[i].style.display === 'none') {
			continue;
		}
		if (inventory[i].firstChild.nextSibling && (count = inventory[i].firstChild.nextSibling.textContent.match(/\((\d+)( шт|pcs)\)$/))) {
			count = +count[1] || 1;
		}
		if (inventory[i].style.fontStyle === 'italic' || inventory[i].firstChild.textContent.match(/пушистого триббла|шкуру разыскиваемого|tribble|death of wanted monster/i)) {
			items += count || 1;
		}
	}
	return items;
};


// ui_timers
var ui_timers = worker.GUIp.timers = {};

ui_timers.init = function() {
	this._thirdEyeContent = [];
	if (ui_stats.hasTemple() && !ui_data.isSail) {
		if (!document.querySelector('#m_fight_log .block_h .l_slot, #diary .block_h .l_slot')) {
			// seems that in come cases it may fail to find place for timers immediately
			worker.setTimeout(ui_timers.init.bind(ui_timers), 1000);
			return;
		}
		if (!ui_timers._lsThirdEye()) {
			ui_timers._fallbackThirdEye = true;
			worker.setTimeout(function() {ui_timers._autoThirdEye()},200+300*Math.random());
		}
		document.querySelector('#m_fight_log .block_h .l_slot, #diary .block_h .l_slot').insertAdjacentHTML('beforeend', '<div id=\"imp_timer\" class=\"fr_new_badge hidden\" />');
		if (ui_data.isDungeon || (ui_data.isFight && ui_stats.Hero_Alls_Count() > 3)) {
			this.logTimer = document.querySelector('#imp_timer');
			this.logTimerIsDisabled = ui_storage.get('Option:disableLogTimer');
			ui_utils.hideElem(this.logTimer, this.logTimerIsDisabled);
		} else {
			this.layingTimer = document.querySelector('#imp_timer');
			this.layingTimerIsDisabled = ui_storage.get('Option:disableLayingTimer');
			ui_utils.hideElem(this.layingTimer, this.layingTimerIsDisabled);
		}
		if (!ui_storage.get('Option:disableLayingTimer') && !ui_storage.get('Option:disableLogTimer')) {
			var curTimer = this.layingTimer ? this.layingTimer : this.logTimer;
			curTimer.style.cursor = 'pointer';
			curTimer.onclick = ui_timers.toggleTimers.bind(ui_timers);
		}
	}
	ui_timers.tick();
	worker.setInterval(ui_timers.tick.bind(ui_timers), 60000);
};
ui_timers.getDate = function(entry) {
	return ui_storage.get('ThirdEye:' + entry) ? new Date(ui_storage.get('ThirdEye:' + entry)) : 0;
};
ui_timers.tick = function() {
	if (!ui_timers._fallbackThirdEye) {
		ui_timers._lsThirdEye();
	}
	// check for changes in the third eye
	if (!this._prevThirdEye || this._prevThirdEye !== JSON.stringify(ui_timers._thirdEyeContent)) {
		this._prevThirdEye = JSON.stringify(ui_timers._thirdEyeContent);
		this._updateThirdEye();
	}
	// update timers if required
	if (this.layingTimer && !this.layingTimerIsDisabled) {
		ui_timers._calculateTime(true, this._lastLayingDate);
	}
	if (this.logTimer && !this.logTimerIsDisabled) {
		ui_timers._calculateTime(false, this._penultLogDate);
	}
};
ui_timers._updateThirdEye = function() {
	if (!ui_timers._thirdEyeContent.length) {
		return;
	}
	var prevLayingDate = ui_timers.getDate('LastLaying'),
		prevLogDate = ui_timers.getDate('LastLog'),
		prevPenultDate = ui_timers.getDate('PenultLog'),
		prevSparDate = ui_timers.getDate('LastSpar');
	this._lastLayingDate = this._lastLogDate = this._penultLogDate = this._lastSparDate = 0;
	this._sparResults = JSON.parse(ui_storage.get('ThirdEye:SparResults') || '[]');
	var logs;
	for (var i = 0, len = ui_timers._thirdEyeContent.length; i < len; i++) {
		var curEntryDate = ui_timers._thirdEyeContent[i].date;
		if (ui_timers._thirdEyeContent[i].msg.match(/^(?:Возложила?.+?алтарь|Выставила? тридцать золотых столбиков|I placed \w+? bags of gold.+?sacrificial altar)/i) && curEntryDate > prevLayingDate) {
			this._lastLayingDate = prevLayingDate = curEntryDate;
		}
		if (ui_timers._thirdEyeContent[i].msg.match(/^Выдержка из хроники подземелья:|Notes from the dungeon:/i) && (logs = (ui_timers._thirdEyeContent[i].msg.match(/бревно для ковчега|ещё одно бревно|log for the ark/gi) || []).length)) {
			if (curEntryDate > prevLogDate) {
				while (logs--) {
					prevPenultDate = prevLogDate;
					this._penultLogDate = this._lastLogDate;
					this._lastLogDate = prevLogDate = curEntryDate;
				}
			} else if (curEntryDate < prevLogDate && curEntryDate > prevPenultDate) {
				this._penultLogDate = prevPenultDate = curEntryDate;
			}
		}
		if (ui_timers._thirdEyeContent[i].msg.match(/^Выдержка из хроники тренировочного боя:|Notes from the sparring fight:/i)) {
			var sparFound = false, sparWon = false, expGot = false,
				sparId = ui_timers._thirdEyeContent[i].link;
			if (ui_timers._thirdEyeContent[i].msg.match(new worker.RegExp(ui_data.char_name + ' (gets experience points for today|получает порцию опыта)','i'))) {
				if (curEntryDate > prevSparDate) {
					this._lastSparDate = prevSparDate = curEntryDate;
				}
				sparWon = true;
				expGot = true;
			}
			if (ui_timers._thirdEyeContent[i].msg.match(new worker.RegExp(ui_data.char_name + ' (wins the imaginary fight|заканчивает воображаемый поединок)','i'))) {
				if (curEntryDate > prevSparDate) {
					this._lastSparDate = prevSparDate = curEntryDate;
				}
				sparWon = true;
			}
			for (var j = 0, len2 = this._sparResults.length; j < len2; j++) {
				if (this._sparResults[j].id === sparId) {
					sparFound = true;
					break;
				}
			}
			if (!sparFound) {
				this._sparResults.unshift({id: sparId, won: sparWon, exp: expGot});
				ui_storage.set('ThirdEye:SparResults',JSON.stringify(this._sparResults.slice(0,20)));
			}
		}
		if (!this._latestEntryDate || this._latestEntryDate < curEntryDate) {
			this._latestEntryDate = curEntryDate;
		}
		if (!this._earliestEntryDate || this._earliestEntryDate > curEntryDate) {
			this._earliestEntryDate = curEntryDate;
		}
	}
	if (ui_timers.getDate('Latest') >= this._earliestEntryDate) {
		this._earliestEntryDate = ui_timers.getDate('Earliest');
		this._lastLayingDate = prevLayingDate;
		this._lastLogDate = prevLogDate;
		this._penultLogDate = prevPenultDate;
		this._lastSparDate = prevSparDate;
	} else {
		ui_storage.set('ThirdEye:Earliest', this._earliestEntryDate);
	}
	ui_storage.set('ThirdEye:LastLaying', this._lastLayingDate || '');
	ui_storage.set('ThirdEye:LastLog', this._lastLogDate || '');
	ui_storage.set('ThirdEye:PenultLog', this._penultLogDate || '');
	ui_storage.set('ThirdEye:LastSpar', this._lastSparDate || '');
	ui_storage.set('ThirdEye:Latest', this._latestEntryDate);
};
ui_timers._calculateTime = function(isLaying, fromDate) {
	var totalMinutes, greenHours = isLaying ? 36 : 24,
		yellowHours = isLaying ? 18 : 23;
	if (fromDate) {
		totalMinutes = Math.ceil((Date.now() + 1 - fromDate)/1000/60);
		ui_timers._setTimer(isLaying, totalMinutes, totalMinutes > greenHours*60 ? 'green' : totalMinutes > yellowHours*60 ? 'yellow' : 'red');
	} else {
		totalMinutes = Math.floor((Date.now() - this._earliestEntryDate)/1000/60);
		ui_timers._setTimer(isLaying, totalMinutes, totalMinutes > greenHours*60 ? 'green' : 'grey');
	}
};
ui_timers._formatTime = function(maxHours, totalMinutes) {
	var countdownMinutes = maxHours*60 - totalMinutes,
		hours = Math.floor(countdownMinutes/60),
		minutes = Math.floor(countdownMinutes%60);
	return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
};
ui_timers._calculateExp = function(totalMinutes) {
	var baseExp = Math.min(totalMinutes/36/60*2, 2),
		amountMultiplier = [1, 2, 2.5],
		level = ui_stats.Level(),
		levelMultiplier = level < 100 ? 1 : level < 125 ? 0.5 : 0.25,
		title = [];
	for (var i = 1; i <= 3; i++) {
		title.push(i + '0k gld → ' + ((i + baseExp*amountMultiplier[i - 1])*levelMultiplier).toFixed(1) + '% exp');
	}
	return title.join('\n');
};
ui_timers._setTimer = function(isLaying, totalMinutes, color) {
	var timer = isLaying ? this.layingTimer : this.logTimer;
	timer.className = timer.className.replace(/green|yellow|red|grey/g, '');
	timer.classList.add(color);
	if (color === 'grey') {
		timer.textContent = '?';
		timer.title = (isLaying ? worker.GUIp_i18n.gte_unknown_penalty : worker.GUIp_i18n.log_unknown_time) + ui_timers._formatTime(isLaying ? 36 : 24, totalMinutes);
	} else {
		timer.textContent = color === 'green' ? isLaying ? '✓' : '木' : (isLaying ? ui_timers._formatTime(36, totalMinutes) : '¦' + ui_timers._formatTime(24, totalMinutes) + '¦');
		timer.title = isLaying ? ui_timers._calculateExp(totalMinutes) : totalMinutes > 24*60 ? worker.GUIp_i18n.log_is_guaranteed : worker.GUIp_i18n.log_isnt_guaranteed;
	}
};
ui_timers.toggleTimers = function(e) {
	e.stopPropagation();
	if (!this.layingTimer && !this.logTimer) {
		return;
	}
	if (this.layingTimer) {
		this.logTimer = this.layingTimer;
		delete this.layingTimer;
	} else {
		this.layingTimer = this.logTimer;
		delete this.logTimer;
	}
	var timerElem = worker.$('#imp_timer');
	timerElem.fadeOut(500, function() {
		ui_timers.tick();
		timerElem.fadeIn(500);
	});
};
ui_timers._lsThirdEye = function() {
	var teEntries = [], teLsContent = localStorage.getItem('d_i_' + ui_stats.godName());
	if (!teLsContent) {
		return false;
	}
	try {
		teLsContent = JSON.parse(teLsContent);
	} catch (e) {
		return false;
	}
	for (var entry in teLsContent) {
		if (teLsContent[entry].s === 'del') {
			continue;
		}
		if (teLsContent[entry].time && teLsContent[entry].msg) {
			teEntries.push({
				date: new Date(teLsContent[entry].time),
				msg: teLsContent[entry].msg,
				link: teLsContent[entry].f_id ? teLsContent[entry].f_id : null
			});
		}
	}
	if (teEntries.length) {
		ui_timers._thirdEyeContent = teEntries.sort(function(a, b) {
			return a.date < b.date;
		});
		return true;
	}
	return false;
};
ui_timers._autoThirdEye = function() {
	var teButton = document.getElementById('imp_button');
	if (teButton) {
		var teUnreadCnt = teButton.classList.contains('fr_new_badge') && teButton.textContent || 0,
			teContainer = document.getElementById('imp_e_popover_c');
		if (teContainer) {
			try {
				worker.$('#imp_button').trigger(worker.$.Event( "click", { originalEvent: {} } ));
				teContainer.parentNode.parentNode.style.display = 'none';
			} catch (e) {worker.console.log(e);};
			worker.setTimeout(function() {
				try {
					worker.$('#imp_button').trigger(worker.$.Event( "click", { originalEvent: {} } ));
					if (teUnreadCnt) {
						teButton.textContent = teUnreadCnt;
						teButton.classList.add('fr_new_badge');
					}
				} catch (e) {worker.console.log(e);};
			},300);
		}
	}
};
ui_timers.readThirdEye = function() {
	if (!ui_timers._fallbackThirdEye) {
		return;
	}
	var offsetDays = 0, dtime, teEntries = [], teContent = document.querySelectorAll('.tep .d_line');
	for (var i = 0, len = teContent.length; i < len; i++) {
		var teData = {}, teElements = teContent[i].querySelectorAll('div, span a');
		for (var j = 0, len2 = teElements.length; j < len2; j++) {
			if (teElements[j].classList.contains('diary_cs_t')) {
				switch (teElements[j].textContent) {
					case "Сегодня":
					case "Today":
						offsetDays = 0;
						break;
					case "Вчера":
					case "Yesterday":
						offsetDays = 1;
						break;
					case "Позавчера":
					case "2 days ago":
						offsetDays = 2;
						break;
					default:
						offsetDays = parseInt(teElements[j].textContent) || 0;
						break;
				}
			} else if (teElements[j].classList.contains('d_time')) {
				if (dtime = teElements[j].textContent.match(/(\d+):(\d+)( PM)?/)) {
					teData.date = new Date(Date.now() - offsetDays * 86400000);
					if (worker.ampm === '12h') {
						if (dtime[3]) {
							dtime[1] = (+dtime[1] + 12) % 24;
						} else if (+dtime[1] === 12) {
							dtime[1] = 0;
						}
					}
					teData.date.setHours(+dtime[1],+dtime[2],60,0);
				}
			} else if (teElements[j].classList.contains('d_msg')) {
				teData.msg = teElements[j].textContent;
			} else if (teElements[j].classList.contains('div_link')) {
				teData.link = (teElements[j].href.match(/\/([^/]+)$/) || [])[1];
			}
		}
		if (teData.date && teData.msg) {
			teEntries.push(teData);
		}
	}
	if (teEntries.length) {
		ui_timers._thirdEyeContent = teEntries;
		ui_timers.tick();
	}
};

// ui_observers
var ui_observers = worker.GUIp.observers = {};

ui_observers.init = function() {
	for (var key in this) {
		if (this[key].condition) {
			ui_observers.start(this[key]);
		}
	}
};
ui_observers.start = function(obj) {
	for (var i = 0, len = obj.target.length; i < len; i++) {
		var target = document.querySelector(obj.target[i]);
		if (target) {
			var observer = new MutationObserver(obj.func);
			observer.observe(target, obj.config);
		}
	}
};
ui_observers.mutationChecker = function(mutations, check, callback) {
	var callbackRunRequired = false;
	for (var i = 0, len = mutations.length; i < len; i++) {
		if (check(mutations[i])) {
			callbackRunRequired = true;
			break;
		}
	}
	if (callbackRunRequired) {
		callback();
	}
};
ui_observers.chats = {
	condition: true,
	config: { childList: true },
	func: function(mutations) {
		for (var i = 0, len = mutations.length; i < len; i++) {
			if (mutations[i].addedNodes.length && !mutations[i].addedNodes[0].classList.contains('moved')) {
				var newNode = mutations[i].addedNodes[0];
				newNode.classList.add('moved');
				mutations[i].target.appendChild(newNode);
				var msgArea = newNode.querySelector('.frMsgArea');
				msgArea.scrollTop = msgArea.scrollTopMax || msgArea.scrollHeight;
			}
		}
		ui_observers.mutationChecker(mutations, function(mutation) {
			return mutation.addedNodes.length || mutation.removedNodes.length;
		}, function() { ui_improver.chatsFix(); ui_informer.clearTitle(); });
	},
	target: ['.chat_ph']
};
ui_observers.clearTitle = {
	condition: true,
	config: {
		childList: true,
		attributes: true,
		subtree: true,
		attributeFilter: ['style']
	},
	func: function(mutations) {
		var isFocused = document.hasFocus && document.hasFocus();
		if (worker.GUIp_browser !== 'Opera')
		for (var i = 0, len = mutations.length; i < len; i++) {
			if (mutations[i].addedNodes.length) {
				if (isFocused && mutations[i].addedNodes[0].classList && mutations[i].addedNodes[0].classList.contains('fr_new_msg')) {
					worker.setTimeout(function() { ui_improver.checkGCMark('observe'); }, 50);
				}
				if (mutations[i].addedNodes[0].nodeType === 3 && mutations[i].target.classList && mutations[i].target.classList.contains('frmsg_i')) {
					var contact = mutations[i].addedNodes[0].parentNode.parentNode.getElementsByClassName('frname')[0];
					contact = contact ? contact.textContent : 'unknown';
					ui_utils.pmNotification(contact,mutations[i].addedNodes[0].textContent);
				}
			}
		}
		ui_observers.mutationChecker(mutations, function(mutation) {
			return mutation.target.className.match(/fr_new_(?:msg|badge)/) ||
				  (mutation.target.className.match(/dockfrname_w/) && (mutation.removedNodes.length && mutation.removedNodes[0].className.match(/fr_new_msg/) || mutation.addedNodes.length && mutation.addedNodes[0].className.match(/fr_new_msg/)));
		}, ui_informer.clearTitle.bind(ui_informer));
	},
	target: ['.msgDockWrapper']
};
ui_observers.voiceform = {
	condition: true,
	config: {
		attributes: true,
		attributeFilter: ['style']
	},
	func: function(mutations) {
		for (var i = 0, len = mutations.length; i < len; i++) {
			if (mutations[i].target.style.display) {
				ui_improver.improvementDebounce();
				break;
			}
		}
	},
	target: ['#cntrl .voice_line']
};
ui_observers.refresher = {
	condition: (worker.GUIp_browser !== 'Opera'),
	config: {
		attributes: true,
		characterData: true,
		childList: true,
		subtree: true
	},
	func: function(mutations) {
		var toReset = false;
		for (var i = 0, len = mutations.length; i < len; i++) {
			var tgt = mutations[i].target,
				id = tgt.id,
				cl = tgt.className;
			if (!(id && id.match && id.match(/logger|pet_badge|equip_badge/)) &&
				!(cl && cl.match && cl.match(/voice_generator|inspect_button|m_hover|craft_button/))) {
				toReset = true;
				break;
			}
		}
		if (toReset) {
			worker.clearInterval(ui_improver.softRefreshInt);
			worker.clearInterval(ui_improver.hardRefreshInt);
			if (!ui_storage.get('Option:disablePageRefresh')) {
				ui_improver.softRefreshInt = worker.setInterval(ui_improver.softRefresh, (ui_data.isFight || ui_data.isDungeon) ? 9e3 : 18e4);
				ui_improver.hardRefreshInt = worker.setInterval(ui_improver.hardRefresh, (ui_data.isFight || ui_data.isDungeon) ? 25e3 : 50e4);
			}
		}
	},
	target: ['#main_wrapper']
};
ui_observers.diary = {
	get condition() {
		return !ui_data.isFight && !ui_data.isDungeon;
	},
	config: { childList: true },
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) { return mutation.addedNodes.length;	}, ui_improver.improveDiary);
	},
	target: ['#diary .d_content']
};
ui_observers.news = {
	get condition() {
		return !ui_data.isFight && !ui_data.isDungeon;
	},
	config: { childList: true, characterData: true, subtree: true },
	func: ui_improver.improvementDebounce,
	target: ['.f_news']
};
ui_observers.wup_detector = {
	get condition() {
		return !ui_data.isFight;
	},
	config: { childList: true },
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) {
			return mutation.addedNodes.length && mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains('wup');
		}, function() {
			ui_timers.readThirdEye();
			ui_improver.improveLastFightsInt = worker.setInterval(function() { ui_improver.improveLastFights(); },200);
			ui_improver.improveLastVoices();
			ui_improver.improveStoredPets();
		});
	},
	target: ['body']
};
ui_observers.chronicles = {
	get condition() {
		return ui_data.isDungeon;
	},
	config: { childList: true },
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) { return mutation.addedNodes.length;	}, ui_improver.improveChronicles.bind(ui_improver));
	},
	target: ['#m_fight_log .d_content']
};
ui_observers.map_colorization = {
	get condition() {
		return ui_data.isDungeon;
	},
	config: {
		childList: true,
		subtree: true
	},
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) { return mutation.addedNodes.length;	}, ui_improver.colorDungeonMap.bind(ui_improver));
	},
	target: ['#map .block_content']
};
ui_observers.s_chronicles = {
	get condition() {
		return ui_data.isSail;
	},
	config: { childList: true },
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) { return mutation.addedNodes.length;	}, ui_improver.improveSailChronicles.bind(ui_improver));
	},
	target: ['#m_fight_log .d_content']
};
ui_observers.s_map_colorization = {
	get condition() {
		return ui_data.isSail;
	},
	config: {
		childList: true,
		subtree: true
	},
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) { return mutation.addedNodes.length && !(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains('e_hint')); }, ui_improver.improveIslandsMap.bind(ui_improver));
	},
	target: ['#s_map .block_content']
};
ui_observers.theme_switcher = {
	condition: true,
	config: { childList: true },
	func: function(mutations) {
		for (var i = 0, len = mutations.length, theme = null; i < len; i++) {
			if (mutations[i].addedNodes.length && mutations[i].addedNodes[0].href && (theme = mutations[i].addedNodes[0].href.match(/\/stylesheets\/(th_.*?)\.css/))) {
				ui_utils.switchTheme.call(ui_utils,theme[1]);
				break;
			}
		}
	},
	target: ['head']
};
ui_observers.node_insertion = {
	condition: true,
	config: {
		childList: true,
		subtree: true
	},
	func: function(mutations) {
		ui_observers.mutationChecker(mutations, function(mutation) {
			// to prevent improving WHEN ENTERING FUCKING TEXT IN FUCKING TEXTAREA
			return mutation.addedNodes.length && mutation.addedNodes[0].nodeType !== 3;
		}, ui_improver.improvementDebounce);
	},
	target: ['body']
};


// ui_trycatcher
var ui_trycatcher = worker.GUIp.trycatcher = {};

ui_trycatcher.replaceWithImproved = function(method) {
	return function() {
		try {
			return method.apply(this, arguments);
		} catch (error) {
			if (!ui_utils.hasShownErrorMessage) {
				ui_utils.hasShownErrorMessage = true;
				if (worker.GUIp_locale === 'en' || ui_storage.get('Option:enableDebugMode')) {
					ui_utils.processError(error, true);
				} else {
					ui_utils.checkVersion(ui_utils.processError.bind(null, error, false), ui_utils.informAboutOldVersion);
				}
			}
		}
	};
};
ui_trycatcher.process = function(object) {
	var method_name, method, source;
	for (method_name in object) {
		method = object[method_name];
		if (typeof method === "function") {
			source = object[method_name].toString();
			object[method_name] = ui_trycatcher.replaceWithImproved(method);
			object[method_name].toStr = function(str) { return function() { return str; }; }(source)
		}
	}
};


// ui_starter
var ui_starter = worker.GUIp.starter = {};

ui_starter._init = function() {
	ui_data.init();
	ui_storage.init();
	ui_utils.jqueryExtInit();
	ui_utils.addCSS();
	ui_words.init();
	ui_logger.create();
	ui_timeout.create();
	ui_help.init();
	ui_informer.init();
	ui_forum.init();
	ui_inventory.init();
	ui_improver.improve();
	ui_timers.init();
	ui_observers.init();
};
ui_starter.start = function() {
	if (worker.$ && worker.GUIp_browser && worker.GUIp_i18n && worker.GUIp.common && worker.jsep) {
		if (!(document.getElementById('m_info') || document.getElementById('stats'))) {
			return;
		}
		worker.clearInterval(starterInt);
		worker.console.time('Godville UI+ initialized in');

		ui_starter._init();

		if (!ui_data.isFight) {
			worker.onmousemove = worker.onscroll = worker.ontouchmove = ui_improver.activity;
		}

		// svg for #logger fade-out in FF
		var is5c = document.getElementsByClassName('page_wrapper_5c').length;
		document.body.insertAdjacentHTML('beforeend',
			'<svg id="fader">' +
				'<defs>' +
					'<linearGradient id="gradient" x1="0" y1="0" x2 ="100%" y2="0">' +
						'<stop stop-color="black" offset="0"></stop>' +
						'<stop stop-color="white" offset="0.0' + (is5c ? '2' : '3') + '"></stop>' +
					'</linearGradient>' +
					'<mask id="fader_masking" maskUnits="objectBoundingBox" maskContentUnits="objectBoundingBox">' +
						'<rect x="0.0' + (is5c ? '2' : '3') + '" width="0.9' + (is5c ? '8' : '7') + '" height="1" fill="url(#gradient)" />' +
					'</mask>' +
				'</defs>' +
			'</svg>'
		);

		worker.console.timeEnd('Godville UI+ initialized in');
	}
};


// Main code
var objects = [ui_data, ui_utils, ui_timeout, ui_help, ui_storage, ui_words, ui_stats, ui_logger,
			   ui_informer, ui_forum, ui_improver, ui_inventory, ui_timers, ui_observers, ui_starter];
for (var i = 0, len = objects.length; i < len; i++) {
	ui_trycatcher.process(objects[i]);
}
for (var observer in ui_observers) {
	ui_trycatcher.process(ui_observers[observer]);
}
var starterInt = worker.setInterval(function() { ui_starter.start(); }, 200);



})();