(function() {
'use strict';

var worker = window;

worker.GUIp = worker.GUIp || {};

GUIp.common = {};

GUIp.common.addCSSFromURL = function(href, id) {
	if (!href) {
		return;
	}
	document.head.insertAdjacentHTML('beforeend', '<link id="' + id + '" type="text/css" href="' + href + '" rel="stylesheet" media="screen">');
};

GUIp.common.addCSSFromString = function(text, id) {
	if (!id) {
		id = 'guip_user_css';
	}
	if (!document.getElementById(id)) {
		document.head.insertAdjacentHTML('beforeend', '<style id="' + id + '" />');
	}
	document.getElementById(id).textContent = text;
};

GUIp.common.getCurrentGodname = function() {
	return GUIp.common.getGodnameFromCookies() || localStorage.getItem('eGUI_CurrentUser');
};

GUIp.common.getGodnameFromCookies = function() {
	var result = '',
		ca = worker.document.cookie.split(';');
	for (var i = 0, len = ca.length; i < len; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') {
			c = c.substring(1);
		}
		if (c.indexOf('gn=') === 0) {
			result = c.substring('gn='.length, c.length);
			try {
				result = JSON.parse(decodeURIComponent(result)).replace(/\+/g,' ');
				if (localStorage.getItem('eGUI_' + result + ':ForumSubscriptions') === null) {
					result = '';
				}
			} catch (e) {
				result = '';
			}
			break;
		}
	}
	return result;
};

GUIp.common.forceDesktopPage = function() {
	if (worker.navigator.userAgent.match(/Android/)) {
		worker.document.cookie = 'm_f=1';
		worker.document.cookie = 'm_pp=1';
		worker.document.cookie = 'm_fl=1';
		worker.document.cookie = 'm_n=1';
		var lnk = document.querySelector('a.dsk_mob, .m_switch a');
		if (lnk && lnk.href && lnk.href.match('/to_desktop')) {
			lnk.click();
			return;
		}
		if (lnk = document.querySelector('.lastduelpl_f > a.ui-link[onclick="to_desktop()"]')) {
			lnk.click();
			return;
		}
	}
};

GUIp.common.loadLocalScript = function(script) {
	var s = document['createElement']("script");
	s.src = '/javascripts/' + script;
	document.head.appendChild(s);
};

GUIp.common.loadSaverScript = function(service) {
	var s = document['createElement']("script");
	switch (service) {
		case 'gdvl.tk':
			s.src = '//gdvl.tk/send.js';
			break;
		case 'erinome.net':
			s.src = '//gv.erinome.net/processlog.js';
			break;
		case 'erinome.net.en':
			s.src = '//gvg.erinome.net/processlog.js';
			break;
		default:
			return;
	}
	document.head.appendChild(s);
};

GUIp.common.getXHR = function(path, success_callback, fail_callback, extra_arg) {
	GUIp.common.processXHR(path, 'GET', null, success_callback, fail_callback, extra_arg);
};
GUIp.common.postXHR = function(path, postdata, success_callback, fail_callback, extra_arg) {
	GUIp.common.processXHR(path, 'POST', postdata, success_callback, fail_callback, extra_arg);
};
GUIp.common.processXHR = function(path, method, data, success_callback, fail_callback, extra_arg) {
	var xhr = new XMLHttpRequest();
	if (extra_arg !== undefined) {
		xhr.extra_arg = extra_arg;
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState < 4) {
			return;
		} else if (xhr.status === 200) {
			if (success_callback) {
				success_callback(xhr);
			}
		} else if (fail_callback) {
			fail_callback(xhr);
		}
	};
	xhr.open(method, path, true);
	if (method === 'POST') {
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.send(data);
	} else {
		xhr.send();
	}
};

GUIp.common.playSound = function(sound) {
	var infosound;
	if (!(infosound = document.getElementById('infosound'))) {
		infosound = document.createElement("audio");
		infosound.id = 'infosound';
		document.body.appendChild(infosound);
	}
	if (!sound.match(/^data:/)) {
		if (sound === 'spar') {
			sound = 'challenge';
		}
		if (infosound.canPlayType("audio/mp3") !== '') {
			sound += '.mp3';
		} else if (infosound.canPlayType("audio/ogg") !== '') {
			sound += '.ogg';
		} else {
			sound += '.wav';
		}
		infosound.src = '/sounds/' + sound;
	} else {
		infosound.src = sound;
	}
	infosound.play();
};

