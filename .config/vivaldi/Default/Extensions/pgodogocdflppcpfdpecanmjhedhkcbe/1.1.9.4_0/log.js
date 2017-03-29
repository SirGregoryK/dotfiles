(function() {
'use strict';

var worker = window;

worker.GUIp = worker.GUIp || {};

var ui_log = worker.GUIp.log = {};

ui_log.customDomain = !location.href.match(/^https?:\/\/(godville\.net|godvillegame\.com)\/duels\/log/);
ui_log.logID = (location.href.match(/duels\/log\/([^\?]+)/) || [])[1];
ui_log.chronicles = {};
ui_log.directionlessMoveIndex = 0;
ui_log.wormholeMoveIndex = 0;
ui_log.directionlessMoveCombo = "";
ui_log.wormholeMoveCombo = [];
ui_log.dungeonPhrases = [
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

ui_log.islandsMapConds = '';
ui_log.corrections = { n: 'north', e: 'east', s: 'south', w: 'west' };
ui_log.pointerRegExp = new worker.RegExp('[^а-яa-z](северо-восток|северо-запад|юго-восток|юго-запад|' +
													'север|восток|юг|запад|' +
													'очень холодно|холодно|свежо|тепло|очень горячо|горячо|' +
													'north-east|north-west|south-east|south-west|' +
													'north|east|south|west|' +
													'freezing|very cold|cold|mild|warm|hot|burning|very hot|hot)', 'gi');


ui_log.get_key = function(key) {
	return 'eGUI_' + ui_log.godname + ':' + key;
};

ui_log.storageSet = function(id, value) {
	localStorage.setItem(ui_log.get_key(id), value);
	return value;
};

ui_log.storageGet = function(id) {
	var val = localStorage.getItem(ui_log.get_key(id));
	if (val === 'true') { return true; }
	if (val === 'false') { return false; }
	return val;
};

ui_log.clearDungeonPhrases = function() {
	for (var key in localStorage) {
		if (key.match(/^LogDB:/)) {
			localStorage.removeItem(key);
		}
	}
};

ui_log.parseDungeonPhrases = function(xhr) {
	var i, j, len, line, temp;
	for (i = 0, j = 0, len = this.dungeonPhrases.length; i < len; i++) {
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
		this.initColorMap();
	} else {
		worker.console.log('[eGUI+] error: not enough data to update phrases database (parsed ' + j + ' of ' + this.dungeonPhrases.length + ' sections)');
		this.initColorMap(true);
	}
};

ui_log.initColorMap = function(update_failure) {
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
			// or highlight map using map pointers and exit
			this.prepareMap();
			this.highlightTreasuryZone();
			return;
		}
	}
	// if DB is empty or outdated download a new one
	if (update_required || !localStorage.getItem('LogDB:' + this.dungeonPhrases[this.dungeonPhrases.length - 1] + 'Phrases')) {
		if (!ui_log.customDomain) {
			var customChronicler = this.storageGet('Option:customDungeonChronicler') || '';
			GUIp.common.getXHR('/gods/' + (customChronicler.length >= 3 ? customChronicler : 'Dungeoneer'), this.parseDungeonPhrases.bind(this), this.initColorMap.bind(this,true));
		} else {
			var dungeonPhrasesURL = this.storageGet('Option:customDungeonURL') || '/dungeondb';
			GUIp.common.getXHR(dungeonPhrasesURL, this.parseDungeonPhrases.bind(this), this.initColorMap.bind(this,true));
		}
		return;
	}
	// prepare regular expressions
	for (var i = 0, temp, len = this.dungeonPhrases.length; i < len; i++) {
		this[this.dungeonPhrases[i] + 'RegExp'] = new worker.RegExp(localStorage.getItem('LogDB:' + this.dungeonPhrases[i] + 'Phrases'));
	}
	if (localStorage.getItem('debugGVP')) {
		this['treasureChestRegExp'] = new worker.RegExp(localStorage.getItem('LogDB:treasureChestPhrases').replace(/(plunder the treasure trove and divide the loot|потрошат|делят награб)\|?/g,'').replace(/\|$/,''));
		this['bossRegExp'] = new worker.RegExp(localStorage.getItem('LogDB:bossPhrases').replace(/(The heroes defeated|defeated the nasty creature|arrogant monster|the heroes are deciding what to do next|successfully defeating the boss|defeated the nasty boss|тяжело рухнул|победу над наглым|Собранные судьбой|предсмертными хрипами|золото и трофеи|порван на куски|над исчадием зла|побеждённого в столичный зоопарк)\|?/g,'').replace(/\|$/,''));
	}

	// finally process everything
	this.parseChronicles();
	if (!document.querySelector('#dmap')) {
		this.buildMap();
	}
	if (document.querySelector('#dmap')) {
		this.prepareMap();
		this.describeMap();
		this.highlightTreasuryZone();
	} else if (document.querySelector('div.trace_div')) {
		document.querySelector('div.trace_div').style.display = 'none';
	}
};

ui_log.prepareMap = function() {
	// make dmap feel a bit like normal map
	var dmap = document.querySelector('#dmap');
	dmap.innerHTML = dmap.innerHTML.replace(/>\s{2,}</g, "><");
	var cells = document.querySelectorAll('.dml .dmc');
	for (var i = 0, len = cells.length; i < len; i++) {
		if (cells[i].textContent.match(/@/)) {
			cells[i].classList.add('map_pos');
			break;
		}
	}
	// expand minimap
	try {
		var styles, overhead = 0;
		styles = worker.getComputedStyle(dmap);
		overhead += parseInt(styles.paddingLeft) + parseInt(styles.paddingRight);
		styles = worker.getComputedStyle(dmap.parentNode);
		overhead += parseInt(styles.paddingLeft) + parseInt(styles.paddingRight) + 2;
		overhead = Math.max((overhead || 0), 20);
		if (worker.GUIp_browser !== 'Opera') {
			dmap.style.width = dmap.scrollWidth > (400 - overhead) ? (400 - overhead) + 'px' : 'initial';
		} else {
			dmap.style.width = dmap.scrollWidth > (400 - overhead) ? (400 - overhead) + 'px' : 'inherit';
			dmap.style.overflowY = 'auto';
			dmap.style.paddingBottom = '25px';
		}
		dmap.parentNode.parentNode.style.width = Math.min((dmap.scrollWidth + overhead),400) + 'px';
	} catch(e) {
		worker.console.log('[eGUI+] error: expanding minimap has failed: ' + e);
	}
};

ui_log.buildMap = function() {
	var step, lastSentence, bounds, txmi, txma, pos = {x: 0, y: 0},
		mapData = {}, mapArray = [],
		trapMoveLossCount = 0,
		steps = worker.Object.keys(this.chronicles),
		steps_max = steps.length;
	var setCell = function(position, content) {
		if (!mapData[position.y]) {
			mapData[position.y] = {}
		}
		if ((content === '#' || content === ' ') && mapData[position.y][position.x] !== undefined) {
			return;
		}
		mapData[position.y][position.x] = content;
	}
	var matchPointers = function(cellPointers, matchPointers) {
		return cellPointers.indexOf(matchPointers[0]) > -1 && cellPointers.indexOf(matchPointers[1]) > -1;
	}
	for (step = 1; step <= steps_max; step++) {
		if (!this.chronicles[step]) {
			worker.console.log('[eGUI+] warning: data from step #' + step + ' missing: map generation not possible!');
			return;
		}
		if (this.chronicles[step].directionless) {
			if (this.chronicles[step].directionguess) {
				worker.console.log('[eGUI+] warning: detected directionless move at step #' + step + ' with single guess: proceeding map generation...');
				GUIp.common.moveCoords(pos, { direction: this.chronicles[step].directionguess });
			} else {
				worker.console.log('[eGUI+] warning: detected directionless move at step #' + step + ': map generation not possible!');
				return;
			}
		} else {
			GUIp.common.moveCoords(pos, this.chronicles[step]);
		}
		if (this.chronicles[step].pointers.length) {
			var pchar = ' ';
			if (this.chronicles[step].pointers.length === 2) {
				if (matchPointers(this.chronicles[step].pointers, ['north', 'east'])) {
					pchar = '⌊';
				} else if (matchPointers(this.chronicles[step].pointers, ['north', 'west'])) {
					pchar = '⌋';
				} else if (matchPointers(this.chronicles[step].pointers, ['south', 'east'])) {
					pchar = '⌈';
				} else if (matchPointers(this.chronicles[step].pointers, ['south', 'west'])) {
					pchar = '⌉';
				} else if (matchPointers(this.chronicles[step].pointers, ['north_east', 'north_west'])) {
					pchar = '∨';
				} else if (matchPointers(this.chronicles[step].pointers, ['north_east', 'south_east'])) {
					pchar = '<';
				} else if (matchPointers(this.chronicles[step].pointers, ['south_east', 'south_west'])) {
					pchar = '∧';
				} else if (matchPointers(this.chronicles[step].pointers, ['north_west', 'south_west'])) {
					pchar = '>';
				}
			} else {
				switch (this.chronicles[step].pointers[0]) {
					case 'north_east': pchar = '↗'; break;
					case 'north_west': pchar = '↖'; break;
					case 'south_east': pchar = '↘'; break;
					case 'south_west': pchar = '↙'; break;
					case 'north':      pchar = '↑'; break;
					case 'east':       pchar = '→'; break;
					case 'south':      pchar = '↓'; break;
					case 'west':       pchar = '←'; break;
					case 'freezing': pchar = '✵'; break;
					case 'cold':     pchar = '❄'; break;
					case 'mild':     pchar = '☁'; break;
					case 'warm':     pchar = '♨'; break;
					case 'hot':      pchar = '☀'; break;
					case 'burning':  pchar = '✺'; break;
				}
			}
			setCell(pos, pchar);
		} else if (this.chronicles[step].marks.indexOf('boss') >= 0) {
			setCell(pos, '💀');
		} else if (this.chronicles[step].marks.join().match(/trap/)) {
			setCell(pos, '🕳');
		} else {
			setCell(pos, ' ');
		}
		if (this.chronicles[step].wormhole) {
			setCell(pos, '~');
			break;
		}
		if (this.chronicles[step].marks.indexOf('boss') < 0) {
			lastSentence = (GUIp.common.splitSentences(this.chronicles[step].text).slice(-1))[0];
		} else {
			if (GUIp.common.splitSentences(this.chronicles[step].text).length < 3) {
				continue;
			}
			lastSentence = (GUIp.common.splitSentences(this.chronicles[step].text).slice(-2,-1))[0];
		}
		if (lastSentence) {
			if (lastSentence.match(/«Пиастры! Пиастры на.*?!»/)) {
				lastSentence = lastSentence.split('»')[1];
			}
			if (!lastSentence.match(/, но дорога на.*?выстлана скатертью./) && lastSentence.match(/[^\w\-А-Яа-я](север|восток|юг|запад|north|east|south|west)/)) {
				var blocked = 15;
				if (lastSentence.match(/[^\w\-А-Яа-я](север|north)/)) {
					blocked -= 1;
				}
				if (lastSentence.match(/[^\w\-А-Яа-я](юг|south)/)) {
					blocked -= 2;
				}
				if (lastSentence.match(/[^\w\-А-Яа-я](запад|west)/)) {
					blocked -= 4;
				}
				if (lastSentence.match(/[^\w\-А-Яа-я](восток|east)/)) {
					blocked -= 8;
				}
				if (blocked & 0x01) {
					setCell({y: pos.y - 1, x: pos.x}, '#');
				}
				if (blocked & 0x02) {
					setCell({y: pos.y + 1, x: pos.x}, '#');
				}
				if (blocked & 0x04) {
					setCell({y: pos.y, x: pos.x - 1}, '#');
				}
				if (blocked & 0x08) {
					setCell({y: pos.y, x: pos.x + 1}, '#');
				}
			}
		}
	}
	setCell({x: 0, y: 0}, worker.GUIp_locale === 'en' ? 'E' : 'В');
	if (step > steps_max) {
		setCell(pos, '@');
	}
	var bounds = {xmi: 0, xma: 0, ymi: 0, yma: 0};
	for (var y in mapData) {
		txmi = Math.min.apply(null,Object.keys(mapData[y]));
		txma = Math.max.apply(null,Object.keys(mapData[y]));
		if (txmi < bounds.xmi) {
			bounds.xmi = txmi;
		}
		if (txma > bounds.xma) {
			bounds.xma = txma;
		}
	}
	bounds.ymi = Math.min.apply(null,Object.keys(mapData));
	bounds.yma = Math.max.apply(null,Object.keys(mapData));
	txmi = false;
	txma = false;
	for (var y in mapData) {
		if (!txmi && mapData[y][bounds.xmi] && mapData[y][bounds.xmi] !== '#') {
			bounds.xmi--;
			txmi = true;
		}
		if (!txma && mapData[y][bounds.xma] && mapData[y][bounds.xma] !== '#') {
			txma = true;
			bounds.xma++;
		}
	}
	for (var x in mapData[bounds.ymi]) {
		if (mapData[bounds.ymi][x] !== '#') {
			bounds.ymi--;
			break;
		}
	}
	for (var x in mapData[bounds.yma]) {
		if (mapData[bounds.yma][x] !== '#') {
			bounds.yma++;
			break;
		}
	}
	for (var y = bounds.ymi, i = 0; y <= bounds.yma; y++, i++) {
		mapArray.push([]);
		for (var x = bounds.xmi; x <= bounds.xma; x++) {
			if (!mapData[y] || !mapData[y][x]) {
				mapArray[i].push('?');
			} else {
				mapArray[i].push(mapData[y][x]);
			}
		}
	}
	var stl_form = document.getElementById('send_to_LEM_form'),
		trace_div = document.querySelector('div.trace_div'),
		map_elem = '<div id="hero2"><div class="box"><div class="block"><div class="block_h">' + worker.GUIp_i18n.map + ' <span title="' + worker.GUIp_i18n.map_cgm + '">(CGM)</span></div><div id="dmap" class="new_line em_font">';
	for (var i = 0, ilen = mapArray.length; i < ilen; i++) {
		map_elem += '<div class="dml" style="width:' + (mapArray[0].length * 21) + 'px;">';
		for (var j = 0, jlen = mapArray[0].length; j < jlen; j++) {
			map_elem += '<div class="dmc' + (mapArray[i][j] === '#' ? ' dmw' : '') + '" style="left:' + (j * 21) + 'px">' + mapArray[i][j] + '</div>';
		}
		map_elem += '</div>';
	}
	map_elem += '</div></div></div></div>';
	document.getElementById('right_block').insertAdjacentHTML('beforeend', map_elem);
	if (trace_div) {
		document.querySelector('#hero2 .block').insertBefore(trace_div, null);
	}
	if (stl_form) {
		document.querySelector('#hero2 .block').insertBefore(stl_form, null);
	}
	worker.onscroll = function() { ui_log.onscroll(); };
	worker.setTimeout(function() { ui_log.onscroll(); }, 500);
	ui_log.chronicleGeneratedMap = true;
};
ui_log.traceMapProcess = function(direction) {
	var chronicle, coords2, currentCell, mapCells = document.querySelectorAll('#dmap .dml'),
		progressbar = document.getElementById('trace_progress');
	if (!mapCells.length) {
		return;
	}
	var highlightThis = function(traceCoords) {
		currentCell = mapCells[traceCoords.y] && mapCells[traceCoords.y].children[traceCoords.x];
		if (!currentCell) {
			ui_log.traceMapStop();
			return false;
		}
		currentCell.classList.add('dtrace');
		return true;
	}
	currentCell = document.querySelectorAll('.dmc.dtrace');
	for (var i = 0, len = currentCell.length; i < len; i++) {
		currentCell[i].classList.remove('dtrace');
	}
	if (direction !== -1) {
		if (this.chronicles[this.traceStep] && this.chronicles[this.traceStep].wormhole) {
			if (this.chronicles[this.traceStep].wormholedst) {
				this.traceCoords.y += this.chronicles[this.traceStep].wormholedst[0];
				this.traceCoords.x += this.chronicles[this.traceStep].wormholedst[1];
			} else {
				ui_log.traceMapStop();
				return false;
			}
		}
	} else {
		if (this.chronicles[this.traceStep - 1] && this.chronicles[this.traceStep - 1].wormhole) {
			coords2 = {x: this.traceCoords.x, y: this.traceCoords.y};
			GUIp.common.moveCoords(coords2, this.chronicles[this.traceStep], direction);
			if (!highlightThis(coords2)) {
				return;
			}
			if (this.chronicles[this.traceStep].wormholedst) {
				this.traceCoords.y -= this.chronicles[this.traceStep - 1].wormholedst[0];
				this.traceCoords.x -= this.chronicles[this.traceStep - 1].wormholedst[1];
			} else {
				ui_log.traceMapStop();
				return false;
			}
		}
	}
	this.traceStep += direction;
	if (this.traceStep === 1) {
		this.traceCoords = GUIp.common.calculateExitXY();
	} else {
		chronicle = this.chronicles[this.traceStep + (direction === -1 ? 1 : 0)];
		if (chronicle) {
			GUIp.common.moveCoords(this.traceCoords, chronicle, direction);
			if (chronicle.wormholedst && direction !== -1) {
				if (!highlightThis({y: this.traceCoords.y + chronicle.wormholedst[0], x: this.traceCoords.x + chronicle.wormholedst[1]})) {
					return;
				}
			};
		}
	}
	progressbar.value = this.traceStep;
	progressbar.title = worker.GUIp_i18n.trace_map_progress_step + ' #' + this.traceStep;
	if (!highlightThis(this.traceCoords)) {
		return;
	}
	currentCell = document.querySelector('.new_line.dtrace');
	if (currentCell) {
		currentCell.classList.remove('dtrace');
	}
	mapCells = document.querySelectorAll('.new_line .d_turn');
	for (var i = 0, len = mapCells.length; i < len; i++) {
		if ((mapCells[i].textContent.match(/[0-9]+/) || [])[0] === this.traceStep.toString()) {
			mapCells[i].parentNode.parentNode.classList.add('dtrace');
			break;
		}
	}
	ui_log.traceDir = direction;
};
ui_log.traceMapProgressClick = function(targetStep,max) {
	if (ui_log.traceInt) {
		ui_log.traceMapPause();
	}
	ui_log.traceStep = 0;
	ui_log.traceDir = 1;
	ui_log.traceCoords = GUIp.common.calculateExitXY();
	ui_log.traceStep = Math.min(targetStep,max - 1);
	for (var i = 1, len = ui_log.traceStep; i <= len; i++) {
		if (ui_log.chronicles[i - 1] && ui_log.chronicles[i - 1].wormhole) {
			if (ui_log.chronicles[i - 1].wormholedst) {
				ui_log.traceCoords.y += ui_log.chronicles[i - 1].wormholedst[0];
				ui_log.traceCoords.x += ui_log.chronicles[i - 1].wormholedst[1];
			} else {
				return;
			}
		}
		GUIp.common.moveCoords(ui_log.traceCoords, ui_log.chronicles[i]);
	}
	ui_log.traceMapProcess(1);
};
ui_log.traceMapStart = function() {
	if (this.traceInt) {
		return;
	}
	this.traceInt = worker.setInterval(function() {
		if (ui_log.traceStep >= document.getElementById('trace_progress').max) {
			ui_log.traceStep = 0;
		}
		ui_log.traceMapProcess(1);
	},500);
	document.querySelectorAll('#trace_button_play img')[0].style.display = 'none';
	document.querySelectorAll('#trace_button_play img')[1].style.display = '';
	document.getElementById('trace_button_play').title = worker.GUIp_i18n.trace_map_pause;
};

ui_log.traceMapPause = function() {
	if (this.traceInt) {
		worker.clearInterval(this.traceInt);
	}
	delete this.traceInt;
	document.querySelectorAll('#trace_button_play img')[1].style.display = 'none';
	document.querySelectorAll('#trace_button_play img')[0].style.display = '';
	document.getElementById('trace_button_play').title = worker.GUIp_i18n.trace_map_start;
};

ui_log.traceMapStop = function() {
	if (this.traceInt) {
		worker.clearInterval(this.traceInt);
		document.querySelectorAll('#trace_button_play img')[1].style.display = 'none';
		document.querySelectorAll('#trace_button_play img')[0].style.display = '';
		document.getElementById('trace_button_play').title = worker.GUIp_i18n.trace_map_start;
	}
	delete this.traceInt;
	delete this.traceStep;
	delete this.traceCoords;
	var cell = document.querySelector('.dmc.dtrace')
	if (cell) {
		cell.classList.remove('dtrace');
	}
	cell = document.querySelector('.new_line.dtrace')
	if (cell) {
		cell.classList.remove('dtrace');
	}
	document.getElementById('trace_progress').value = 0;
	document.getElementById('trace_progress').title = worker.GUIp_i18n.trace_map_progress_stopped;
};

ui_log.parseChronicles = function() {
	var flc = document.getElementById('fight_log_capt') || document.querySelector('#last_items_arena .block_h, #fight_chronicle .block_h'),
		step, step_max = flc.textContent.match(/([0-9]+)/);
	if (!step_max || step_max[0] === '1') {
		return;
	}
	var lastNotParsed, texts = [], infls = [],
		matches = document.querySelector('#last_items_arena').innerHTML.match(/<div class="new_line ?"( style="[^"]*")?>[\s\S]*?<div class="text_content .*?">[\s\S]+?<\/div>/g),
		reversed = !!location.href.match('sort=desc');
	if (!matches) {
		worker.console.log('[eGUI+] warning: initial parsing chronicles failed!');
		return;
	}
	if (reversed) {
		matches.reverse();
	}
	step = 1;
	step_max = +step_max[0];

	for (var i = 0; step <= step_max; i++) {
		if (!matches[i]) {
			if (step !== step_max) {
				worker.console.log('[eGUI+] warning: not enough steps detected! (required: '+step_max+', got: '+step+')');
			}
			break;
		}
		lastNotParsed = true;
		if (!matches[i].match(/<div class="text_content infl">/)) {
			texts.push(matches[i].match(/<div class="text_content ">([\s\S]+?)<\/div>/)[1].trim().replace(/&#39;/g, "'"));
		} else {
			infls.push(matches[i].match(/<div class="text_content infl">([\s\S]+?)(<span|<\/div>)/)[1].trim().replace(/&#39;/g, "'"));
		}
		if (!reversed && matches[i].match(/<div class="new_line ?" style="[^"]+">/) ||
			 reversed && (!matches[i+1] || matches[i+1].match(/<div class="new_line ?" style="[^"]+">/))) {
			GUIp.common.parseSingleChronicle.call(ui_log, texts, infls, step);
			lastNotParsed = false;
			texts = [];
			infls = [];
			step++;
		}
	}
	if (lastNotParsed) {
		GUIp.common.parseSingleChronicle.call(ui_log, texts, infls, step);
	}
};

ui_log.enumerateSteps = function() {
	if (this.logID.length === 7) return;
	var i, len, matches, step, stepholder, steplines = [], dcapt = false,
		chronobox = document.querySelector('#last_items_arena') || document.querySelector('#fight_chronicle'),
		reversed = !!location.href.match('sort=desc'),
		flc = document.getElementById('fight_log_capt') || chronobox.querySelector('.block_h'),
		duel = !flc.textContent.match(/Хроника подземелья|Dungeon Journal/) || location.href.match('boss=');
	if (!chronobox || !(matches = chronobox.getElementsByClassName('new_line'))) {
		return;
	}
	for (i = 0, len = matches.length; i < len; i++) {
		steplines.push(matches[i]);
	}
	if (reversed) {
		steplines.reverse();
	}
	for (i = 0, step = duel ? 0 : 1, len = steplines.length; i < len; i++) {
		stepholder = steplines[i].getElementsByClassName('d_capt')[0];
		stepholder.title = worker.GUIp_i18n.step_n+step;
		dcapt |= stepholder.textContent.length > 0;
		if ((!reversed && steplines[i].style.length > 0 || reversed && (!steplines[i+1] || steplines[i+1].style.length > 0)) && (!duel || dcapt)) {
			step++;
			dcapt = false;
		}
	}
};

ui_log.stoneEaterCompat = function(combo) {
	var result = '', step, steps = worker.Object.keys(this.chronicles), steps_max = steps.length;
	combo = combo.split('');
	for (step = 1; step <= steps_max && combo.length; step++) {
		if (this.chronicles[step].directionless || this.chronicles[step].directionfxd) {
			if (this.chronicles[step].directionguess) {
				combo.shift();
			} else {
				result += combo.shift();
			}
		}
	}
	return result;
};

ui_log.stoneEaterCompat2 = function(combo) {
	var result = [];
	for (var i = 0, len = combo.length; i < len; i++) {
		result.push(combo[i][1]);
		result.push(-combo[i][0]);
	}
	return result.join(',');
};

ui_log.describeMap = function() {
	var step, mapCells, currentCell, trapMoveLossCount = 0,
		coords = GUIp.common.calculateExitXY(),
		steps = worker.Object.keys(this.chronicles),
		steps_max = steps.length;
	mapCells = document.querySelectorAll('#dmap .dml');
	for (step = 1; step <= steps_max; step++) {
		if (this.chronicles[step].directionless) {
			var shortCorrection = (this.directionlessMoveCombo || ui_log.storageGet(this.logSID + 'corrections') || [])[this.directionlessMoveIndex++];
			if (shortCorrection) {
				this.chronicles[step].direction = this.corrections[shortCorrection];
			} else {
				var prevCorrections = this.directionlessMoveCombo || this.storageGet(this.logSID + 'corrections') || '',
					newCorrections = GUIp.common.calculateDirectionlessMove.call(ui_log, '#dmap', coords, step);
				this.chronicles[step].direction = this.corrections[newCorrections[0]];
				this.directionlessMoveCombo = prevCorrections + newCorrections;
				if (document.getElementById('stoneeater')) {
					document.getElementById('stoneeater').value = this.stoneEaterCompat(this.directionlessMoveCombo);
				}
				this.storageSet(this.logSID + 'corrections', this.directionlessMoveCombo);
			}
			this.chronicles[step].directionless = false;
			this.chronicles[step].directionfxd = true;
		}
		GUIp.common.moveCoords(coords, this.chronicles[step]);
		if (this.chronicles[step].wormhole) {
			if (this.chronicles[step].wormholedst === null) {
				var wormholeDst = this.wormholeMoveCombo || JSON.parse(ui_log.storageGet(this.logSID + 'wormholes')) || [];
				if (wormholeDst[this.wormholeMoveIndex]) {
					this.chronicles[step].wormholedst = wormholeDst[this.wormholeMoveIndex];
					this.wormholeMoveCombo = wormholeDst;
				} else {
					var result = this.storageGet('Option:fastWormholes') ? GUIp.common.calculateWormholeMove2.call(ui_log, '#dmap', coords, step) : GUIp.common.calculateWormholeMove.call(ui_log, '#dmap', coords, step);
					if (result.length) {
						worker.console.log('[eGUI+] debug: found possible targets: [' + result.toString() + ']');
						this.chronicles[step].wormholedst = result[0];
						wormholeDst = wormholeDst.concat(result);
						this.wormholeMoveCombo = wormholeDst;
						if (!this.customDomain) {
							ui_log.storageSet(this.logSID + 'wormholes',JSON.stringify(wormholeDst));
						}
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
					if (!currentCell.classList.contains('e_clickable')) {
						currentCell.classList.add('e_clickable');
						currentCell.onclick = function() { ui_log.cellClick(this); };
					}
				}
				worker.console.log('[eGUI+] debug: moving via wormhole to [' + this.chronicles[step].wormholedst.toString() + '] on step ' + step + '.');
				coords.y += this.chronicles[step].wormholedst[0];
				coords.x += this.chronicles[step].wormholedst[1];
				if (document.getElementById('teleports')) {
					document.getElementById('teleports').value = this.stoneEaterCompat2(this.wormholeMoveCombo);
				}
			}
		}
		if (!mapCells[coords.y] || !mapCells[coords.y].children[coords.x]) {
			worker.console.log('[eGUI+] error: the map does not match parsed chronicle at step #' + step + ': either direction ("' + this.chronicles[step].direction + '") is invalid or map is out of sync!');
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
		if (!currentCell.classList.contains('e_clickable')) {
			currentCell.classList.add('e_clickable');
			currentCell.onclick = function() { ui_log.cellClick(this); };
		}
		trapMoveLossCount = GUIp.common.describeCell(currentCell,step,steps_max,this.chronicles[step],trapMoveLossCount);
	}
	var heroesCoords = GUIp.common.calculateXY(document.getElementsByClassName('map_pos')[0]);
	if (heroesCoords.x !== coords.x || heroesCoords.y !== coords.y) {
		worker.console.log('[eGUI+] error: chronicle processing failed, coords diff: x: ' + (heroesCoords.x - coords.x) + ', y: ' + (heroesCoords.y - coords.y) + '.');
	}
};

ui_log.cellClick = function(cell) {
	var targetStep, maxSteps = worker.Object.keys(ui_log.chronicles).length,
		cellSteps = cell.title.match(/#(\d+)\b/g);
	if (!cellSteps) {
		return;
	}
	targetStep = parseInt(cellSteps[0].substr(1));
	for (var i = 0, len = cellSteps.length; i < len - 1; i++) {
		if (parseInt(cellSteps[i].substr(1)) === ui_log.traceStep) {
			targetStep = parseInt(cellSteps[i + 1].substr(1));
			break;
		}
	}
	document.getElementById('trace_progress').max = maxSteps;
	ui_log.traceMapProgressClick(targetStep - 1,maxSteps);
};

ui_log.highlightTreasuryZone = function() {
	GUIp.common.improveMap.call(ui_log,'dmap');
};

ui_log.islandsMapExtractData = function() {
	var content, tracks, smh, scripts = document.getElementsByTagName('script');
	this.islandsMapData = [];
	this.islandsMapTracks = {};
	this.islandsMapSMH = [];
	scriptloop:
	for (var i = 0, len = scripts.length; i < len; i++) {
		content = scripts[i].textContent.match(/ m = \[([^\]]{50,})\];/);
		if (content) {
			content = content[1].split(',');
			for (var j = 0, len2 = content.length; j < len2; j++) {
				if (content[j] % 1 !== 0) {
					continue scriptloop;
				}
				content[j] = +content[j];
			}
			this.islandsMapData = content;
			tracks = scripts[i].textContent.match(/ tr = {(.+?)};/);
			if (tracks) {
				try {
					this.islandsMapTracks = GUIp.common.islandsMapFormatTracks(JSON.parse('{' + tracks[1] + '}'));
				} catch(e) {
					this.islandsMapTracks = {}
					worker.console.log('[eGUI+] error: failed processing map tracks!');
					worker.console.log(e);
				}
			}
			smh = scripts[i].textContent.match(/ smh = \[(.+?)\];/);
			if (smh) {
				smh = smh[1].split(',');
				for (var j = 0, len2 = smh.length; j < len2; j++) {
					if (smh[j] % 1 !== 0) {
						continue;
					}
					smh[j] = +smh[j];
				}
				this.islandsMapSMH = smh;
			}
			break;
		}
	}
	if (!this.islandsMapData.length) {
		this.islandsMapData = JSON.parse(ui_log.storageGet(ui_log.logSID + 'map')) || [];
	}
};

ui_log.getNodeIndex = function(node) {
	var i = 0;
	while ((node = node.previousElementSibling)) {
		i++;
	}
	return i;
};

ui_log.deleteOldEntries = function() {
	var current = ui_log.storageGet('Log:current');
	for (var key in localStorage) {
		if (key.match('eGUI_' + ui_log.godname + ':Log:\\w{5,7}:') && !key.match(ui_log.logSID + (current ? '|' + current : ''))) {
			localStorage.removeItem(key);
		}
	}
};

ui_log.updateButton = function() {
	var isSail = (ui_log.logID.length === 7),
		result = ui_log.checkLogLimits();
	if (result.allowed === false) {
		ui_log.button.innerHTML = worker.GUIp_i18n.send_log_to_LEMs_script + (isSail ? ' (' + worker.GUIp_i18n.till_next_try_s : '<br>' + worker.GUIp_i18n.till_next_try) + result.minutes + ':' + result.seconds + (isSail ? ')' : '');
		ui_log.button.setAttribute('disabled', 'disabled');
	} else {
		ui_log.button.innerHTML = worker.GUIp_i18n.send_log_to_LEMs_script + (isSail ? ' (' + worker.GUIp_i18n.tries_left_s : '<br>' + worker.GUIp_i18n.tries_left) + result.tries + (isSail ? ')' : '');
		ui_log.button.removeAttribute('disabled');		
	}
};

ui_log.islandsMapOptionCreate = function(mapSettings, optName) {
	var label = document.createElement('label'),
		checkbox = document.createElement('input');
	label.textContent = worker.GUIp_i18n['islands_map_' + optName];
	checkbox.id = 'checkbox-'+optName;
	checkbox.type = 'checkbox';
	if (mapSettings.match(optName)) {
		checkbox.checked = true;
	}
	checkbox.onclick = this.islandsMapOptionClick.bind(this,optName);
	label.insertBefore(checkbox, label.firstChild);
	return label;
}

ui_log.islandsMapOptionClick = function(optName) {
	var index, settings = (this.storageGet('Option:islandsMapSettings') || '').split(','),
		checkbox = document.getElementById('checkbox-'+optName);
	index = settings.indexOf(optName);
	if (checkbox.checked) {
		if (index < 0) {
			settings.push(optName);
		}
	} else {
		if (index >= 0) {
			settings.splice(index, 1);
		}
	}
	if (optName === 'mfc' && checkbox.checked && settings.indexOf('mbc') < 0) {
		settings.push('mbc');
		document.getElementById('checkbox-mbc').checked = true;
	}
	if (optName === 'mbc' && !checkbox.checked && (index = settings.indexOf('mfc')) > -1) {
		settings.splice(index, 1);
		document.getElementById('checkbox-mfc').checked = false;
	}
	this.storageSet('Option:islandsMapSettings',settings.join(','));
	this.islandsMapUpdate(true);
};

ui_log.islandsMapOptions = function() {
	if (!document.getElementById('sail_map')) {
		return;
	}
	var points, options_box, option_checkbox, map_anchor = document.getElementById('h_tbl'),
		map_settings = this.storageGet('Option:islandsMapSettings') || '';
	options_box = document.createElement('div');
	options_box.style.textAlign = 'center';
	if (worker.make_map_log) {
		option_checkbox = this.islandsMapOptionCreate(map_settings, 'mbc');
		options_box.insertBefore(option_checkbox, null);
		options_box.insertBefore(document.createTextNode(' '), null);
		option_checkbox = this.islandsMapOptionCreate(map_settings, 'mfc');
		options_box.insertBefore(option_checkbox, null);
		options_box.insertBefore(document.createTextNode(' '), null);
		option_checkbox = this.islandsMapOptionCreate(map_settings, 'shh');
		options_box.insertBefore(option_checkbox, null);
	}
	// LEM's uploader start
	if (this.steps > this.firstRequest) {
		this.islandsMapExtractData();
		options_box.insertBefore(document.createElement('br'), null);
		options_box.insertAdjacentHTML('beforeend',
				'<form target="_blank" method="post" enctype="multipart/form-data" action="//www.godalert.info/Sail/index' + (worker.GUIp_locale === 'en' ? '-eng' : '') + '.cgi" id="send_to_LEM_form" style="display: inline;">' +
				'<input type="hidden" name="fight_text" value="">' +
				'<input type="hidden" name="guip" value="1">' +
				'<button name="submit_map" style="margin-top: 6px;">' + worker.GUIp_i18n.get_your_map + '</button>' +
				'</form> <a id="sail_points_switch" title="' + worker.GUIp_i18n.sail_points_desc + '" style="text-decoration: none;">►</a>' + 
				'<div id="sail_points_block" style="display: none; margin-top: 6px;">' + worker.GUIp_i18n.sail_points + ': <input id="sail_points" type="text"> <button id="sail_points_update">' + worker.GUIp_i18n.sail_points_update + '</button></div>');
		options_box.querySelector('input[name=fight_text]').value = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">' +
			document.getElementsByTagName('html')[0].innerHTML.replace(/<style[\S\s]+?<\/style>/g, '')
															  .replace(/background-image: url\(&quot;data:image[^)]+\);/g, '')
															  .replace(/onclick="[^"]+?"/g, '')
															  .replace(/<script[^>]*?>/g, '<notascript>')
															  .replace(/<form[\s\S]+?<\/form>/g, '')
															  .replace(/<svg[\s\S]+?<\/svg>/g, '')
															  .replace(/<iframe[\s\S]+?<\/iframe>/g, '')
															  .replace(/\t/g, '')
															  .replace(/ {2,}/g, ' ')
															  .replace(/\n{2,}/g, '\n') +
			'<!-- var m = [' + this.islandsMapData.toString() + ']; -->' +
			'<!-- var points = [' + this.islandsMapPoints.toString() + ']; -->' +
			'</html>';
		if (!this.sailPackageRequested) {
			if (this.islandsMapPoints.length > 0) {
				options_box.querySelector('#sail_points').value = JSON.stringify(this.islandsMapPoints);
			}
			options_box.querySelector('#sail_points').onclick = function() { this.select(); };
			options_box.querySelector('#sail_points_switch').onclick = function(e) {
				e.preventDefault();
				var box = options_box.querySelector('#sail_points_block');
				if (box.style.display === 'none') {
					this.textContent = '▼';
					box.style.display = '';
				} else {
					this.textContent = '►';
					box.style.display = 'none';
				}
			}
			options_box.querySelector('#sail_points_update').onclick = function(e) {
				e.preventDefault();
				var points = [], input = options_box.querySelector('#sail_points'),
					ftext = options_box.querySelector('input[name=fight_text]');
				if (input.value.length > 0) {
					try {
						points = JSON.parse(input.value);
					} catch (e) {
						input.value = worker.GUIp_i18n.sail_points_invalid;
						return;
					}
				}
				ui_log.storageSet(ui_log.logSID + 'points',GUIp.common.islandsMapSavePOI(ui_log.storageGet(ui_log.logSID + 'points'),ui_log.logID,points,true));
				ftext.value = ftext.value.replace(/<!-- var points = \[[^\]]+\]; -->/,'<!-- var points = [' + points.toString() + ']; -->');
				ui_log.islandsMapUpdate(true);
			}
		} else {
			options_box.querySelector('#sail_points_switch').style.display = 'none';
		}
		this.button = options_box.querySelector('button[name=submit_map]');
		this.button.onclick = function(e) {
			e.preventDefault();
			ui_log.updateLogLimits();
			ui_log.updateButton();
			this.form.submit();
		}
		this.updateButton();
		worker.setInterval(function() {
			ui_log.updateButton();
		}, 10000);
	}
	// LEM's uploader end
	if (map_anchor) {
		map_anchor.parentNode.insertBefore(options_box,map_anchor);
	}
};

ui_log.islandsMapUpdate = function(redraw) {
	var pborder, mapSettings, map_anchor,
		map_elem = document.getElementById('sail_map');
	this.islandsMapExtractData();
	mapSettings = this.storageGet('Option:islandsMapSettings') || '';
	// get conditions
	var ctexts = document.querySelectorAll('.new_line.saild_');
	if (!location.href.match('sort=desc')) {
		ctexts = ctexts[1];
	} else {
		ctexts = ctexts[ctexts.length - 2];
	}
	if (ctexts && ctexts.textContent.length) {
		this.islandsMapConds = GUIp.common.islandsMapGetConds(ctexts.textContent).join(',');
	}
	if (this.islandsMapData.length > 5) {
		// detect actual borders. thank you dear game developers a lot for that.
		if ((pborder = GUIp.common.islandsMapSearchData.call(ui_log,[,,,35])).length || (pborder = GUIp.common.islandsMapSearchData.call(ui_log,[,,,36])).length) {
			var qborder = [];
			for (var i = 0, len = pborder.length; i < len; i++) {
				qborder = qborder.concat(GUIp.common.lb2array(pborder[i]).slice(0,3));
			}
			ui_log.islandsMapRadius = Math.max.apply(null,qborder.map(Math.abs));
		}
		// gather some info about map
		GUIp.common.islandsMapScan.call(ui_log);
		// draw borders and fill map if necessary
		if (worker.make_map_log) {
			if (!map_elem) {
				map_elem = '<div id="sail_map"></div>';
				map_anchor = document.getElementById('h_tbl');
				if (map_anchor) {
					map_anchor.previousSibling.insertAdjacentHTML('beforebegin', map_elem);
				}
				redraw = true;
			}
			if (mapSettings.match('mbc|mfc')) {
				GUIp.common.islandsMapModify.call(ui_log,mapSettings.match('mbc'),mapSettings.match('mfc'));
			}
			if (this.islandsMapData.length && (redraw || mapSettings.match('mbc|mfc'))) {
				worker.make_map_log(worker.$('#sail_map'), this.islandsMapData, {}, 0, '', this.islandsMapTracks);
			}
		}
	}
	// improve hints
	if (!mapSettings.match('shh')) {
		GUIp.common.islandsMapImproveHints.call(ui_log,{dhh:mapSettings.match('dhh')});
	} else {
		GUIp.common.islandsMapImproveHints2.call(ui_log,{dhh:mapSettings.match('dhh')});
	}
	// colorize points of interest
	this.islandsMapPoints = GUIp.common.islandsMapLoadPOI(this.storageGet(ui_log.logSID + 'points'),this.logID);
	if (!ui_log.customDomain) {
		worker.GUIp_islandsMapPoints = GUIp.common.islandsMapLoadPOI(this.storageGet(ui_log.logSID + 'points'),this.logID,true);
	} else if (worker.e_islandsMapPoints) {
		if (this.islandsMapPoints.length < worker.e_islandsMapPoints.length) {
			this.islandsMapPoints = worker.e_islandsMapPoints || [];
		}
	}
	if (this.islandsMapSMH.length) {
		this.islandsMapPoints = [];
		var pdata, gmrk, gnum = -1, colormap = {};
		for (var i = 0, len = this.islandsMapSMH.length; i < len; i++) {
			pdata = GUIp.common.lb2array(this.islandsMapSMH[i]);
			if (gmrk !== pdata[3]) {
				gnum++;
				gmrk = pdata[3];
			}
			if (colormap[gnum] === undefined) {
				colormap[gnum] = GUIp.common.islandsMapGetPOIColor(this.islandsMapPoints,mapSettings.match('rndc'));
			}
			this.islandsMapPoints.push((this.islandsMapSMH[i] & 0xFFFFFF) + colormap[gnum] * 16777216);
		}
		GUIp.common.islandsMapHighlightPOI(this.islandsMapPoints,{dhh:mapSettings.match('dhh')});
	} else {
		if (this.islandsMapPoints.length > 0) {
			var colorIndex = GUIp.common.islandsMapGetPOIColor(this.islandsMapPoints, true),
				currentPoints = GUIp.common.islandsMapSearchData_multi.call(ui_log,[33,96,126,94,38,40,41],3);
			cpLoop:
			for (var i = 0, len = currentPoints.length; i < len; i++) {
				for (var j = 0, len2 = this.islandsMapPoints.length; j < len2; j++) {
					if ((currentPoints[i] & 0xFFFFFF) === (this.islandsMapPoints[j] & 0xFFFFFF)) {
						continue cpLoop;
					}
				}
				this.islandsMapPoints.push((currentPoints[i] & 0xFFFFFF) + colorIndex * 16777216);
			};
			GUIp.common.islandsMapHighlightPOI(this.islandsMapPoints,{dhh:mapSettings.match('dhh')});
		} else {
			GUIp.common.islandsMapHighlightPOI(GUIp.common.islandsMapSearchData_multi.call(ui_log,[33,96,126,94,38,40,41],3),{nohistory:true,dhh:mapSettings.match('dhh')});
		}
	}
	this.islandsMapData = [];
};

ui_log.getLEMRestrictions = function() {
	var postfix = '';
	if (this.logID.length === 7) {
		postfix = 'S';
	}
	this.firstRequest = ui_log.storageGet('LEMRestrictions:FirstRequest' + postfix) || (postfix ? 5 : 12);
	this.timeFrameSeconds = (ui_log.storageGet('LEMRestrictions:TimeFrame' + postfix) || (postfix ? 20 : 20))*60;
	this.requestLimit = ui_log.storageGet('LEMRestrictions:RequestLimit' + postfix) || (postfix ? 8 : 5);
	if (isNaN(this.storageGet('LEMRestrictions:Date' + postfix)) || Date.now() - this.storageGet('LEMRestrictions:Date' + postfix) > 24*60*60*1000) {
		GUIp.common.getXHR('//www.godalert.info/' + (postfix ? 'Sail' : 'Dungeons') + '/guip.cgi', this.parseLEMRestrictions.bind(this), undefined, postfix);
	}
};

ui_log.parseLEMRestrictions = function(xhr) {
	var restrictions = JSON.parse(xhr.responseText);

	this.storageSet('LEMRestrictions:Date' + xhr.extra_arg, Date.now());
	this.storageSet('LEMRestrictions:FirstRequest' + xhr.extra_arg, restrictions.first_request);
	this.storageSet('LEMRestrictions:TimeFrame' + xhr.extra_arg, restrictions.time_frame);
	this.storageSet('LEMRestrictions:RequestLimit' + xhr.extra_arg, restrictions.request_limit);

	this.firstRequest = restrictions.first_request;
	this.timeFrameSeconds = restrictions.time_frame * 60;
	this.requestLimit = restrictions.request_limit;
};

ui_log.updateLogLimits = function() {
	for (var i = ui_log.requestLimit; i > 1; i--) {
		ui_log.storageSet(ui_log.logSID + 'sentToLEM' + i, ui_log.storageGet(ui_log.logSID + 'sentToLEM' + (i - 1)));
	}
	ui_log.storageSet(ui_log.logSID + 'sentToLEM1', Date.now());
};

ui_log.checkLogLimits = function() {
	var i;
	if (!isNaN(ui_log.storageGet(ui_log.logSID + 'sentToLEM' + ui_log.requestLimit)) && Date.now() - ui_log.storageGet(ui_log.logSID + 'sentToLEM' + ui_log.requestLimit) < ui_log.timeFrameSeconds*1000) {
		var time = ui_log.timeFrameSeconds - (Date.now() - ui_log.storageGet(ui_log.logSID + 'sentToLEM' + ui_log.requestLimit))/1000,
			minutes = Math.floor(time/60),
			seconds = Math.floor(time%60);
		seconds = seconds < 10 ? '0' + seconds : seconds;
		return {allowed: false, minutes: minutes, seconds: seconds};
	} else {
		var tries = 0;
		for (i = 0; i < ui_log.requestLimit; i++) {
			if (isNaN(ui_log.storageGet(ui_log.logSID + 'sentToLEM' + i)) || Date.now() - ui_log.storageGet(ui_log.logSID + 'sentToLEM' + i) > ui_log.timeFrameSeconds*1000) {
				tries++;
			}
		}
		return {allowed: true, tries: tries};
	}
};

ui_log.saverSendLog = function() {
	var i, div = document.createElement('div'), inputs = '<input type="hidden" name="bosses_count" value="' + ui_log.saverBossesCnt + '"><input type="hidden" name="log_id" value="' + ui_log.logID + '">';
	for (i = 0; i < ui_log.saverPages.length; i++) {
		inputs += '<input type="hidden" name="' + i + '">';
	}
	if (ui_log.islandsMapPoints && ui_log.islandsMapPoints.length > 0) {
		inputs += '<input type="hidden" name="poi" value="' + [].concat(worker.GUIp_islandsMapPoints).join(',') + '">';
	}
	inputs += '<input type="hidden" name="tzo" value="' + (new Date()).getTimezoneOffset() + '">';
	div.insertAdjacentHTML('beforeend', '<form method="post" action="' + ui_log.saverURL + '" enctype="multipart/form-data" accept-charset="utf-8">' + inputs + '</form>');
	for (i = 0; i < ui_log.saverPages.length; i++) {
		div.querySelector('input[name="' + i + '"]').setAttribute('value', ui_log.saverPages[i]);
	}
	document.body.appendChild(div);
	div.firstChild.submit();
	document.body.removeChild(div);
};

ui_log.saverFetchPage = function(boss_no) {
	GUIp.common.getXHR(location.protocol + '//' + location.host + location.pathname + (boss_no ? '?boss=' + boss_no : ''), ui_log.saverProcessPage.bind(null), ui_log.saverFetchFailed.bind(null), boss_no);
};

ui_log.saverProcessPage = function(xhr) {
	var boss_no = xhr.extra_arg || 0;
	if (!xhr.responseText.match(new worker.RegExp(worker.GUIp_i18n.saver_missing_log_c)) && xhr.responseText.match(/class="lastduelpl"/)) {
		var page = xhr.responseText.replace(/<img[^>]+>/g, '')
								 .replace(/\.js\?\d+/g, '.js')
								 .replace(/\.css\?\d+/g, '.css')
								 .replace(/трое суток/, 'по мере возможности')
								 .replace(/for 3 days after the fight is over/, 'as far as possible')
		if (ui_log.logID.length === 5) {
			page = page.replace(/<script[\s\S]+?<\/script>/g, '');
		} else {
			page = page.replace(/(<script[^>]*?>[\s\S]*?<\/script>)/g, function(script) { return script.match(/Tracker|analytics/) ? '' : script.replace(/\.js\?\d+/g, '.js'); });
		}
		if (!page.match(/text\/html; charset=/)) {
			page = page.replace('<head>', '<head>\n<meta http-equiv="content-type" content="text/html; charset=UTF-8">')
		}
		ui_log.saverPages.push(page);
		if (boss_no < ui_log.saverBossesCnt) {
			ui_log.saverFetchPage(boss_no + 1);
		} else {
			ui_log.saverSendLog();
		}
	} else {
		ui_log.saverRemoveLoader();
		worker.alert(worker.GUIp_i18n.saver_error + ' (#1)');
	}
};

ui_log.saverFetchFailed = function() {
	ui_log.saverRemoveLoader();
	worker.alert(worker.GUIp_i18n.saver_error + ' (#2)');
};

ui_log.saverAddLoader = function() {
	document.body.insertAdjacentHTML('beforeend', '<div id="erinome_chronicle_loader" style="position: fixed; left: 50%; top: 50%; margin: -24px; padding: 8px; background: rgba(255,255,255,0.9);"><img src="' + (worker.GUIp_browser !== 'Opera' ? GUIp_getResource('images/loader.gif') : '//gv.erinome.net/images/loader.gif') + '"></div>');
};

ui_log.saverRemoveLoader = function() {
	if (document.getElementById('erinome_chronicle_loader')) {
		document.body.removeChild(document.getElementById('erinome_chronicle_loader'));
	}
};

ui_log.saverPrepareLog = function() {
	if (worker.GUIp_locale === 'ru') {
		ui_log.saverURL = '//gv.erinome.net/processlog';
	} else {
		ui_log.saverURL = '//gvg.erinome.net/processlog';
	}
	try {
		ui_log.saverPages = [];
		if (!ui_log.logID) {
			throw worker.GUIp_i18n.saver_invalid_log;
		}
		if (document.getElementById('search_status') && document.getElementById('search_status').textContent.match(new worker.RegExp(worker.GUIp_i18n.saver_missing_log_c))) {
			throw worker.GUIp_i18n.saver_missing_log;
		}
		if (document.getElementsByClassName('lastduelpl')[1] && document.getElementsByClassName('lastduelpl')[1].textContent.match(new worker.RegExp(worker.GUIp_i18n.saver_broadcast_log_c))) {
			throw worker.GUIp_i18n.saver_broadcast_log;
		}
		if (document.getElementById('erinome_chronicle_loader')) {
			worker.alert(worker.GUIp_i18n.saver_already_working);
			return;
		} else {
			ui_log.saverAddLoader();
		}
		ui_log.saverBossesCnt = document.querySelectorAll('a[href*="boss"]').length;
		ui_log.saverFetchPage(null);
	} catch(e) {
		ui_log.saverRemoveLoader();
		worker.alert(worker.GUIp_i18n.error_message_subtitle + ' ' + e);
	}
};

ui_log.onscroll = function() {
	var $box = document.querySelector('#hero2 .box'),
		isFixed = $box.style.position === 'fixed';
	if (worker.scrollY > $box.offsetTop && ($box.offsetHeight + (ui_log.lfExp ? 0 : 100)) < worker.innerHeight && !isFixed) {
		$box.style.position = 'fixed';
		$box.style.top = 0;
	} else if ((worker.scrollY <= $box.offsetTop || ($box.offsetHeight + (ui_log.lfExp ? 0 : 100)) >= worker.innerHeight) && isFixed) {
		$box.style.position = 'static';
	}
};

ui_log.starter = function() {
	if (!worker.GUIp_locale || !worker.GUIp_i18n || !worker.GUIp || !worker.GUIp.common) { return; }

	// init mobile cookies
	GUIp.common.forceDesktopPage();

	// sail broadcast detection
	if (this.logID.length === 7 && !document.getElementById('sail_map') && !this.mapNotAvailable) {
		this.godname = GUIp.common.getCurrentGodname();
		if (!this.storageGet('Log:' + ui_log.logID + ':map')) {
			this.mapNotAvailable = true;
			return;
		}
		if (!this.sailPackageRequested) {
			GUIp.common.loadLocalScript('sail_' + worker.GUIp_locale + '_packaged.js');
			this.sailPackageRequested = true;
			return;
 		}
 		if (worker.HS2 !== undefined) {
 			var map_data = JSON.parse(this.storageGet('Log:' + ui_log.logID + ':map')),
 				map_anchor = document.getElementById('h_tbl');
 			if (map_data && map_anchor) {
 				map_anchor.previousSibling.insertAdjacentHTML('beforebegin', '<div id="sail_map"></div>');
 				new HS2().s(map_data,{},[],{});
 			}
 		}
 		return;
	}

	worker.clearInterval(starterInt);

	// check for missing chronicle
	if (document.getElementById('search_status') && document.getElementById('search_status').textContent.match(new worker.RegExp(worker.GUIp_i18n.saver_missing_log_c))) {
		if (!ui_log.customDomain) {
			var id = location.href.match(/duels\/log\/([^\?]+)/)[1];
			if (worker.GUIp_locale === 'ru') {
				document.getElementById('search_status').insertAdjacentHTML('beforeend','<br/><br/>Попробуйте поискать хронику:<br/><a href="//gdvl.tk/duels/log/'+id+'?from=search">gdvl.tk</a> или <a href="//gv.erinome.net/duels/log/'+id+'?from=search">gv.erinome.net</a>');
			} else {
				document.getElementById('search_status').insertAdjacentHTML('beforeend','<br/><br/>Try searching your chronicle in:<br/><a href="//gvg.erinome.net/duels/log/'+id+'?from=search">gvg.erinome.net</a>');
			}
		}
		return;
	}

	var fight_log_capt = document.getElementById('fight_log_capt') || document.querySelector('#last_items_arena .block_h, #fight_chronicle .block_h');
	if (!fight_log_capt) {
		return;
	}

	if (worker.Hexer) {
		ui_log.hex = new worker.Hexer();
		worker.make_map_log = function() {
			ui_log.hex.draw_smap.apply(ui_log.hex,arguments);
		}
	}

	// detect godname
	this.godname = GUIp.common.getCurrentGodname();
	
	// clean old entries. once is enough.
	this.deleteOldEntries();

	// mark page as chronicle for use in custom CSS
	document.body.classList.add('chronicle');

	// add some styles
	GUIp.common.addCSSFromURL(worker.GUIp_getResource('superhero.css'), 'guip_css');
	GUIp.common.addCSSFromString(this.storageGet('UserCss'));
	var background = this.storageGet('Option:useBackground');
	if (background) {
		document.querySelector('.lastduelpl').style.cssText = 'margin-top: 0; padding-top: 10px;';
		GUIp.common.setPageBackground(background);
	}

	// add save links
	if (!ui_log.customDomain && (!document.getElementsByClassName('lastduelpl')[1] || !document.getElementsByClassName('lastduelpl')[1].textContent.match(/прямая трансляция|broadcast/))) {
		var savelnk, savediv = document.createElement('div');
		savediv.insertBefore(document.createTextNode(worker.GUIp_i18n.save_log_to + ' '), null);
		savelnk = document.createElement('a');
		if (worker.GUIp_locale === 'ru') {
			savelnk.onclick = function() { GUIp.common.loadSaverScript('gdvl.tk'); }
			savelnk.textContent = 'gdvl.tk';
			savediv.insertBefore(savelnk, null);
			savediv.insertBefore(document.createTextNode(worker.GUIp_i18n.or), null);
			savelnk = document.createElement('a');
			savelnk.onclick = function() { ui_log.saverPrepareLog() }
			savelnk.textContent = 'gv.erinome.net';
		} else {
			savelnk.onclick = function() { ui_log.saverPrepareLog() }
			savelnk.textContent = 'gvg.erinome.net';
		}
		savediv.insertBefore(savelnk, null);
		document.getElementsByClassName('lastduelpl_f')[1].insertBefore(savediv,null);
	}

	// add usercss for custom domains
	if (ui_log.customDomain) {
		var uclink = document.querySelector('.lastduelpl_f a[href="#"]');
		if (uclink) {
			uclink.insertAdjacentHTML('afterend','<span>, <a id="user_css_edit" href="#">CSS ►</a><div id="user_css_form"><textarea></textarea></div></span>');
			document.querySelector('#user_css_edit').onclick = function() {
				var ucform = document.getElementById('user_css_form');
				if (ucform.style.display === 'block') {
					this.textContent = 'CSS ►';
					ui_log.storageSet('UserCss',document.querySelector('#user_css_form textarea').value);
					GUIp.common.addCSSFromString(ui_log.storageGet('UserCss'));
					ucform.style.display = 'none';
				} else {
					this.textContent = 'CSS ▼';
					document.querySelector('#user_css_form textarea').value = ui_log.storageGet('UserCss');
					ucform.style.display = 'block';
				}
				return false;
			};
		}
	}

	if (location.href.match('boss=') || !fight_log_capt.textContent.match(/Хроника (подземелья|заплыва)|(Dungeon|Sail) Journal/)) {
		ui_log.enumerateSteps();
		return;
	}

	try {
		this.logSID = 'Log:' + location.href.match(/duels\/log\/([^\?]+)/)[1] + ':';
		this.steps = +fight_log_capt.textContent.match(/(?:шаг|step) (\d+)\)/)[1];
		// add step numbers to chronicle log
		this.enumerateSteps();
		// update LEM restrictions
		this.getLEMRestrictions();
		// specific code for sailing
		if (fight_log_capt.textContent.match(/Хроника заплыва|Sail Journal/)) {
			this.islandsMapUpdate();
			this.islandsMapOptions();
			return;
		}
		// add a map for a translation-type chronicle
		if (!document.querySelector('#dmap') && this.steps === +this.storageGet(this.logSID + 'steps')) {
			var map = JSON.parse(ui_log.storageGet(ui_log.logSID + 'map')),
				map_elem = '<div id="hero2"><div class="box"><div class="block"><div class="block_h">' + worker.GUIp_i18n.map + '</div><div id="dmap" class="new_line em_font">';
			for (var i = 0, ilen = map.length; i < ilen; i++) {
				map_elem += '<div class="dml" style="width:' + (map[0].length * 21) + 'px;">';
				for (var j = 0, jlen = map[0].length; j < jlen; j++) {
					map_elem += '<div class="dmc' + (map[i][j] === '#' ? ' dmw' : '') + '" style="left:' + (j * 21) + 'px">' + map[i][j] + '</div>';
				}
				map_elem += '</div>';
			}
			map_elem += '</div></div></div></div>';
			document.getElementById('right_block').insertAdjacentHTML('beforeend', map_elem);
		}
		if (document.querySelector('#hero2 .box')) {
			worker.onscroll = function() { ui_log.onscroll(); };
			worker.setTimeout(function() { ui_log.onscroll(); }, 500);
		}
		// add some colors and other info to the map
		this.initColorMap();
		// send button and other stuff
		var $box = document.querySelector('#hero2 fieldset, #hero2 .block') || document.getElementById('right_block');
		// dungeon map tracer
		$box.insertAdjacentHTML('beforeend', '<div class="trace_div"><progress id="trace_progress" max="0" value="0" title="' + worker.GUIp_i18n.trace_map_progress_stopped + '"></progress><span class="trace_buttons"><button class="trace_button" id="trace_button_prev" title="' + worker.GUIp_i18n.trace_map_prev + '"><img src="' + worker.GUIp_getResource('images/trace_prev.png') + '"/></button><button class="trace_button" id="trace_button_stop" title="' + worker.GUIp_i18n.trace_map_stop + '"><img src="' + worker.GUIp_getResource('images/trace_stop.png') + '"/></button><button class="trace_button" id="trace_button_play" title="' + worker.GUIp_i18n.trace_map_start + '"><img src="' + worker.GUIp_getResource('images/trace_play.png') + '"/><img src="' + worker.GUIp_getResource('images/trace_pause.png') + '" style="display:none;"/></button><button class="trace_button" id="trace_button_next" title="' + worker.GUIp_i18n.trace_map_next + '"><img src="' + worker.GUIp_getResource('images/trace_next.png') + '"/></button></span></div>');
		if (worker.GUIp_browser === 'Opera') {
			worker.GUIp_getResource('images/trace_prev.png',document.querySelector('#trace_button_prev img'),true);
			worker.GUIp_getResource('images/trace_pause.png',document.querySelector('#trace_button_pause img'),true);
			worker.GUIp_getResource('images/trace_stop.png',document.querySelector('#trace_button_stop img'),true);
			worker.GUIp_getResource('images/trace_play.png',document.querySelectorAll('#trace_button_play img')[0],true);
			worker.GUIp_getResource('images/trace_pause.png',document.querySelectorAll('#trace_button_play img')[1],true);
			worker.GUIp_getResource('images/trace_next.png',document.querySelector('#trace_button_next img'),true);
		}
		document.getElementById('trace_button_stop').onclick = function() { ui_log.traceMapStop(); };
		document.getElementById('trace_button_play').onclick = function() {
			if (!ui_log.traceCoords) {
				ui_log.traceStep = 0;
				ui_log.traceDir = 1;
				ui_log.traceCoords = GUIp.common.calculateExitXY();
				document.getElementById('trace_progress').max = worker.Object.keys(ui_log.chronicles).length;
			}
			if (ui_log.traceInt) {
				ui_log.traceMapPause();
			} else {
				ui_log.traceMapStart();
			}
		};
		document.getElementById('trace_button_prev').onclick = function() {
			if (ui_log.traceInt) {
				ui_log.traceMapPause();
			}
			if (!ui_log.traceCoords || ui_log.traceStep <= 1) {
				return;
			}
			ui_log.traceMapProcess(-1);
		};
		document.getElementById('trace_button_next').onclick = function() {
			if (ui_log.traceInt) {
				ui_log.traceMapPause();
			}
			if (!ui_log.traceCoords) {
				ui_log.traceStep = 0;
				ui_log.traceDir = 1;
				ui_log.traceCoords = GUIp.common.calculateExitXY();
				document.getElementById('trace_progress').max = worker.Object.keys(ui_log.chronicles).length;
			}
			if (ui_log.traceStep === worker.Object.keys(ui_log.chronicles).length) {
				return;
			}
			ui_log.traceMapProcess(1);
		};
		document.getElementById('trace_progress').onclick = function(e) {
			this.max = worker.Object.keys(ui_log.chronicles).length;
			if (this.max === 0) {
				return;
			}
			ui_log.traceMapProgressClick(parseInt(e.offsetX * this.max / this.offsetWidth),this.max);
		};
		// LEM's uploader
		if (location.href.match('sort')) {
			$box.insertAdjacentHTML('beforeend', '<span id="send_to_LEM_form">' + worker.GUIp_i18n.wrong_entries_order + '</span>');
			return;
		}
		if (this.steps < this.firstRequest) {
			$box.insertAdjacentHTML('beforeend', '<span id="send_to_LEM_form">' + worker.GUIp_i18n.the_button_will_appear_after + this.firstRequest + worker.GUIp_i18n.step + '</span>');
			return;
		}
		$box.insertAdjacentHTML('beforeend',
			'<form target="_blank" method="post" enctype="multipart/form-data" action="//www.godalert.info/Dungeons/index' + (worker.GUIp_locale === 'en' ? '-eng' : '') + '.cgi" id="send_to_LEM_form" style="padding-top: calc(0.5em + 3px);">' +
				'<input type="hidden" id="fight_text" name="fight_text">' +
				'<input type="hidden" name="map_type" value="map_graphic">' +
				'<input type="hidden" name="min" value="X">' +
				'<input type="hidden" name="partial" value="X">' +
				'<input type="hidden" name="room_x" value="">' +
				'<input type="hidden" name="room_y" value="">' +
				'<input type="hidden" name="Submit" value="' + worker.GUIp_i18n.get_your_map + '">' +
				'<input type="hidden" name="guip" value="1">' +
				'<div' + (ui_log.customDomain ? '' : ' style="display: none;"') + '><input type="checkbox" id="match" name="match" value="1"><label for="match">' + worker.GUIp_i18n.search_database + '</label></div>' +
				'<div id="search_mode" style="display: none;">' +
					'<input type="checkbox" id="match_partial" name="match_partial" value="1"><label for="match_partial">' + worker.GUIp_i18n.relaxed_search + '</label>' +
					'<div><input type="radio" id="exact" name="search_mode" value="exact"><label for="exact">' + worker.GUIp_i18n.exact + '</label></div>' +
					'<div><input type="radio" id="high" name="search_mode" value="high"><label for="high">' + worker.GUIp_i18n.high_precision + '</label></div>' +
					'<div><input type="radio" id="medium" name="search_mode" value="medium" checked=""><label for="medium">' + worker.GUIp_i18n.normal + '</label></div>' +
					'<div><input type="radio" id="low" name="search_mode" value="low"><label for="low">' + worker.GUIp_i18n.primary + '</label></div>' +
				'</div>' +
				'<table style="box-shadow: none; width: 100%;"><tr>' +
					'<td style="border: none; padding: 0;"><label for="stoneeater">' + worker.GUIp_i18n.corrections + '</label></td>' +
					'<td style="border: none; padding: 0 1.5px 0 0; width: 100%;"><input type="text" id="stoneeater" name="stoneeater" value="' + this.stoneEaterCompat(ui_log.storageGet(ui_log.logSID + 'corrections') || ui_log.directionlessMoveCombo) + '" style=" width: 100%; padding: 0;"></td>' +
				'</tr><tr>' +
					'<td style="border: none; padding: 0;"><label for="teleports">' + worker.GUIp_i18n.wormholes + '</label></td>' +
					'<td style="border: none; padding: 0 1.5px 0 0; width: 100%;"><input type="text" id="teleports" name="teleports" value="' + this.stoneEaterCompat2(JSON.parse(ui_log.storageGet(ui_log.logSID + 'wormholes')) || ui_log.wormholeMoveCombo) + '" style=" width: 100%; padding: 0;"></td>' +
				'</tr></table>' +
				'<input type="checkbox" id="high_contrast" name="high_contrast" value="1"><label for="high_contrast">' + worker.GUIp_i18n.high_contrast + '</label>' +
				'<button id="send_to_LEM" style="font-size: 15px; height: 100px; width: 100%;">' +
			'</form>');
		document.querySelector('#fight_text').value = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" >\n<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">' +
															document.getElementsByTagName('html')[0].innerHTML.replace(/<(?:script|style)[\S\s]+?<\/(?:script|style)>/g, '')
																											  .replace(/background-image: url\(&quot;data:image[^)]+\);/g, '')
																											  .replace(/onclick="[^"]+?"/g, '')
																											  .replace(/"javascript[^"]+"/g, '""')
																											  .replace(/<form[\s\S]+?<\/form>/g, '')
																											  .replace(/<iframe[\s\S]+?<\/iframe>/g, '')
																											  .replace(/\t/g, '')
																											  .replace(/<div[^>]+class="dmc[^>]+>/g,'<div class="dmc">')
																											  .replace(/ {2,}/g, ' ')
																											  .replace(/\n{2,}/g, '\n') +
													  '</html>';
		if (this.chronicleGeneratedMap) {
			document.querySelector('#fight_text').value = document.querySelector('#fight_text').value.replace(/<div id="hero2"[\s\S]+?<\/div><\/div><\/div><\/div>/g, '');
		}
		var match = document.getElementById('match'),
			search_mode = document.getElementById('search_mode'),
			high_contrast = document.getElementById('high_contrast');
		this.button = document.getElementById('send_to_LEM');
		this.button.onclick = function(e) {
			e.preventDefault();
			ui_log.updateLogLimits();
			ui_log.updateButton();
			this.form.submit();
			document.getElementById('match').checked = false;
			document.getElementById('match_partial').checked = false;
			document.getElementById('medium').click();
			document.getElementById('search_mode').style.display = "none";
		};
		ui_log.updateButton();
		worker.setInterval(function() {
			ui_log.updateButton();
		}, 10000);
		match.onchange = function() {
			search_mode.style.display = search_mode.style.display === 'none' ? 'block' : 'none';
			ui_log.lfExp = search_mode.style.display === 'block';
			if (worker.onscroll) { worker.onscroll(); }
		};
		high_contrast.checked = localStorage.getItem('eGUI_highContrast') === 'true';
		high_contrast.onchange = function() {
			localStorage.setItem('eGUI_highContrast', document.getElementById('high_contrast').checked);
		};
	} catch(e) {
		worker.console.log(e);
	}
};

var starterInt = worker.setInterval(function() { ui_log.starter(); }, 100);

})();