GUIp.common.improveMap = function(mapID) {
	var i, j, ik, jk, len, chronolen = +worker.Object.keys(this.chronicles).reverse()[0],
		$boxML = document.querySelectorAll('#' + mapID + ' .dml'),
		$boxMC = document.querySelectorAll('#' + mapID + ' .dmc'),
		kRow = $boxML.length,
		kColumn = $boxML[0] && $boxML[0].children.length,
		MaxMap = 0,      	// count of pointers of any type
		MaxMapThermo = 0, // count of thermo pointers
		MapArray = [];
	if (!$boxML.length) {
		return;
	}
	for (i = 0; i < kRow; i++) {
		MapArray[i] = [];
		for (j = 0; j < kColumn; j++) {
			MapArray[i][j] = $boxMC[i * kColumn + j].textContent.match(/[?!@⚠]/) ? 0 : -1;
		}
	}
	var chamber = '✖';
	for (i = 1; i < chronolen; i++) {
		if (this.chronicles[i].chamber) {
			chamber = '';
			break;
		}
	}
	for (var si = 0; si < kRow; si++) {
		for (var sj = 0; sj < kColumn; sj++) {
			var ij, ttl = '',
				pointer = $boxMC[si * kColumn + sj].textContent,
				chronopointers = chronolen > 1 ? this.chronicles[chronolen].pointers : [];
			// replace exit sign. probably it should be done somewhere else
			if (pointer === '🚪') {
				$boxMC[si * kColumn + sj].classList.add('map_exit_pos_' + worker.GUIp_locale);
			}
			// check if current position has some directions in chronicle
			if (pointer.match(/@/) && chronopointers.length) {
				for (i = 0, len = chronopointers.length; i < len; i++) {
					switch (chronopointers[i]) {
						case 'north_east': ttl += '↗'; break;
						case 'north_west': ttl += '↖'; break;
						case 'south_east': ttl += '↘'; break;
						case 'south_west': ttl += '↙'; break;
						case 'north':      ttl += '↑'; break;
						case 'east':       ttl += '→'; break;
						case 'south':      ttl += '↓'; break;
						case 'west':       ttl += '←'; break;
						case 'freezing': ttl += '✵'; break;
						case 'cold':     ttl += '❄'; break;
						case 'mild':     ttl += '☁'; break;
						case 'warm':     ttl += '♨'; break;
						case 'hot':      ttl += '☀'; break;
						case 'burning':  ttl += '✺'; break;
					}
				}
				worker.console.log("[eGUI+] debug: current position has pointers: " + ttl);
			}
			if (pointer.match(/[←→↓↑↙↘↖↗⌊⌋⌈⌉∨<∧>]/) || ttl.match(/[←→↓↑↙↘↖↗]/)) {
				MaxMap++;
				$boxMC[si * kColumn + sj].style.color = 'green';
				// get directions from the arrows themselves, not relying on parsed chronicles
				if (!ttl.length) {
					switch (pointer) {
						case '⌊': ttl = '↑→'; break;
						case '⌋': ttl = '↑←'; break;
						case '⌈': ttl = '↓→'; break;
						case '⌉': ttl = '↓←'; break;
						case '∨': ttl = '↖↗'; break;
						case '<': ttl = '↗↘'; break;
						case '∧': ttl = '↙↘'; break;
						case '>': ttl = '↖↙'; break;
						default: ttl = pointer; break;
					}
				}
				for (ij = 0, len = ttl.length; ij < len; ij++){
					if (ttl[ij].match(/[→←↓↑↘↙↖↗]/)){
						for (ik = 0; ik < kRow; ik++) {
							for (jk = 0; jk < kColumn; jk++) {
								if (si == ik && sj == jk) {
									continue;
								}
								var istep = parseInt((Math.abs(jk - sj) - 1) / 5),
									jstep = parseInt((Math.abs(ik - si) - 1) / 5);
								if (ttl[ij].match(/[←→]/) && ik >= si - istep && ik <= si + istep ||
									ttl[ij] === '↓' && ik >= si + istep ||
									ttl[ij] === '↑' && ik <= si - istep ||
									ttl[ij].match(/[↙↘]/) && ik > si + istep ||
									ttl[ij].match(/[↖↗]/) && ik < si - istep) {
									if (ttl[ij] === '→' && jk >= sj + jstep ||
										ttl[ij] === '←' && jk <= sj - jstep ||
										ttl[ij].match(/[↓↑]/) && jk >= sj - jstep && jk <= sj + jstep ||
										ttl[ij].match(/[↘↗]/) && jk > sj + jstep ||
										ttl[ij].match(/[↙↖]/) && jk < sj - jstep) {
										if (MapArray[ik][jk] >= 0) {
											MapArray[ik][jk]+=1024;
										}
									}
								}
							}
						}
					}
				}
			}
			if (pointer.match(/[✺☀♨☁❄✵]/) || ttl.match(/[✺☀♨☁❄✵]/)) {
				MaxMapThermo++;
				$boxMC[si * kColumn + sj].style.color = 'green';
				// if we're standing on the pointer - use parsed value from chronicle
				if (ttl.length) {
					pointer = ttl;
				}
				var ThermoMinStep = 0;	// minimum steps to the treasury
				var ThermoMaxStep = 0;	// maximum steps to the treasury
				switch(pointer) {
					case '✺': ThermoMinStep = 1; ThermoMaxStep = 2; break;	//	✺ - очень горячо(1-2)
					case '☀': ThermoMinStep = 3; ThermoMaxStep = 5; break;	//	☀ - горячо(3-5)
					case '♨': ThermoMinStep = 6; ThermoMaxStep = 9; break;	//	♨ - тепло(6-9)
					case '☁': ThermoMinStep = 10; ThermoMaxStep = 13; break;	//	☁ - свежо(10-13)
					case '❄': ThermoMinStep = 14; ThermoMaxStep = 18; break;	//	❄ - холодно(14-18)
					case '✵': ThermoMinStep = 19; ThermoMaxStep = 100; break;	//	✵ - очень холодно(19)
				}
				//	thermo map data
				var MapData = {
					kColumn: kColumn,
					kRow: kRow,
					minStep: ThermoMinStep,
					maxStep: ThermoMaxStep,
					scanList: []
				};
				for (ik = -1; ik <= kRow; ik++) {
					for (jk = -1; jk <= kColumn; jk++) {
						if (ik < 0 || jk < 0 || ik === kRow || jk === kColumn) {
							MapData[ik + ':' + jk] = { explored: false, specway: false, scanned: false, wall: false, unknown: true };
							continue;
						}
						MapData[ik + ':' + jk] = {
							explored: $boxMC[ik * kColumn + jk].textContent.match(new worker.RegExp('[#?!⚠' + chamber + ']')) === null,
							specway: false,
							scanned: false,
							wall: $boxMC[ik * kColumn + jk].textContent.match(/#/),
							unknown: $boxMC[ik * kColumn + jk].textContent.match(/\?/)
						};
					}
				}
				// remove unknown marks from cells located near explored ones
				for (ik = 0; ik < kRow; ik++) {
					for (jk = 0; jk < kColumn; jk++) {
						if (MapData[ik + ':' + jk].explored) {
							for (i = -1; i <= 1; i++) {
								for (j = -1; j <= 1; j++) {
									if (MapData[(ik+i)+':'+(jk+j)]) { MapData[(ik+i) + ':' + (jk+j)].unknown = false; }
								}
							}
						}
					}
				}
				GUIp.common.mapIteration(MapData, si, sj, 0, false);
				for (ik = 0; ik < kRow; ik++) {
					for (jk = 0; jk < kColumn; jk++) {
						if (MapData[ik + ':' + jk].step < ThermoMinStep && MapData[ik + ':' + jk].explored && !MapData[ik + ':' + jk].specway) {
							MapData[ik + ':' + jk].scanned = true;
							MapData.scanList.push({i:ik, j:jk, lim:(ThermoMinStep - MapData[ik + ':' + jk].step)});
						}
					}
				}
				while (MapData.scanList.length) {
					var scanCell = MapData.scanList.shift();
					for (var cell in MapData) {
						if (MapData[cell].substep) {
							MapData[cell].substep = 0;
						}
					}
					GUIp.common.mapSubIteration(MapData, scanCell.i, scanCell.j, 0, scanCell.lim, false);
				}
				for (ik = ((si - ThermoMaxStep) > 0 ? si - ThermoMaxStep : 0); ik <= ((si + ThermoMaxStep) < kRow ? si + ThermoMaxStep : kRow - 1); ik++) {
					for (jk = ((sj - ThermoMaxStep) > 0 ? sj - ThermoMaxStep : 0); jk <= ((sj + ThermoMaxStep) < kColumn ? sj + ThermoMaxStep : kColumn - 1); jk++) {
						if (MapData[ik + ':' + jk].step >= ThermoMinStep & MapData[ik + ':' + jk].step <= ThermoMaxStep) {
							if (MapArray[ik][jk] >= 0) {
								MapArray[ik][jk]+=128;
							}
						} else if (MapData[ik + ':' + jk].step < ThermoMinStep && MapData[ik + ':' + jk].specway) {
							if (MapArray[ik][jk] >= 0) {
								MapArray[ik][jk]++;
							}
						}
					}
				}
			}
		}
	}
	if (MaxMap !== 0 || MaxMapThermo !== 0) {
		for (i = 0; i < kRow; i++) {
			for (j = 0; j < kColumn; j++) {
				if (MapArray[i][j] === 1024*MaxMap + 128*MaxMapThermo) {
					$boxMC[i * kColumn + j].style.color = ($boxMC[i * kColumn + j].textContent === '@') ? 'blue' : 'red';
				} else {
					for (ik = 0; ik < MaxMapThermo; ik++) {
						if (MapArray[i][j] === 1024*MaxMap + 128*ik + (MaxMapThermo - ik)) {
							$boxMC[i * kColumn + j].style.color = ($boxMC[i * kColumn + j].textContent === '@') ? 'blue' : 'darkorange';
						}
					}
				}
			}
		}
	}
};

GUIp.common.mapIteration = function(MapData, iPointer, jPointer, step, specway) {
	if (++step > MapData.maxStep) {
		return;
	}
	for (var iStep = -1; iStep <= 1; iStep++) {
		for (var jStep = -1; jStep <= 1; jStep++) {
			if (iStep !== jStep && (iStep === 0 || jStep === 0)) {
				var iNext = iPointer + iStep,
					jNext = jPointer + jStep;
				if (iNext >= -1 && iNext <= MapData.kRow && jNext >= -1 && jNext <= MapData.kColumn) {
					if (MapData[iNext + ':' + jNext] && !MapData[iNext + ':' + jNext].wall) {
						if (!MapData[iNext + ':' + jNext].step || MapData[iNext + ':' + jNext].step > step) {
							var tspecway = specway;
							if (MapData[iPointer + ':' + jPointer].unknown) {
								tspecway = true;
							}
							MapData[iNext + ':' + jNext].specway = tspecway;
							MapData[iNext + ':' + jNext].step = step;
							GUIp.common.mapIteration(MapData, iNext, jNext, step, tspecway);
						}
					}
				}
			}
		}
	}
};

GUIp.common.mapSubIteration = function(MapData, iPointer, jPointer, step, limit, specway) {
	step++;
	if (step >= limit || step > 3) {
		return;
	}
	for (var iStep = -1; iStep <= 1; iStep++) {
		for (var jStep = -1; jStep <= 1; jStep++) {
			if (iStep !== jStep && (iStep === 0 || jStep === 0)) {
				var iNext = iPointer + iStep,
					jNext = jPointer + jStep;
				if (iNext >= -1 && iNext <= MapData.kRow && jNext >= -1 && jNext <= MapData.kColumn) {
					if (!MapData[iNext + ':' + jNext].wall) {
						if (!MapData[iNext + ':' + jNext].substep || MapData[iNext + ':' + jNext].substep >= step) {
							var tspecway = specway;
							if (MapData[iPointer + ':' + jPointer].unknown) {
								tspecway = true;
							}
							if (MapData[iNext + ':' + jNext].explored && !MapData[iNext + ':' + jNext].scanned) {
								MapData[iNext + ':' + jNext].scanned = true;
								MapData.scanList.push({ i: iNext, j: jNext, lim: limit - step });
							}
							if (!MapData[iNext + ':' + jNext].explored && MapData[iNext + ':' + jNext].specway && (step < 3 || !tspecway)) {
								MapData[iNext + ':' + jNext].specway = false;
							}
							MapData[iNext + ':' + jNext].substep = step;
							GUIp.common.mapSubIteration(MapData, iNext, jNext, step, limit, tspecway);
						}
					}
				}
			}
		}
	}
};

GUIp.common.describeCell = function(currentCell, stepNum, stepMax, stepData, trapMoveLossCount, wormholeCell) {
	var mark_no, marks_length, steptext, lasttext, titlemod, titletext;
	if (!wormholeCell) {
		for (mark_no = 0, marks_length = stepData.marks.length; mark_no < marks_length; mark_no++) {
			currentCell.classList.add(stepData.marks[mark_no]);
		}
	}
	if (stepData.pointers.length && !currentCell.title.match(new worker.RegExp('^\\[' + worker.GUIp_i18n.map_pointer))) {
		currentCell.title = '[' + worker.GUIp_i18n.map_pointer + ': ' + worker.GUIp_i18n[stepData.pointers[0]] + (stepData.pointers[1] ? worker.GUIp_i18n.or + worker.GUIp_i18n[stepData.pointers[1]] : '') + ']';
	}
	steptext = GUIp.common.splitSentences(stepData.text);
	if (stepNum === 1) {
		steptext = stepData.text.split('\n');
		if (steptext.length > 2) {
			steptext = [steptext.slice(1,-1).join('\n')];
		} else {
			steptext = [steptext[0]];
		}
	} else if (stepNum === stepMax) {
		steptext = steptext.slice(1);
	} else if (stepData.marks.indexOf('boss') !== -1) {
		steptext = steptext.slice(1, -2);
	} else if (stepData.marks.indexOf('trapMoveLoss') !== -1 || trapMoveLossCount) {
		if (!trapMoveLossCount) {
			steptext = steptext.slice(1);
			trapMoveLossCount++;
		} else {
			steptext = steptext.slice(0, -1);
			trapMoveLossCount = 0;
		}
	} else {
		steptext = steptext.length > 2 ? steptext.slice(1, -1) : (steptext = GUIp.common.splitSentences(stepData.text,3), steptext.length > 2 ? steptext.slice(1, -1) : steptext.slice(0, -1));
	}
	steptext = steptext.join('').trim();
	if (currentCell.title.length) {
		titlemod = false;
		titletext = currentCell.title.split('\n');
		for (var i = 0, len = titletext.length; i < len; i++) {
			lasttext = titletext[i].match(/^(.*?) : (.*?)$/);
			if (lasttext && lasttext[2] === steptext) {
				titletext[i] = lasttext[1] + ', #' + stepNum + ' : ' + steptext;
				titlemod = true;
				break;
			}
		}
		if (!titlemod) {
			titletext.push('#' + stepNum + ' : ' + steptext);
		}
		currentCell.title = titletext.join('\n');
	} else {
		currentCell.title = '#' + stepNum + ' : ' + steptext;
	}
	return trapMoveLossCount;
};

GUIp.common.parseSingleChronicle = function(texts, infls, step) {
	if (!this.chronicles[step]) {
		this.chronicles[step] = { direction: null, marks: [], pointers: [], jumping: false, directionless: false, directionguess: null, wormhole: false, wormholedst: null, text: texts.join('\n').replace('&nbsp;',' '), infls: infls.join('\n') };
	}
	if (step <= 1) {
		return;
	}
	var i, len, j, len2, directionRegExp = /[^\w\-А-Яа-я](север|восток|юг|запад|north|east|south|west)(е|ward)?[^\w\-А-Яа-я]/i,
		chronicle = this.chronicles[step];
	for (j = 0, len2 = texts.length; j < len2; j++) {
		texts[j] = texts[j].replace(/offered to trust h.. gut feeling\./, '');
		for (i = 0, len = this.dungeonPhrases.length - 1; i < len; i++) {
			if (texts[j].match(this[this.dungeonPhrases[i] + 'RegExp']) && chronicle.marks.indexOf(this.dungeonPhrases[i]) === -1) {
				chronicle.marks.push(this.dungeonPhrases[i]);
			}
		}
		var stepSentences = GUIp.common.splitSentences(texts[j],3);
		var direction = stepSentences[0].match(directionRegExp);
		if (direction) {
			chronicle.direction = direction[1].toLowerCase();
		}
		chronicle.wormhole = chronicle.wormhole || !!texts[j].match(this.longJumpRegExp);
		chronicle.directionless = chronicle.directionless || !!stepSentences[0].match(/went somewhere|too busy bickering to hear in which direction to go next|The obedient heroes move in the named direction/);
		chronicle.jumping = chronicle.jumping || !!stepSentences[0].match(this.jumpingDungeonRegExp);
		if (texts[j].match(this.pointerMarkerRegExp)) {
			var middle = stepSentences.length > 2 ? stepSentences.slice(1,-1).join(' ') : stepSentences[1];
			var pointer, pointers = middle.match(this.pointerRegExp);
			if (pointers)
			for (i = 0, len = pointers.length; i < len; i++) {
				switch (pointers[i].replace(/^./, '')) {
				case 'северо-восток':
				case 'north-east': pointer = 'north_east'; break;
				case 'северо-запад':
				case 'north-west': pointer = 'north_west'; break;
				case 'юго-восток':
				case 'south-east': pointer = 'south_east'; break;
				case 'юго-запад':
				case 'south-west': pointer = 'south_west'; break;
				case 'север':
				case 'north': pointer = 'north'; break;
				case 'восток':
				case 'east': pointer = 'east'; break;
				case 'юг':
				case 'south': pointer = 'south'; break;
				case 'запад':
				case 'west': pointer = 'west'; break;
				case 'очень холодно':
				case 'very cold':
				case 'freezing': pointer = 'freezing'; break;
				case 'холодно':
				case 'cold': pointer = 'cold'; break;
				case 'свежо':
				case 'mild': pointer = 'mild'; break;
				case 'тепло':
				case 'warm': pointer = 'warm'; break;
				case 'горячо':
				case 'hot': pointer = 'hot'; break;
				case 'очень горячо':
				case 'very hot':
				case 'burning': pointer = 'burning'; break;
				}
				if (chronicle.pointers.indexOf(pointer) === -1) {
					chronicle.pointers.push(pointer);
				}
			}
		}
	}
	if (chronicle.directionless && infls.length === 1 && infls[0].match(directionRegExp)) {
		chronicle.directionguess = infls[0].match(directionRegExp)[1].toLowerCase();
	}
};

GUIp.common.calculateDirectionlessMove = function(target, initCoords, initStep) {
	var i, len, j, len2, coords = { x: initCoords.x, y: initCoords.y },
		dmap = document.querySelectorAll(target + ' .dml'),
		heroesCoords = GUIp.common.calculateXY(GUIp.common.getOwnCell()),
		steps = worker.Object.keys(this.chronicles),
		directionless = 0,
		whstep = -1;
	worker.console.log('[eGUI+] debug: going to calculate directionless moves from step #'+initStep);
	for (i = initStep, len = steps.length; i <= len; i++) {
		if (this.chronicles[i].wormhole && this.chronicles[i].wormholedst === null) {
			whstep = i;
			break;
		}
		if (this.chronicles[i].directionless) {
			directionless++;
		}
		GUIp.common.moveCoords(coords, this.chronicles[i]);
	}
	var variations = GUIp.common.getAllRPerms('nesw'.split(''),directionless);
	for (i = 0, len = variations.length; i < len; i++) {
		coords = { x: initCoords.x, y: initCoords.y };
		directionless = 0;
		for (j = initStep, len2 = steps.length; j <= len2; j++) {
			if (this.chronicles[j].directionless) {
				GUIp.common.moveCoords(coords, { direction: this.corrections[variations[i][directionless]] });
				directionless++;
			} else {
				GUIp.common.moveCoords(coords, this.chronicles[j]);
			}
			if (!dmap[coords.y] || !dmap[coords.y].children[coords.x] || dmap[coords.y].children[coords.x].textContent.match(/#|!|\?/)) {
				break;
			}
			if (whstep === j && dmap[coords.y].children[coords.x].textContent.match(/~/)) {
				worker.console.log('[eGUI+] debug: found result + wh: '+variations[i].join());
				return variations[i].join('');
			}
		}
		if (heroesCoords.x - coords.x === 0 && heroesCoords.y - coords.y === 0) {
			worker.console.log('[eGUI+] debug: found result: '+variations[i].join());
			return variations[i].join('');
		}
	}
	worker.console.log('[eGUI+] error: combo not found!');
	return '';
};

GUIp.common.calculateWormholeMove = function(target, initCoords, initStep) {
	var i, m, n, len, coords = { x: initCoords.x, y: initCoords.y },
		corrections = '',
		corrections_idx = 0,
		dmap = document.querySelectorAll(target + ' .dml'),
		heroesCoords = GUIp.common.calculateXY(GUIp.common.getOwnCell()),
		steps = worker.Object.keys(this.chronicles),
		result = [],
		subresult = [];
	worker.console.log('[eGUI+] debug: going to calculate wormhole jump target from step #' + initStep + ' at [' + initCoords.y + ',' + initCoords.x + ']');
	loopY:
	for (m = -8; m <= 8; m++) {
		loopX:
		for (n = -8; n <= 8; n++) {
			if (Math.abs(m) + Math.abs(n) < 2 || Math.abs(m) + Math.abs(n) > 10) {
				continue loopX;
			}
			if (!dmap[initCoords.y + m] || !dmap[initCoords.y + m].children[initCoords.x + n] || dmap[initCoords.y + m].children[initCoords.x + n].textContent.match(/#|!|\?/)) {
				continue loopX;
			}
			coords.x = initCoords.x + n;
			coords.y = initCoords.y + m;
			loopTracing:
			for (i = initStep+1, len = steps.length; i <= len; i++) {
				if (!this.chronicles[i].directionless) {
					GUIp.common.moveCoords(coords, this.chronicles[i]);
				} else {
					if (!corrections[corrections_idx]) {
						corrections_idx = 0;
						corrections = GUIp.common.calculateDirectionlessMove.call(this, target, coords, i);
					}
					GUIp.common.moveCoords(coords, {direction: this.corrections[corrections[corrections_idx++]]});
				}
				if (!dmap[coords.y] || !dmap[coords.y].children[coords.x] || dmap[coords.y].children[coords.x].textContent.match(/#|!|\?/)) {
					continue loopX;
				}
				if (this.chronicles[i].wormhole) {
					if (!dmap[coords.y].children[coords.x].textContent.match(/~/)) {
						continue loopX;
					}
					subresult = GUIp.common.calculateWormholeMove.call(this, target, {y: coords.y, x: coords.x}, i);
					if (subresult.length) {
						result = result.concat([[m,n]],subresult);
						break loopY;
					} else {
						continue loopX;
					}
				}
				if (i === len && coords.y === heroesCoords.y && coords.x === heroesCoords.x) {
					result = [[m,n]];
					break loopY;
				}
			}
		}
	}
	return result;
};

GUIp.common.calculateWormholeMove2 = function(target, initCoords, initStep) {
	var i, m, n, len, coords = { x: 0, y: 0 }, coords2 = { x: 0, y: 0 },
		dmap = document.querySelectorAll(target + ' .dml'),
		steps = worker.Object.keys(this.chronicles),
		subresult = [],
		result = [];
	worker.console.log('[eGUI+] debug: going to calculate wormhole jump target from step #' + initStep + ' at [' + initCoords.y + ',' + initCoords.x + '] (v2)');
	for (i = initStep+1, len = steps.length; i <= len; i++) {
		if (this.chronicles[i].directionless) {
			return GUIp.common.calculateWormholeMove.call(this, target, initCoords, initStep);
		}
		GUIp.common.moveCoords(coords, this.chronicles[i]);
		if (this.chronicles[i].wormhole) {
			break;
		}
	}
	loopY:
	for (m = -8; m <= 8; m++) {
		loopX:
		for (n = -8; n <= 8; n++) {
			if (Math.abs(m) + Math.abs(n) < 2 || Math.abs(m) + Math.abs(n) > 10) {
				continue loopX;
			}
			if (!dmap[initCoords.y + m] || !dmap[initCoords.y + m].children[initCoords.x + n] || dmap[initCoords.y + m].children[initCoords.x + n].textContent.match(/#|!|\?/)) {
				continue loopX;
			}
			coords2.x = initCoords.x + coords.x + n;
			coords2.y = initCoords.y + coords.y + m;
			if (!dmap[coords2.y] || !dmap[coords2.y].children[coords2.x]) {
				continue;
			}
			if (this.chronicles[i] && this.chronicles[i].wormhole) {
				if (!dmap[coords2.y].children[coords2.x].textContent.match(/~/)) {
					continue loopX;
				}
				subresult = GUIp.common.calculateWormholeMove2.call(this, target, {y: coords2.y, x: coords2.x}, i > len ? len : i);
				if (subresult.length) {
					result = result.concat([[m,n]],subresult);
					break loopY;
				} else {
					continue loopX;
				}
			}
			if (i === len+1 && dmap[coords2.y].children[coords2.x].textContent.match(/@/)) {
				result = [[m,n]];
				break loopY;
			}
		}
	}
	return result;
};

GUIp.common.moveCoords = function(coords, chronicle, direction) {
	direction = direction || 1;
	if (chronicle.direction) {
		var step = chronicle.jumping ? 2 : 1;
		step *= direction;
		switch(chronicle.direction) {
		case 'север':
		case 'north': coords.y -= step; break;
		case 'восток':
		case 'east': coords.x += step; break;
		case 'юг':
		case 'south': coords.y += step; break;
		case 'запад':
		case 'west': coords.x -= step; break;
		}
	}
};

GUIp.common.getOwnCell = function() {
	var cells = document.querySelectorAll('.dml .dmc');
	for (var i = 0, len = cells.length; i < len; i++) {
		if (cells[i].textContent.trim() === '@') {
			return cells[i];
		}
	}
	return null;
}

GUIp.common.calculateXY = function(cell) {
	var coords = {};
	if (cell) {
		coords.x = GUIp.common.getNodeIndex(cell);
		coords.y = GUIp.common.getNodeIndex(cell.parentNode);
	}
	return coords;
};

GUIp.common.calculateExitXY = function() {
	var exit_coords = { x: null, y: null },
		cells = document.querySelectorAll('.dml .dmc');
	for (var i = 0, len = cells.length; i < len; i++) {
		if (cells[i].textContent.trim().match(/В|E|🚪/)) {
			exit_coords = GUIp.common.calculateXY(cells[i]);
			break;
		}
	}
	if (!exit_coords.x) {
		if (GUIp.common.getOwnCell()) {
			exit_coords = GUIp.common.calculateXY(GUIp.common.getOwnCell());
		}
	}
	return exit_coords;
};

GUIp.common.getNodeIndex = function(node) {
	var i = 0;
	while ((node = node.previousElementSibling)) {
		i++;
	}
	return i;
};

GUIp.common.getRPerms = function(array, size, initialStuff, output) {
	if (initialStuff.length >= size) {
		output.push(initialStuff);
	} else {
		for (var i = 0; i < array.length; ++i) {
			GUIp.common.getRPerms(array, size, initialStuff.concat(array[i]), output);
		}
	}
};

GUIp.common.getAllRPerms = function(array, size) {
	var output = [];
	GUIp.common.getRPerms(array, size, [], output);
	return output;
};

GUIp.common.splitSentences = function(text, expectedMinimalLength) {
	var result = GUIp.common.splitSentencesInt(text);
	if (expectedMinimalLength && result.length < expectedMinimalLength) {
		return GUIp.common.splitSentencesInt(text,true)
	}
	return result;
}

GUIp.common.splitSentencesInt = function(text, splitQuoted) {
	var letter, buffer = '',
		end = false,
		nested = false,
		colond = false,
		result = [];
	for (var i = 0, len = text.length; i < len; i++) {
		letter = text[i];
		switch (letter) {
			case '“':
			case '«':
				nested = true;
				buffer += letter;
				break;
			case '”':
			case '»':
				if (colond || (splitQuoted && result.length > 0)) {
					end = true;
				}
				nested = false;
				buffer += letter;
				break;
			case '.':
			case '!':
			case '?':
				if (!nested) {
					end = true;
				}
				buffer += letter;
				break;
			case ':':
				colond = true;
				buffer += letter;
				break;
			case '\n':
			case ' ':
				if (end && buffer.substr(-3) === '...') {
					end = false;
				}
				if (end) {
					result.push(buffer + letter);
					buffer = '';
					end = false;
					nested = false;
					colond = false;
				} else if (buffer.length > 0) {
					buffer += letter;
				}
				break;
			default:
				buffer += letter;
		}
	}
	if (buffer.length) {
		result.push(buffer);
	}
	if (!result.length) {
		result.push(text);
	}
	return result;
};

GUIp.common.formatTime = function(date, dtype) {
	var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	if (dtype === 'fakejson') {
		return ((new Date(date - date.getTimezoneOffset() * 60000)).toJSON() || '-').substring(0,19) + 
			(date.getTimezoneOffset() < 0 ? '+' : '-') + 
			('0' + Math.floor(Math.abs(date.getTimezoneOffset()) / 60)).slice(-2) + ':' + 
			('0' + Math.floor(Math.abs(date.getTimezoneOffset()) % 60)).slice(-2);
	} else if (dtype === 'forum') {
		var offset = (Date.now() - date) / 60000;
		if (offset < 60) {
			if (offset < 1) {
				offset++;
			}
			return Math.ceil(offset) + ' ' + (offset > 1 ? worker.GUIp_i18n.format_time_minutes : worker.GUIp_i18n.format_time_minute) + ' ' + worker.GUIp_i18n.format_time_ago;
		} else if (offset < 1440) {
			return Math.ceil(offset / 60) + ' ' + (offset / 60 > 1 ? worker.GUIp_i18n.format_time_hours : worker.GUIp_i18n.format_time_hour) + ' ' + worker.GUIp_i18n.format_time_ago;
		} else {
			if (worker.GUIp_locale === 'ru') {
				if (offset < 2880) {
					return 'вчера';
				} else if (offset < 4320) {
					return '2 дня назад';
				} else {
					return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
				}
			} else {
				if (offset < 2880) {
					return '1 day ago';
				} else if (offset < 4320) {
					return '2 days ago';
				} else {
					var hpost = false,
						hours = date.getHours();
					if (hours > 11) {
						hours -= 12;
						hpost = true;
					}
					if (hours < 1) {
						hours = 12;
					}
					return months[date.getMonth()] + ' ' + date.getDate() + ',' + date.getFullYear() + ' ' + hours + ':' + date.getMinutes() + (hpost ? 'pm' : 'am');
				}
			}
		}
	} else if (dtype === 'logger') {
		if (worker.GUIp_locale === 'ru') {
			return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear();
		} else {
			return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
		}
	} else if (dtype === 'simpletime') {
		return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
	} else if (dtype === 'fulltime') {
		return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
	} else {
		return ('0' + date.getDate()).slice(-2) + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + date.getFullYear() + ', ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
	}
};

GUIp.common.setPageBackground = function(background) {
	if (background === 'cloud') {
		if (worker.GUIp_browser !== 'Opera') {
			document.body.style.backgroundImage = 'url(' + worker.GUIp_getResource('images/background.jpg') + ')';
		} else {
			worker.GUIp_getResource('images/background.jpg',document.body);
		}
	} else {
		document.body.style.backgroundImage = background ? 'url(' + background + ')' : '';
	}
};

GUIp.common.cleanComboData = function(str) {
	return str.replace(/[^A-Za-zА-Яа-я]+/g,'').toLowerCase();
};

GUIp.common.checkExprData = function(str) {
	var tree, result;
	try {
		tree = worker.jsep(str);
	} catch (e) {
		worker.alert(worker.GUIp_i18n.custom_informers_error + ': ' + str);
		return false;
	}
	try {
		result = GUIp.common.checkExpr(tree);
	} catch (e) {
		if (e.type) {
			worker.alert(worker.GUIp_i18n.custom_informers_error + ':\n' + str + '\n\n' + worker.GUIp_i18n['custom_informers_error_' + e.type] + ' "' + e.content + '"!');
		} else {
			worker.alert(worker.GUIp_i18n.custom_informers_error + ':\n' + str + '\n\n[' + e + ']');
		}
		return false;
	}
	return true;
};

GUIp.common.checkExpr = function(expr) {
	var fn, arg1, arg2;
	var expressions = ['&&', '||', '+', '-', '*', '/', '==', '!=', '>', '>=', '<', '<=', '!', '~', '~*'];
	switch (expr.type)
	{
		case 'LogicalExpression':
		case 'BinaryExpression':
		case 'UnaryExpression':
			if (expr.argument) {
				GUIp.common.checkExpr(expr.argument);
			} else {
				GUIp.common.checkExpr(expr.left);
				GUIp.common.checkExpr(expr.right);
			};
			if (expressions.indexOf(expr.operator) < 0) {
				throw {type: 'operator', content: expr.operator};
			}
			break;
		case 'MemberExpression':
			GUIp.common.checkExpr(expr.object), GUIp.common.checkExpr(expr.property);
			break;
		case 'CallExpression':
			GUIp.common.checkExpr(expr.callee);
			for (var i = 0, len = expr.arguments.len; i < len; i++) {
				GUIp.common.checkExpr(expr.arguments[i]);
			}
			break;
		case 'Identifier':
		case 'Literal':
			break;
		default:
			throw {type: 'expression', content: expr.type};
	}
};

GUIp.common.createLightbox = function(lbType,storage,def,callback) {
	var inheight, inwidth, sortable,
		lightbox = document.createElement("div"),
		dimmer = document.createElement("div");

	lightbox.id = 'optlightbox';
	lightbox.className = 'e_bl_cell block';
	dimmer.id = 'optdimmer';

	lightbox.innerHTML = '		<div id="lightbox_title" style="font-weight: bold;"></div>' +
'		<div class="bl_content" style="text-align: center;">' +
'			<div id="lightbox_desc" class="e_new_line"></div>' +
'			<div id="lightbox_table" class="e_new_line" >' +
'			</div><div>' +
'			<input id="lightbox_add" class="input_btn" type="button" value="' + worker.GUIp_i18n.lb_add + '">' +
'			<input id="lightbox_save" class="input_btn" type="submit" value="' + worker.GUIp_i18n.lb_save + '" disabled>' +
'			<input id="lightbox_reset" class="input_btn" type="button" value="' + worker.GUIp_i18n.lb_reset + '" disabled>' +
'			<input id="lightbox_import" class="input_btn" type="button" value="' + worker.GUIp_i18n.import + '">' +
'			<input id="lightbox_export" class="input_btn" type="button" value="' + worker.GUIp_i18n.export + '" disabled>' +
'			<input id="lightbox_close" class="input_btn" type="button" value="' + worker.GUIp_i18n.lb_close + '">' +
'			</div><div id="lightbox_ieblock" class="hidden"><span id="lightbox_iedesc"></span> <input id="lightbox_iefield" type="text" size="30" value=""> <input id="lightbox_iebutton" type="button" value="OK"></div>' +
'		</div>';

	document.body.appendChild(lightbox);
	document.body.appendChild(dimmer);

	var reloadSortables = function() {
		if (sortable) {
			sortable.destroy();
		}
		sortable = GUIp.common.sortable({els: '.lightbox_row', onDrop: function() { document.getElementById('lightbox_save').disabled = false; }});
	};

	var prepareLightboxInputValue = function(value) {
		return value ? ('' + value).replace(/&/g, '&amp;').replace(/'/g, '&apos;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
	};

	var addLightboxRow = function(lbType, lbData, wantedPositioning) {
		var i, len, inputs, lbRow, lbTable = document.getElementById('lightbox_table');
		lbRow = '<div class="lightbox_row"><span class="e_dragging" draggable="true">☰</span>';
		switch (lbType) {
			case 'pets':
				lbRow += '<input type="checkbox"' + (lbData.q ? '' : ' checked') + ' title="' + worker.GUIp_i18n.lb_enable + '"> <input type="text" size="20" value="' + prepareLightboxInputValue(lbData.name) + '"> <input type="text" size="3" value="' + prepareLightboxInputValue(lbData.min_level) + '"> <input type="text" size="3" value="' + prepareLightboxInputValue(lbData.max_level) + '">';
				break;
			case 'ally_blacklist':
				lbRow += '<input type="checkbox"' + (lbData.q ? '' : ' checked') + ' title="' + worker.GUIp_i18n.lb_enable + '"> <input type="text" size="15" value="' + prepareLightboxInputValue(lbData.n) + '"> <input type="text" size="25" value="' + prepareLightboxInputValue(lbData.r) + '"> <input type="text" size="10" value="' + prepareLightboxInputValue(lbData.s) + '">';
				break;
			case 'custom_craft':
				lbRow += '<input type="checkbox"' + (lbData.q ? '' : ' checked') + ' title="' + worker.GUIp_i18n.lb_enable + '"> <input type="text" size="7" value="' + prepareLightboxInputValue(lbData.t) + '"> <input type="text" size="20" value="' + prepareLightboxInputValue(lbData.d) + '"> <input type="text" size="7" value="' + prepareLightboxInputValue(lbData.l) + '"> <input type="text" size="7" value="' + prepareLightboxInputValue(lbData.g) + '">';
				break;
			case 'custom_informers':
				lbRow += '<input type="checkbox"' + (lbData.q ? '' : ' checked') + ' title="' + worker.GUIp_i18n.lb_enable + '"> <input type="text" size="12" value="' + prepareLightboxInputValue(lbData.title) + '"> <input type="text" size="55" value="' + prepareLightboxInputValue(lbData.expr) + '"> <input type="text" size="4" value="' + prepareLightboxInputValue(lbData.type) + '">';
				break;
			default:
				lbRow += '<input type="text" size="30" value="' + (typeof lbData === 'object' ? '' : prepareLightboxInputValue(lbData)) + '">';
				break;
		}
		lbRow += ' <input type="button" value="[x]"></div>';
		lbTable.insertAdjacentHTML('beforeend',lbRow);
		inputs = lbTable.querySelectorAll('input[type="button"]:not(.improved)');
		for (i = 0, len = inputs.length; i < len; i++) {
			inputs[i].onclick = function() { removeLightboxRow(this); changedLightbox(); };
			inputs[i].classList.add('improved');
		}
		inputs = lbTable.querySelectorAll('input:not(.improved)');
		for (i = 0, len = inputs.length; i < len; i++) {
			inputs[i].onchange = inputs[i].oninput = function() { changedLightbox(); }
			inputs[i].classList.add('improved');
		}
	};
	
	var removeLightboxRow = function(input) {
		var lbTable = document.getElementById('lightbox_table');
		lbTable.removeChild(input.parentNode);
		reloadSortables();
	};

	var setLightboxTA = function(lbType, lbData) {
		var i, len, last, lbTable = document.getElementById('lightbox_table');
		while (last = lbTable.lastChild) {
			lbTable.removeChild(last);
		}
		for (i = 0, len = lbData.length; i < len; i++) {
			addLightboxRow(lbType, lbData[i]);
		}
		if (len === 0) {
			addLightboxRow(lbType, {});
		}
		reloadSortables();
	};

	var loadLightbox = function(lbType) {
		var lbData = storage.get('CustomWords:' + lbType);
		if (lbData && lbData !== "") {
			try {
				lbData = JSON.parse(lbData);
			} catch (error) {
				lbData = [];
			}
			setLightboxTA(lbType,lbData);
			document.getElementById('lightbox_reset').disabled = false;
			document.getElementById('lightbox_export').disabled = false;
		} else {
			setLightboxTA(lbType,def[lbType] || []);
		}
	};

	var saveLightbox = function(lbType) {
		var i, len, items, parsed = [], lbItems, lbTable = document.getElementById('lightbox_table');
		lbItems = lbTable.querySelectorAll('input[type="checkbox"],input[type="text"]');
		for (i = 0, len = lbItems.length; i < len; i++) {
			switch (lbType) {
				case 'pets':
					items = [lbItems[i+1].value,lbItems[i+2].value,lbItems[i+3].value].map(function(s) { return s.trim(); });
					if (items[0].length && !isNaN(parseInt(items[1]))) {
						if (!isNaN(parseInt(items[2])) || items[2].toLowerCase() === 'infinity') {
							parsed.push({q: !lbItems[i].checked, name: items[0], min_level: parseInt(items[1]), max_level: (items[2].toLowerCase() === 'infinity' ? 'Infinity' : parseInt(items[2]))});
						} else {
							parsed.push({q: !lbItems[i].checked, name: items[0], min_level: parseInt(items[1])});
						}
					}
					i += 3;
					break;
				case 'ally_blacklist':
					items = [lbItems[i+1].value,lbItems[i+2].value,lbItems[i+3].value].map(function(s) { return s.trim(); });
					if (items[0].length) {
						parsed.push({q: !lbItems[i].checked, n: items[0], r: (items[1] || ''), s: (items[2] || '')});
					}
					i += 3;
					break;
				case 'custom_craft':
					items = [lbItems[i+1].value,lbItems[i+2].value,lbItems[i+3].value,lbItems[i+4].value].map(function(s) { return s.toLowerCase().trim(); });
					if (items[0].length && items[1].length && GUIp.common.cleanComboData(items[2]) && GUIp.common.cleanComboData(items[3])) {
						parsed.push({q: !lbItems[i].checked, i: i, t: items[0], d: items[1], l: GUIp.common.cleanComboData(items[2]), g: GUIp.common.cleanComboData(items[3])});
					}
					i += 4;
					break;
				case 'custom_informers':
					items = [lbItems[i+1].value,lbItems[i+2].value,lbItems[i+3].value].map(function(s) { return s.trim(); });
					if (items[0].length && items[1].length) {
						var type = parseInt(items[2]) || 0;
						if (lbItems[i].checked && !GUIp.common.checkExprData(items[1])) {
							return;
						}
						for (var j = 0, len2 = parsed.length; j < len2; j++) {
							if (parsed[j].title === items[0]) {
								worker.alert(worker.GUIp_i18n.custom_informers_error_duplicated);
								return;
							}
						}
						parsed.push({q: !lbItems[i].checked, title: items[0], expr: items[1], type: type});
						i += 3;
					}
					break;
				default:
					items = lbItems[i].value.toLowerCase().trim();
					if (items.length > 0) {
						parsed.push(items);
					}
			}
		}
		if (parsed.length) {
			storage.set('CustomWords:' + lbType, JSON.stringify(parsed));
			setLightboxTA(lbType,parsed);
			document.getElementById('lightbox_save').disabled = true;
			document.getElementById('lightbox_export').disabled = false;
			if (callback) { callback(); }
		} else {
			resetLightbox(lbType,true); // TODO: show error of some kind instead of silently resetting
		}
	};

	var resetLightbox = function(lbType,forced) {
		if (!forced && !worker.confirm(worker.GUIp_i18n.lb_reset_confirm)) {
			return;
		}
		setLightboxTA(lbType,def[lbType] || []);
		storage.remove('CustomWords:' + lbType);
		document.getElementById('lightbox_save').disabled = true;
		document.getElementById('lightbox_reset').disabled = true;
		document.getElementById('lightbox_export').disabled = true;
		if (callback) { callback(); }
	};

	var importLightboxData = function(lbType) {
		document.getElementById('lightbox_iefield').value = '';
		document.getElementById('lightbox_iedesc').textContent = worker.GUIp_i18n.import_prompt;
		document.getElementById('lightbox_iebutton').classList.remove('hidden');
		document.getElementById('lightbox_ieblock').classList.remove('hidden');
		lightbox.classList.add('lightbox_expanded');
	};
	
	var importLightboxDataProcess = function(lbType) {
		var line = document.getElementById('lightbox_iefield').value;
		if (line && JSON.parse(line)) {
			storage.set('CustomWords:' + lbType, line);
			setLightboxTA(lbType,JSON.parse(line));
			document.getElementById('lightbox_save').disabled = false;
			worker.alert(worker.GUIp_i18n.import_success);
			document.getElementById('lightbox_ieblock').classList.add('hidden');
			lightbox.classList.remove('lightbox_expanded');
		} else {
			worker.alert(worker.GUIp_i18n.import_fail);
		}
	};

	var exportLightboxData = function(lbType) {
		var line = storage.get('CustomWords:' + lbType);
		if (line && JSON.parse(line)) {
			document.getElementById('lightbox_iefield').value = line;
			document.getElementById('lightbox_iedesc').textContent = worker.GUIp_i18n.export_prompt;
			document.getElementById('lightbox_iebutton').classList.add('hidden');
			document.getElementById('lightbox_ieblock').classList.remove('hidden');
			lightbox.classList.add('lightbox_expanded');
		}
	};

	var changedLightbox = function(lbType) {
		document.getElementById('lightbox_save').disabled = false;
		document.getElementById('lightbox_reset').disabled = false;
	};

	document.getElementById('lightbox_title').textContent = worker.GUIp_i18n['lb_' + lbType + '_title'];
	document.getElementById('lightbox_desc').innerHTML = worker.GUIp_i18n['lb_' + lbType + '_desc'];

	loadLightbox(lbType);

	inheight = Math.max(worker.innerHeight * 0.7,400);
	inwidth = (lbType === 'custom_informers' ? 800 : 600);

	lightbox.style.width = inwidth + 'px';
	lightbox.style.height = inheight + 'px';

	lightbox.style.visibility = 'visible';
	lightbox.style.left = worker.innerWidth/2 - (inwidth / 2) + 'px';
	lightbox.style.top = worker.innerHeight/2 - (inheight / 2) + window.scrollY + 'px';

	document.getElementById('lightbox_table').style.overflowY = 'scroll';
	document.getElementById('lightbox_table').style.height = (inheight - 125) + 'px';

	var scrollLightbox = function() {
		lightbox.style.left = worker.innerWidth/2 - (inwidth / 2) + 'px';
		lightbox.style.top = worker.innerHeight/2 - (inheight / 2) + window.scrollY + 'px';
	};
	var destroyLightbox = function() {
		document.body.removeChild(dimmer);
		document.body.removeChild(lightbox);
		document.removeEventListener('scroll', scrollLightbox);
	};
	document.addEventListener('scroll', scrollLightbox);
	document.getElementById('lightbox_iebutton').onclick = function() { importLightboxDataProcess(lbType); };
	document.getElementById('lightbox_add').onclick = function() { addLightboxRow(lbType,{},true); reloadSortables(); };
	document.getElementById('lightbox_save').onclick = saveLightbox.bind(null,lbType);
	document.getElementById('lightbox_reset').onclick = resetLightbox.bind(null,lbType,false);
	document.getElementById('lightbox_import').onclick = importLightboxData.bind(null,lbType);
	document.getElementById('lightbox_export').onclick = exportLightboxData.bind(null,lbType);
	document.getElementById('lightbox_close').onclick = dimmer.onclick = destroyLightbox.bind(null);
	return false;
};

GUIp.common.sortable = function(options) {
	var dragEl, type, sortables, overClass, movingClass;
	function handleDragStart(e) {
		e.dataTransfer.effectAllowed = 'move';
		dragEl = this;
		// this/e.target is the source node.
		this.classList.add(movingClass);
		e.dataTransfer.setDragImage(this, 0, 0);
		e.dataTransfer.setData('text/html', this.innerHTML);
		options.onDragStart && options.onDragStart(e);
	}
	function handleDragOver(e) {
		if (e.preventDefault) {
			e.preventDefault(); // Allows us to drop.
		}
		e.dataTransfer.dropEffect = 'move';
		options.onDragOver && options.onDragOver(e);
		return false;
	}
	function handleDragEnter() {
		this.classList.add(overClass);
		options.onDragEnter && options.onDragEnter(e);
	}
	function handleDragLeave() {
		// this/e.target is previous target element.
		this.classList.remove(overClass);
		options.onDragLeave && options.onDragLeave(e);
	}
	function handleDrop(e) {
		var dropParent, dropIndex, dragIndex;
		// this/e.target is current target element.
		if (e.stopPropagation) {
			e.stopPropagation(); // stops the browser from redirecting.
		}
		if (dragEl !== this) {
			dragEl.innerHTML = this.innerHTML;
    	this.innerHTML = e.dataTransfer.getData('text/html');
    	options.onDrop && options.onDrop(e);
		}
		dragEl = null;
		return false;
	}
	function handleDragEnd() {
		for (var i = 0, len = sortables.length; i < len; i++) {
			sortables[i].classList.remove(overClass, movingClass);
		}
		options.onDragEnd && options.onDragEnd(e);
	}
	function destroy() {
		for (var i = 0, len = sortables.length; i < len; i++) {
			modifyListeners(sortables[i], false, true);
		}
		sortables = null;
		dragEl = null;
	}
	function modifyListeners(el, isAdd, flag) {
		var addOrRemove = isAdd ? 'add' : 'remove';
		el[addOrRemove + 'EventListener']('dragstart', handleDragStart);
		el[addOrRemove + 'EventListener']('dragenter', handleDragEnter);
		el[addOrRemove + 'EventListener']('dragover', handleDragOver);
		el[addOrRemove + 'EventListener']('dragleave', handleDragLeave);
		if (flag) {
			el[addOrRemove + 'EventListener']('drop', handleDrop);
			el[addOrRemove + 'EventListener']('dragend', handleDragEnd);
		}
	}
	function init() {
		sortables = Array.prototype.slice.call(document.querySelectorAll(options.els));
		type = options.type || 'insert'; // insert or swap
		overClass = options.overClass || 'sortable-over';
		movingClass = options.movingClass || 'sortable-moving';
		for (var i = 0, len = sortables.length; i < len; i++) {
			modifyListeners(sortables[i], true, true);
		}
	}
	init();
	return {
		destroy: destroy
	};
};

GUIp.common.islandsMapScan = function() {
	var i, j, k, data, cell,
		rlimit = this.islandsMapRadius || this.islandsMapConds.match('small') && 15 || 22;
	this.islandsMapDataParsed = {};
	for (i = -rlimit; i <= rlimit; i++) {
		for (j = i - rlimit; j <= rlimit; j++) {
			k = i - j;
			if (j < -rlimit || k < -rlimit) continue;
			this.islandsMapDataParsed[j+':'+k+':'+(-i)] = null;
		}
	}
	for (var i = 0, len = this.islandsMapData.length; i < len; i++) {
		data = GUIp.common.lb2array(this.islandsMapData[i]);
		this.islandsMapDataParsed[data[0]+':'+data[1]+':'+data[2]] = data[3];
	}
};

GUIp.common.islandsMapModify = function(addBorders,addUndiscovered) {
	var data, value, keys = Object.keys(this.islandsMapDataParsed),
		rlimit = this.islandsMapRadius || this.islandsMapConds.match('small') && 15 || 22;
	for (var i = 0, len = keys.length; i < len; i++) {
		value = this.islandsMapDataParsed[keys[i]];
		if (value === null) {
			data = keys[i].split(':');
			if (addUndiscovered || addBorders && (Math.abs(+data[0]) === rlimit || Math.abs(+data[1]) === rlimit || Math.abs(+data[2]) === rlimit)) {
				this.islandsMapDataParsed[keys[i]] = 63;
				this.islandsMapData.push(GUIp.common.array2lb([+data[0], +data[1], +data[2], 63]));
			}
		}
	}
};

GUIp.common.islandsMapSearchData = function(tileData, single) {
	var cmp = 0, mask = 0, mul = [1, 256, 65536, 16777216];
	var res = single ? null : [];
	for (var i = 0; i < 4; i++) {
		if (tileData[i] !== undefined) {
			mask += 255 * mul[i];
			cmp += ((tileData[i] < 0 ? tileData[i] + 256 : tileData[i]) * mul[i]);
		}
	}
	for (var i = 0, len = this.islandsMapData.length; i < len; i++) {
		if ((this.islandsMapData[i] & mask) === cmp) {
			if (single) {
				return this.islandsMapData[i];
			}
			res.push(this.islandsMapData[i]);
		}
	}
	return res;
};

GUIp.common.islandsMapSearchData_multi = function(tileData, position) {
	var mask, res = [], mul = [1, 256, 65536, 16777216];
	mask = 255 * mul[position];
	for (var i = 0, len = this.islandsMapData.length; i < len; i++) {
		if (tileData.indexOf((this.islandsMapData[i] & mask) >> 8 * position) !== -1) {
			res.push(this.islandsMapData[i]);
		}
	}
	return res;
};

GUIp.common.islandsMapSearchData_bw = function(tileData, single) {
	var cmp = 0, mask = 0;
	var res = single ? null : [];
	for (var i = 0; i < 4; i++) {
		if (tileData[i] !== undefined) {
			mask += (255 << i*8);
			cmp += ((tileData[i] < 0 ? tileData[i] + 256 : tileData[i]) << i*8);
		}
	}
	for (var i = 0, len = this.islandsMapData.length; i < len; i++) {
		if ((this.islandsMapData[i] & mask) === cmp) {
			if (single) {
				return this.islandsMapData[i];
			}
			res.push(this.islandsMapData[i]);
		}
	}
	return res;
};

GUIp.common.islandsMapFormatTracks = function(obj) {
	var keys, res = {};
	keys = Object.keys(obj);
	for (var i = 0, len = keys.length; i < len; i++) {
		if (obj.hasOwnProperty(keys[i])) {
			var pos = obj[keys[i]];
			for (var j = 0, len2 = pos.length; j < len2; j++) {
				res[pos[j]] = keys[i];
			}
		}
	}
	return res;
};

GUIp.common.islandsMapLoadPOI = function(stored,id,mod) {
	var data = JSON.parse(stored) || [];
	for (var i = 0, len = data.length; i < len; i++) {
		if (data[i][0] === id) {
			if (data[i][1] < 1) {
				if (mod && data[i][1] < 0) {
					return [];
				}
				return data[i].slice(2);
			} else {
				return data[i].slice(1);
			}
		}
	}
	return [];
};

GUIp.common.islandsMapSavePOI = function(stored,id,points,mod) {
	var data = JSON.parse(stored) || [];
	for (var i = 0, len = data.length; i < len; i++) {
		if (data[i][0] === id) {
			data.splice(i,1);
			break;
		}
	}
	if (points.length) {
		data.push([id, (mod ? -1 : 0)].concat(points));
	}
	return JSON.stringify(data.length > 20 ? data.slice(-20) : data);
};

GUIp.common.islandsMapHighlightPOI = function(poi,parameters) {
	if (!poi) {
		return false;
	}
	var rdata, translate, tile, rcolor = Math.floor(Math.random() * 10),
		scl = parameters.fhp ? 11 : 12.5;
	for (var i = poi.length - 1; i >= 0; i--) {
		if (parameters.nohistory) {
			poi[i] = (poi[i] & 0xFFFFFF);
		}
		rdata = GUIp.common.lb2array(poi[i]);
		tile = document.querySelector('g.tile[transform="translate(' + GUIp.common.tconv(scl,rdata) + ')"]')
		if (tile) {
			tile.classList.add('e_poi');
			tile.classList.add('e_poi_c' + (parameters.nohistory ? rcolor : rdata[3] % 10));
			if (!parameters.dhh) {
				tile.addEventListener('mouseenter', GUIp.common.islandsMapImprovePOIp1.bind(null,scl,poi[i],poi));
				tile.addEventListener('mouseleave', GUIp.common.islandsMapImprovePOIp2.bind(null));
			}
		}
	};
};

GUIp.common.islandsMapGetPOIColor = function(islandsMapPoints,randomize) {
	var colorIndex, colorFactor = 10, avColors = [], usedColors = [];
	if (randomize) {
		colorIndex = Math.floor(Math.random() * colorFactor);
		if (islandsMapPoints.length) {
			for (var i, k = 0, len = islandsMapPoints.length; k < len; k++) {
				i = (islandsMapPoints[k] & 0xFF000000) / 16777216;
				if (usedColors.indexOf(i) === -1) {
					usedColors.push(i);
				}
			}
			colorIndex = Math.floor(Math.max.apply(null, usedColors) / colorFactor);
			if (usedColors.length === (colorIndex + 1) * colorFactor) {
				colorIndex++;
			}
			colorIndex *= colorFactor;
			for (var i = 0; i < colorFactor; i++) {
				if (usedColors.indexOf(i + colorIndex) === -1) {
					avColors.push(i);
				}
			}
			colorIndex += avColors[Math.floor(Math.random() * avColors.length)];
		}
	} else {
		if (islandsMapPoints.length > 0) {
			colorIndex = (((islandsMapPoints[islandsMapPoints.length - 1] & 0xFF000000) / 16777216) + 1);
		} else {
			colorIndex = 0;
		}
	}
	return colorIndex;
};

GUIp.common.islandsMapImprovePOIp1 = function(scl,point,points) {
	var tile, pData, colorIndex = GUIp.common.lb2array(point)[3];
	for (var i = 0, len = points.length; i < len; i++) {
		pData = GUIp.common.lb2array(points[i]);
		if (pData[3] === colorIndex) {
			tile = document.querySelector('g.tile[transform="translate(' + GUIp.common.tconv(scl,pData) + ')"]');
			if (tile) {
				tile.classList.add('e_poi_hover');
			}
		}
	}
};

GUIp.common.islandsMapImprovePOIp2 = function() {
	var points = document.querySelectorAll('g.e_poi_hover');
	for (var i = 0, len = points.length; i < len; i++) {
		points[i].classList.remove('e_poi_hover');
	}
};

GUIp.common.islandsMapImproveHints = function(parameters) {
	var abspos, hintpos, hintposstr, tile, transform, distance, range, rev, dir, keys, tiles = document.querySelectorAll('g.tile text'),
		scl = parameters.fhp ? 11 : 12.5,
		rlimit = this.islandsMapRadius || this.islandsMapConds.match('small') && 15 || 22,
		bclass = 'e_border' + (this.islandsMapConds.match('locked') ? '_n' : '');
	if (this.islandsMapHints === undefined) {
		this.islandsMapHints = {};
	}
	// prepare positions
	for (var i = 0, len = tiles.length; i < len; i++) {
		transform = tiles[i].parentNode.transform.baseVal[0].matrix;
		tiles[i].parentNode.ernpos = GUIp.common.tconv(scl,transform.e,transform.f);
	}
	// process hints
	for (var i = 0, len = tiles.length; i < len; i++) {
		tile = tiles[i].parentNode;
		hintpos = tile.ernpos;
		hintposstr = hintpos.join(':');
		range = [];
		rev = '';
		dir = [];
		if (Math.max.apply(null,tile.ernpos.map(Math.abs)) === rlimit) {
			if (!Array.prototype.some.call(tile.classList, function(a) { return a.match(/island|border|pl(\d{1})/); })) {
				tile.classList.add(bclass);
			}
		}
		switch (tiles[i].textContent) {
			case '✺': range = [0,4]; break;
			case '☀': range = [3,6]; break;
			case '♨': range = [5,8]; break;
			case '☁': range = [7,10]; break;
			case '❄': range = [9,12]; break;
			case '✵': range = [10,12]; rev = '_r'; break;
			case '↗': dir = [[ 1, 0, NaN], [0.5, NaN, -1], [ 1, NaN,-0.5]]; break; // north-east
			case '↖': dir = [[ 0, 1, NaN], [NaN, 1, -0.5], [NaN, 0.5, -1]]; break; // north-west
			case '↙': dir = [[-1, 0, NaN], [-0.5, NaN, 1], [-1, NaN, 0.5]]; break; // south-west
			case '↘': dir = [[ 0,-1, NaN], [NaN,-1,  0.5], [NaN,-0.5,  1]]; break; // south-east
			case '←': dir = [[-1, NaN, 0], [-1, 0.5, NaN], [-0.5, 1, NaN]]; break; // west
			case '→': dir = [[ 1, NaN, 0], [0.5, -1, NaN], [ 1,-0.5, NaN]]; break; // east
			case '↑': dir = [[ 0, 0, NaN], [ 0,  1,  NaN], [ 1,   0, NaN]]; break; // north
			case '↓': dir = [[ 0, 0, NaN], [-1,  0,  NaN], [ 0,  -1, NaN]]; break; // south
		}
		if (hintposstr === '0:0:0') {
			rev = '_p';
		}
		if (range.length || dir.length || rev.length) {
			if (this.islandsMapHints[hintposstr] === undefined) {
				this.islandsMapHints[hintposstr] = {act:false,rev:rev,range:range[0],pos:[],cells:[]};
			} else {
				if (tiles.length !== this.islandsMapTilesCount || rev !== this.islandsMapHints[hintposstr].rev || range[0] !== this.islandsMapHints[hintposstr].range) {
					this.islandsMapHints[hintposstr].pos = [];
					this.islandsMapHints[hintposstr].cells = [];
				}
				this.islandsMapHints[hintposstr].rev = rev;
				this.islandsMapHints[hintposstr].range = range[0];
			}
			if (!this.islandsMapHints[hintposstr].pos.length || !this.islandsMapHints[hintposstr].cells.length) {
				if (dir.length) {
					var target, ref = GUIp.common.islandsMapMoveTile([+hintpos[0],+hintpos[1],+hintpos[2]],dir[0],1);
					if (GUIp.common.islandsMapDistance(hintpos,ref) > 0) {
						this.islandsMapHints[hintposstr].pos.push(ref);
						this.islandsMapHints[hintposstr].cells.push('translate(' + GUIp.common.tconv(scl,ref) + ')');
					}
					for (var k = 1; k < 3; k++) {
						for (var j = 1; j < 100; j++) {
							target = GUIp.common.islandsMapMoveTile(ref, dir[k], j);
							if (Math.max.apply(null,target.map(Math.abs)) > 24) {
								break;
							}
							if (document.querySelector('g.tile[transform="translate(' + GUIp.common.tconv(scl,target) + ')"]')) {
								this.islandsMapHints[hintposstr].pos.push(target);
								this.islandsMapHints[hintposstr].cells.push('translate(' + GUIp.common.tconv(scl,target) + ')');
							}
						}
					}
				} else if (range.length) {
					for (var j = 0; j < len; j++) {
						distance = GUIp.common.islandsMapDistance(hintpos,tiles[j].parentNode.ernpos);
						if (distance > range[0] && distance < range[1]) {
							this.islandsMapHints[hintposstr].pos.push(tiles[j].parentNode.ernpos);
							this.islandsMapHints[hintposstr].cells.push(tiles[j].parentNode.getAttribute('transform'));
						}
					}
				} else {
					for (var j = 0; j < len; j++) {
						abspos = tiles[j].parentNode.ernpos.map(Math.abs);
						if ((abspos[0] === 0 && abspos[1] === abspos[2]) || (abspos[1] === 0 && abspos[0] === abspos[2]) || (abspos[2] === 0 && abspos[0] === abspos[1])) {
							this.islandsMapHints[hintposstr].pos.push(tiles[j].parentNode.ernpos);
							this.islandsMapHints[hintposstr].cells.push(tiles[j].parentNode.getAttribute('transform'));
						}
					}
				}
			}
			if (!tile.classList.contains('e_clickable')) {
				tile.classList.add('e_clickable');
				tile.addEventListener('click', GUIp.common.islandsMapImproveHintsP0.bind(null,this.islandsMapHints,hintposstr));
				if (!parameters.dhh) {
					tile.addEventListener('mouseenter', GUIp.common.islandsMapImproveHintsP1.bind(null,this.islandsMapHints,hintposstr,0));
					tile.addEventListener('mouseleave', GUIp.common.islandsMapImproveHintsP2.bind(null,this.islandsMapHints,hintposstr,0));
				}
			}
		}
	}
	keys = Object.keys(this.islandsMapHints);
	for (var i = 0, len = keys.length; i < len; i++) {
		if (this.islandsMapHints[keys[i]].act === false) {
			continue;
		}
		GUIp.common.islandsMapImproveHintsP1(this.islandsMapHints,keys[i],2);
	}
	this.islandsMapTilesCount = tiles.length;
};

GUIp.common.islandsMapImproveHintsP0 = function(hints,id) {
	if (hints[id].act === false) {
		GUIp.common.islandsMapImproveHintsP1(hints,id,2);
		hints[id].act = true;
	} else {
		hints[id].act = false;
		GUIp.common.islandsMapImproveHintsP2(hints,id,2);
	}		
};

GUIp.common.islandsMapImproveHintsP1 = function(hints,id,override) {
	if (hints[id].act === true && override === 0) {
		return;
	}
	var tile, idc = id.split(':'),
		hkeys = Object.keys(hints),
		hcnt = 'e_hint_cnt' + hints[id].rev,
		hclass = 'e_hint' + hints[id].rev,
		hrevs = [];
	for (var i = 0, len2 = hkeys.length; i < len2; i++) {
		if (hkeys[i] === id || hints[hkeys[i]].act === false || hints[hkeys[i]].rev === '_p' || (hints[id].rev !== '_r' && hints[hkeys[i]].rev === '_r')) {
			continue;
		}
		for (var j = 0, len3 = hints[hkeys[i]].pos.length; j < len3; j++) {
			if (GUIp.common.islandsMapDistance(idc,hints[hkeys[i]].pos[j]) <= hints[id].range) {
				tile = document.querySelector('g.tile[transform="' + hints[hkeys[i]].cells[j] + '"]');
				if (tile) {
					tile.classList.remove('e_hint' + hints[hkeys[i]].rev);
					tile.classList.remove('hl');
				}
			}
		}
	}
	for (var i = 0, len = hkeys.length; i < len; i++) {
		if (hkeys[i] === id || hints[hkeys[i]].act === false || hints[id].rev === '_p' || (hints[id].rev === '_r' && hints[hkeys[i]].rev !== '_r')) {
			continue;
		}
		hrevs.push([hkeys[i].split(':'),hints[hkeys[i]].range]);
	}
	cLoop:
	for (var i = 0, len = hints[id].cells.length; i < len; i++) {
		tile = document.querySelector('g.tile[transform="' + hints[id].cells[i] + '"]');
		if (tile) {
			if (tile.classList.contains('border')) {
				continue;
			}
			if (override === 2) {
				tile[hcnt] = (tile[hcnt] || 0) + 1;
			}
			for (var j = 0, len2 = hrevs.length; j < len2; j++) {
				if (GUIp.common.islandsMapDistance(hrevs[j][0],hints[id].pos[i]) <= hrevs[j][1]) {
					continue cLoop;
				}
			}
			tile.classList.add(hclass);
		}
	}
};

GUIp.common.islandsMapImproveHintsP2 = function(hints,id,override) {
	if (hints[id].act === true) {
		return;
	}
	var tile, hcntval, hkeys = Object.keys(hints),
		hcnt = 'e_hint_cnt' + hints[id].rev,
		hclass = 'e_hint' + hints[id].rev;
	for (var i = 0, len = hints[id].cells.length; i < len; i++) {
		tile = document.querySelector('g.tile[transform="' + hints[id].cells[i] + '"]');
		if (tile) {
			if (override === 2) {
				if (tile[hcnt] > 0) {
					tile[hcnt]--;
				}
			}
			if (tile[hcnt] > 0) {
				continue;
			}
			tile.classList.remove(hclass);
			tile.classList.remove('hl');
		}
	}
	for (var i = 0, len = hkeys.length; i < len; i++) {
		if (hkeys[i] === id || hints[hkeys[i]].act === false) {
			continue;
		}
		GUIp.common.islandsMapImproveHintsP1(hints,hkeys[i],1);
	}
};

GUIp.common.islandsMapMoveTile = function(data,multi,step) {
	var ldata = data.slice(0);
	for (var i = 0; i < 3; i++) {
		if (multi[i]) {
			ldata[i] += parseInt(step * multi[i]);
		}
	}
	if (isNaN(multi[0])) {
		ldata[0] = -ldata[1] - ldata[2];
	} else if (isNaN(multi[1])) {
		ldata[1] = -ldata[0] - ldata[2];
	} else if (isNaN(multi[2])) {
		ldata[2] = -ldata[0] - ldata[1];
	}
	return ldata;
};

GUIp.common.islandsMapDistance = function(c1, c2) {
	return Math.max(Math.abs(c1[0] - c2[0]),Math.abs(c1[1] - c2[1]),Math.abs(c1[2] - c2[2]));
};

GUIp.common.islandsMapImproveHints2 = function(parameters) {
	var a, b, d, x1, y1, x2, y2, points, type, groot, ng, npoly, tile, transform, range, tiles = document.querySelectorAll('g.tile text'),
		scl = parameters.fhp ? 11 : 12.5,
		rlimit = this.islandsMapRadius || this.islandsMapConds.match('small') && 15 || 22,
		bclass = 'e_border' + (this.islandsMapConds.match('locked') ? '_n' : '');
	if (!this.islandsMapHints2) {
		this.islandsMapHints2 = {};
	}
	a = Math.cos(Math.PI/6) * scl;
	b = Math.sin(Math.PI/6) * scl;
	d = scl;
	groot = document.querySelector('svg > g');
	// prepare positions
	for (var i = 0, len = tiles.length; i < len; i++) {
		transform = tiles[i].parentNode.transform.baseVal[0].matrix;
		tiles[i].parentNode.ernpos = GUIp.common.tconv(scl,transform.e,transform.f);
	}
	// process hints
	for (var i = 0, len = tiles.length; i < len; i++) {
		tile = tiles[i].parentNode;
		transform = tile.getAttribute('transform');
		range = 0;
		type = 0;
		if (Math.max.apply(null,tile.ernpos.map(Math.abs)) === rlimit) {
			if (!Array.prototype.some.call(tile.classList, function(a) { return a.match(/island|border|pl(\d{1})/); })) {
				tile.classList.add(bclass);
			}
		}
		switch (tiles[i].textContent) {
			case '✺': type = 1; range = 3; break;
			case '☀': type = 1; range = 5; break;
			case '♨': type = 1; range = 7; break;
			case '☁': type = 1; range = 9; break;
			case '❄': type = 1; range = 11; break;
			case '🌀': type = 2; range = 18; break;
			case '✵': type = 3; range = 11; break;
			case '↗': // north-east
				type = 4;
				points = 0+','+(-(3*d+b)*rlimit)+' 0,'+(-d)+' '+(a)+','+(-b)+' '+(4*a*rlimit)+','+(-2*d*rlimit);
				break;
			case '↖': // north-west
				type = 4;
				points = 0+','+(-(3*d+b)*rlimit)+' 0,'+(-d)+' '+(-a)+','+(-b)+' '+(-4*a*rlimit)+','+(-2*d*rlimit);
				break;
			case '↙': // south-west
				type = 4;
				points = 0+','+((3*d+b)*rlimit)+' 0,'+(+d)+' '+(-a)+','+(+b)+' '+(-4*a*rlimit)+','+(2*d*rlimit);
				break;
			case '↘': // south-east
				type = 4;
				points = 0+','+((3*d+b)*rlimit)+' 0,'+(+d)+' '+(a)+','+(+b)+' '+(4*a*rlimit)+','+(2*d*rlimit);
				break;
			case '←': // west
				type = 4;
				points = (-4*a*rlimit)+','+(-2*d*rlimit)+' '+(-a)+','+(-b)+' '+(-a)+','+(+b)+' '+(-4*a*rlimit)+','+(2*d*rlimit);
				break;
			case '→': // east
				type = 4;
				points = (4*a*rlimit)+','+(-2*d*rlimit)+' '+(a)+','+(-b)+' '+(a)+','+(+b)+' '+(4*a*rlimit)+','+(2*d*rlimit);
				break;
		}
		if (transform === 'translate(0,0)') {
			type = 5;
		}
		if (type > 0 && !document.querySelector('g.epl[transform="' + transform + '"]')) {
			ng = document.createElementNS('http://www.w3.org/2000/svg', 'g');
			ng.classList.add('epl','e_hint','e_hint_t'+type,(this.islandsMapHints2[transform] ? 'active' : 'hidden'));
			ng.setAttribute('transform',transform);
			if (type < 3) {
				x1 = a*(range) + a/2 + a/6;
				y1 = d*(1.5*range+0.5) + b;
				x2 = a*(2.0*range+1);
				y2 = b;
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',x1+','+(-y1)+' '+(-x1)+','+(-y1)+' '+(-x2)+','+(-y2)+' '+(-x2)+','+y2+' '+(-x1)+','+y1+' '+x1+','+y1+' '+x2+','+y2+' '+x2+','+(-y2)+' '+x1+','+(-y1));
				ng.insertBefore(npoly,null);
			} else if (type === 3) {
				x1 = a*(range) + a/6;
				y1 = d*(1.5*range+0.5);
				x2 = a*(2.0*range+1) - a/6;
				y2 = 0;
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',x1+','+(-y1)+' '+(-x1)+','+(-y1)+' '+(-x2)+','+y2+' '+(-x1)+','+y1+' '+x1+','+y1+' '+x2+','+y2+' '+x1+','+(-y1));
				ng.insertBefore(npoly,null);
			} else if (type === 4) {
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',points);
				ng.insertBefore(npoly,null);
			} else if (type === 5) {
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',(a*rlimit)+','+((b+d)*rlimit)+' '+(-a*rlimit)+','+(-(b+d)*rlimit));
				ng.insertBefore(npoly,null);
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',(a*rlimit)+','+(-(b+d)*rlimit)+' '+(-a*rlimit)+','+((b+d)*rlimit));
				ng.insertBefore(npoly,null);
				npoly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
				npoly.setAttribute('fill','none');
				npoly.setAttribute('points',(2*a*rlimit)+',0 '+(-2*a*rlimit)+',0');
				ng.insertBefore(npoly,null);
			}
			groot.insertBefore(ng,null);
			if (!tile.classList.contains('e_clickable')) {
				tile.classList.add('e_clickable');
				tile.addEventListener('click', GUIp.common.islandsMapImproveHintsR0.bind(this,transform,null));
				if (!parameters.dhh) {
					tile.addEventListener('mouseenter', GUIp.common.islandsMapImproveHintsR0.bind(this,transform,true));
					tile.addEventListener('mouseleave', GUIp.common.islandsMapImproveHintsR0.bind(this,transform,false));
				}
			}
		}
	}
};

GUIp.common.islandsMapImproveHintsR0 = function(hinttransform,act) {
	var tile = document.querySelector('g.epl[transform="' + hinttransform + '"]');
	if (!tile) {
		return;
	}
	if (act === null) {
		tile.classList.toggle('active');
		this.islandsMapHints2[hinttransform] = tile.classList.contains('active');
	}
	if (tile.classList.contains('active') || act === true) {
		tile.classList.remove('hidden');
	}
	if (!tile.classList.contains('active') && act !== true) {
		tile.classList.add('hidden');
	}
};

GUIp.common.islandsMapConvert = function(scl) {
	var pos, val, transform, tiles = document.querySelectorAll('g.tile text'),
		result = [];
	for (var i = 0, len = tiles.length; i < len; i++) {
		transform = tiles[i].parentNode.transform.baseVal[0].matrix;
		pos = GUIp.common.tconv(scl,transform.e,transform.f);
		val = null;
		if (tiles[i].parentNode.hasClass('island')) {
			switch (tiles[i].textContent) {
				case '🔦': val = 'm'.charCodeAt(0); break;
				case '🍴': val = '<'.charCodeAt(0); break;
				case '🔧': val = 'n'.charCodeAt(0); break;
				case '🙏': val = 'v'.charCodeAt(0); break;
				case '💡': val = '>'.charCodeAt(0); break;
				case '?': val = 'i'.charCodeAt(0); break;
				case '✺': val = 't'.charCodeAt(0); break;
				case '☀': val = 'y'.charCodeAt(0); break;
				case '♨': val = 'u'.charCodeAt(0); break;
				case '☁': val = 'o'.charCodeAt(0); break;
				case '❄': val = '['.charCodeAt(0); break;
				case '✵': val = ']'.charCodeAt(0); break;
				case '💰': val = 'G'.charCodeAt(0); break; // treasure on the island
				case '♂': val = 'M'.charCodeAt(0); break;
				case '♀': val = 'f'.charCodeAt(0); break;
				default: val = 'I'.charCodeAt(0);
			}
		} else if (tiles[i].parentNode.hasClass('port')) {
			val = 'p'.charCodeAt(0);
		} else if (tiles[i].parentNode.hasClass('border')) {
			val = '#'.charCodeAt(0);
		} else {
			switch (tiles[i].textContent) {
				case '↖': val = 'q'.charCodeAt(0); break;
				case '↑': val = 'w'.charCodeAt(0); break;
				case '↗': val = 'e'.charCodeAt(0); break;
				case '←': val = 'a'.charCodeAt(0); break;
				case '→': val = 'd'.charCodeAt(0); break;
				case '↙': val = 'z'.charCodeAt(0); break;
				case '↓': val = 'x'.charCodeAt(0); break;
				case '↘': val = 'c'.charCodeAt(0); break;
				case '!': val = '!'.charCodeAt(0); break; // todo other colors
				case '⁂': val = ','.charCodeAt(0); break;
				case '🌀': val = '@'.charCodeAt(0); break;
				case '👾': val = 'b'.charCodeAt(0); break;
				case '🐠': val = 'B'.charCodeAt(0); break;
				case '💰': val = 'g'.charCodeAt(0); break; // treasure from beastie
				case '♀': val = 'F'.charCodeAt(0); break;
				case '1': val = '1'.charCodeAt(0); break;
				case '2': val = '2'.charCodeAt(0); break;
				case '3': val = '3'.charCodeAt(0); break;
				case '4': val = '4'.charCodeAt(0); break;
			}
		}
		if (!val) {
			if (!tiles[i].parentNode.hasClass('unknown')) {
				val = 32;
			} else {
				val = 63;
			}
		}
		pos.push(val);
		result.push(GUIp.common.array2lb(pos));
	}
	return result;
};

GUIp.common.islandsMapGetConds = function(texts) {
	var islandsMapConds = [];
	if (texts.match(/все подсказки в этом море окажутся метками|all treasure hints look like '!' here/)) {
		islandsMapConds.push('pois');
	}
	if (texts.match(/в этом походе не будет зависимости силы тварей от расстояния|beasties are shuffled and can be anywhere in this sea/)) {
		islandsMapConds.push('migration');
	}
	if (texts.match(/щедрое море сделает все клады двойными|all treasures are doubled in this generous sea/)) {
		islandsMapConds.push('double');
	}
	if (texts.match(/мешков не будет, во всех кладах твари|no gold bags here, only manimals and fenimals/)) {
		islandsMapConds.push('beasties');
	}
	if (texts.match(/ветер разбросает ковчеги подальше от порта|wind disperses the arks all over the map/)) {
		islandsMapConds.push('winds');
	}
	if (texts.match(/море тесное, а поход ограничен 50 ходами|this sea is small and the expedition must end in 50 turns/)) {
		islandsMapConds.push('small');
	}
	if (texts.match(/в этом море огней маяков целая уйма|lots of lighthouses in this area/)) {
		islandsMapConds.push('fires');
	}
	if (texts.match(/граница на замке, покинуть заплыв можно только через порт|the border is closed, exit only through the port/)) {
		islandsMapConds.push('locked');
	}
	if (texts.match(/в этом море все твари бродячие и пугливые|all beasties are roaming, but very shy/)) {
		islandsMapConds.push('roaming');
	}
	if (texts.match(/на старте уже есть несколько подсказок|some treasure hints are already known/)) {
		islandsMapConds.push('faststart');
	}
	if (texts.match(/многие острова можно будет посещать по несколько раз/)) {
		islandsMapConds.push('multipass');
	}
	if (texts.match(/пустых островов здесь нет, лишь загадочные/)) {
		islandsMapConds.push('noempty');
	}
	return islandsMapConds;
};

GUIp.common.tconv = function(scl,arg1,arg2) {
	if (arg2 !== undefined) {
		var res = [Math.round(arg1/scl/Math.sqrt(3)-Math.round(arg2/1.5/scl)/2),null,Math.round(arg2/1.5/scl)];
		res[1] = -res[0] -res[2];
		return res;
	} else {
		if (worker.GUIp_browser !== 'Opera') {
			return scl*(Math.sqrt(3)*arg1[0]+Math.sqrt(3)/2*arg1[2]) + ',' + 1.5*scl*arg1[2];
		} else {
			return +(scl*(Math.sqrt(3)*arg1[0]+Math.sqrt(3)/2*arg1[2])).toPrecision(6) + ' ' + +(1.5*scl*arg1[2]).toPrecision(6);
		}
	}
};

GUIp.common.array2lb = function(a) {
	var res = 0, mul = [1, 256, 65536, 16777216];
	for (var i = 0; i < 4; i++) {
		res += (a[i] < 0 ? (a[i] + 256) : a[i]) * mul[i];
	}
	return res;
};

GUIp.common.lb2array = function(a) {
	var val, res = [0,0,0,0];
	for (var i = 0; i < 4; i++) {
		val = a & 255;
		a = (a - val) / 256;
		res[i] = val > 127 ? (val - 256) : val;
	}
	return res;
};

GUIp.common.array2lb_bw = function(a) {
	var res = 0;
	for (var i = 0; i < 4; i++) {
		(a[i] < 0) && (a[i] += 256);
		res |= (a[i] << i*8);
	}
	return res;
};

GUIp.common.lb2array_bw = function(a) {
	var val, res = [];
	for (var i = 0; i < 4; i++) {
		val = (a & (255 << i*8)) >> i*8;
		res.push(val > 128 ? val - 256 : val);
	}
	return res;
};

GUIp.common.erinome_url = '//gv.erinome.net';

})();