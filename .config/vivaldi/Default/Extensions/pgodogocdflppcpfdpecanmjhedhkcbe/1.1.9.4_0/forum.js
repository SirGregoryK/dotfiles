(function() {
'use strict';

// base functions and variables initialization
var worker = window;

var doc = document;
var $id = function(id) {
	return doc.getElementById(id);
};
var $C = function(classname) {
	return doc.getElementsByClassName(classname);
};
var $c = function(classname) {
	return doc.getElementsByClassName(classname)[0];
};
var $Q = function(sel) {
	return doc.querySelectorAll(sel);
};
var $q = function(sel) {
	return doc.querySelector(sel);
};
var storage = {
	_getKey: function(key) {
		return "eGUI_" + this.god_name + ':' + key;
	},
	set: function(id, value) {
		localStorage.setItem(this._getKey(id), value);
		return value;
	},
	get: function(id) {
		var value = localStorage.getItem(this._getKey(id));
		if (value === 'true') { return true; }
		else if (value === 'false') { return false; }
		else { return value; }
	},
	god_name: ''
};
var addSmallElements = function() {
	var temp = $Q('.c2');
	for (i = 0, len = temp.length; i < len; i++) {
		if (!temp[i].querySelector('small')) {
			temp[i].insertAdjacentHTML('beforeend', '<small />');
		}
	}
};
var followOnclick = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			posts = isTopic ? +$c('subtitle').textContent.match(/\d+/)[0]
							: +this.parentElement.parentElement.nextElementSibling.textContent,
			dates = isTopic ? document.getElementsByTagName('abbr')
							: null,
			date =  isTopic ? document.getElementsByClassName('disabled next_page').length ? dates[dates.length - 1].title : 0
							: this.parentElement.parentElement.parentElement.getElementsByTagName('abbr')[0].title,
			name =  isTopic ? document.querySelector('.cur_nav').textContent
							: this.parentElement.parentElement.querySelector('a').textContent,
			by =  isTopic ? document.getElementsByClassName('disabled next_page').length ? document.querySelectorAll('.fn > span:first-child > a')[dates.length - 1].textContent : '-'
							: this.parentElement.parentElement.parentElement.querySelector('span.author').textContent,
			topics = JSON.parse(storage.get('ForumSubscriptions'));
		if (worker.Object.keys(topics).length < 60) {
			topics[topic] = { posts: posts, name: name, by: by, date: (new worker.Date(date)).getTime() };
		} else {
			worker.alert(worker.GUIp_i18n.forum_subs_limit_exceeded + ' (60)');
			return false;
		}
		storage.set('ForumSubscriptions', JSON.stringify(topics));
		this.style.display = 'none';
		this.parentElement.querySelector('.unfollow').style.display = 'inline';
		if (isSubs) {
			this.parentElement.querySelector('.mkrapid').style.display = 'inline';
			updateSubscriptionsStats(topics,worker.Object.keys(topics));
		}
	} catch(error) {
		worker.console.error(error);
	}
};
var addOnclickToFollow = function() {
	var follow_links = $Q('.follow');
	for (i = 0, len = follow_links.length; i < len; i++) {
		follow_links[i].onclick = followOnclick;
	}
};
var unfollowOnclick = function(e) {
	try {
		e.preventDefault();
		var topic = isTopic ? location.pathname.match(/\d+/)[0]
							: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
			topics = JSON.parse(storage.get('ForumSubscriptions')),
			informers = JSON.parse(storage.get('ForumInformers'));
		delete topics[topic];
		storage.set('ForumSubscriptions', JSON.stringify(topics));
		if (informers[topic]) {
			delete informers[topic];
			storage.set('ForumInformers', JSON.stringify(informers));
		}
		this.style.display = 'none';
		this.parentElement.querySelector('.follow').style.display = 'inline';
		if (isSubs) {
			this.parentElement.querySelector('.mkrapid').style.display = 'none';
			this.parentElement.querySelector('.unmkrapid').style.display = 'none';
			updateSubscriptionsStats(topics,worker.Object.keys(topics));
		}
	} catch(error) {
		worker.console.error(error);
	}
};
var addOnclickToUnfollow = function() {
	var unfollow_links = $Q('.unfollow');
	for (i = 0, len = unfollow_links.length; i < len; i++) {
		unfollow_links[i].onclick = unfollowOnclick;
	}
};
var addOnclickToRapid = function() {
	var rapid_links = $Q('.mkrapid');
	for (i = 0, len = rapid_links.length; i < len; i++) {
		rapid_links[i].onclick = function(e) {
			e.preventDefault();
			var topic = isTopic ? location.pathname.match(/\d+/)[0]
								: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
				topics = JSON.parse(storage.get('ForumSubscriptions')),
				keys = worker.Object.keys(topics),
				rapid = 0;
			for (var j = 0, len2 = keys.length; j < len2; j++) {
				if (topics[keys[j]].rapid) {
					rapid++;
				}
			}
			if (rapid >= 9) {
				worker.alert(worker.GUIp_i18n.forum_subs_rapid_exceeded + ' (9)');
				return;
			}
			if (topics[topic]) {
				topics[topic].rapid = true;
				storage.set('ForumSubscriptions', JSON.stringify(topics));
			}
			this.style.display = 'none';
			this.parentElement.querySelector('.unmkrapid').style.display = 'inline';
			if (isSubs) {
				updateSubscriptionsStats(topics,keys);
			}
		};
	}
};
var addOnclickToUnrapid = function() {
	var rapid_links = $Q('.unmkrapid');
	for (i = 0, len = rapid_links.length; i < len; i++) {
		rapid_links[i].onclick = function(e) {
			e.preventDefault();
			var topic = isTopic ? location.pathname.match(/\d+/)[0]
								: this.parentElement.parentElement.querySelector('a').href.match(/\d+/)[0],
				topics = JSON.parse(storage.get('ForumSubscriptions'));
			if (topics[topic]) {
				delete topics[topic].rapid;
				storage.set('ForumSubscriptions', JSON.stringify(topics));
			}
			this.style.display = 'none';
			this.parentElement.querySelector('.mkrapid').style.display = 'inline';
			if (isSubs) {
				updateSubscriptionsStats(topics,worker.Object.keys(topics));
			}
		};
	}
};
var addLinks = function() {
	var links_containers;
	if (isTopic) {
		links_containers = $Q('#content .crumbs');
		topic = location.pathname.match(/\d+/)[0];
		var isFollowed = topics[topic] !== undefined;
		if (links_containers[0]) {
			links_containers[0].insertAdjacentHTML('afterend',
				'\n<div id="ui_notify">' +
				'<a class="follow" href="#" style="display: ' + (isFollowed ? 'none' : 'inline') + '" title="' + worker.GUIp_i18n.subscribe_title + '">' + worker.GUIp_i18n.Subscribe + '</a>' + 
				'<a class="unfollow" href="#" style="display: ' + (isFollowed ? 'inline' : 'none') + '" title="' + worker.GUIp_i18n.unsubscribe_title + '">' + worker.GUIp_i18n.Unsubscribe + '</a>' +
				'</div>'
			);
		}
	} else {
		links_containers = $Q('.c2 small');
		for (i = 0, len = links_containers.length; i < len; i++) {
			topic = links_containers[i].parentElement.getElementsByTagName('a')[0].href.match(/\d+/)[0];
			var isFollowed = topics[topic] !== undefined,
				isRapid = topics[topic] && topics[topic].rapid;
			links_containers[i].insertAdjacentHTML('beforeend',
				'\n<a class="follow" href="#" style="display: ' + (isFollowed ? 'none' : 'inline') + '" title="' + worker.GUIp_i18n.subscribe_title + '">' + worker.GUIp_i18n.subscribe + '</a>' +
				'<a class="unfollow" href="#" style="display: ' + (isFollowed ? 'inline' : 'none') + '" title="' + worker.GUIp_i18n.unsubscribe_title + '">' + worker.GUIp_i18n.unsubscribe + '</a>' +
				(isSubs ? ' <a class="mkrapid" href="#" style="display: ' + (isFollowed && !isRapid ? 'inline' : 'none') + '">☆</a>' + '<a class="unmkrapid" href="#" style="display: ' + (isFollowed && isRapid ? 'inline' : 'none') + '">★</a>' : '')
			);
		}
	}
	addOnclickToFollow();
	addOnclickToUnfollow();
	addOnclickToRapid();
	addOnclickToUnrapid();
};

var prepareSubscriptionsList = function() {
	var i, j, elm, topics, postdata, requestlist,
		subscriptions = JSON.parse(storage.get('ForumSubscriptions'));
	if (elm = document.querySelector(".crumbs .cur_nav")) {
		elm.textContent = worker.GUIp_i18n.forum_subs + ' UI+';
	}
	elm = document.querySelectorAll('#search_block, #content .subtitle, #content .pagination, #content div a[href="/forums/new_topic/1"]');
	for (i = 0; i < elm.length; i++) {
		elm[i].style.display = "none";
	}
	elm = document.querySelectorAll('tr.hentry');
	for (i = 0; i < elm.length; i++) {
		elm[i].parentNode.removeChild(elm[i]);
	}
	elm = document.querySelectorAll('table.topics th');
	elm[2].parentNode.removeChild(elm[2]);

	topics = worker.Object.keys(subscriptions);
	if (topics.length === 0) {
		insertTopicRow('<tr><td colspan="5">' + worker.GUIp_i18n.forum_subs_no_subs + '</td></tr>');
		return;
	} else {
		var informers = JSON.parse(storage.get('ForumInformers'));
		topics.sort(function(a,b) {
			if (subscriptions[a].date > subscriptions[b].date) {
				return -1;
			}
			if (subscriptions[a].date < subscriptions[b].date) {
				return 1;
			}
			return 0;
		});
		var tid, page, date, content = '',
			topics_unsorted = worker.Object.keys(subscriptions);
		for (var i = 0; i < topics.length; i++) {
			tid = topics[i];
			page = Math.ceil(subscriptions[tid].posts / 25);
			date = new Date(subscriptions[tid].date || 0);
			content += '<tr class="hentry">' +
				'<td style="padding:5px; width:16px;" class="c1"><img alt="Comment" class="icon ' + (informers[tid] ? 'green' : 'grey') + ' " src="/images/forum/clearbits/comment.gif"></td>' +
				'<td class="c2">' +
					'<a href="/forums/show_topic/' + tid + '" class="entry-title" rel="bookmark">' + subscriptions[tid].name + '</a> ' +
					'<small><a href="/forums/show_topic/' + tid + '?page=' + page + '">' + worker.GUIp_i18n.forum_subs_last + '</a></small>' +
				'</td>' +
				'<td class="ca inv stat">' + subscriptions[tid].posts + '</td>' +
				'<td class="lp">' +
					'<abbr class="updated" title="' + GUIp.common.formatTime(date,'fakejson') + '">' + GUIp.common.formatTime(date,'forum') + '</abbr> ' +
					worker.GUIp_i18n.forum_subs_by + ' <span class="author"><strong class="fn">' + subscriptions[tid].by + '</strong></span> ' + 
					'<span><a href="/forums/show_topic/' + tid + '?page=' + page + '#guip_' + (subscriptions[tid].posts + 25 - page*25) + '">' + worker.GUIp_i18n.forum_subs_view + '</a></span>' +
				'</td></tr>';
		}
		insertTopicRow(content);
		content = null;
		updateSubscriptionsStats(subscriptions,topics);
		addSmallElements();
		addLinks();
	}
};
var insertTopicRow = function(content) {
	if (document.getElementById('subs_spinner')) {
		var spinner = document.getElementById('subs_spinner');
		spinner.parentNode.removeChild(spinner);
	}
	document.querySelector('table.topics tbody').insertAdjacentHTML('beforeend',content);
};
var updateSubscriptionsStats = function(subscriptions, keys) {
	var topics, interval, rapid = 0, subtitle = document.querySelector('#content .subtitle');
	if (!subtitle) {
		return;
	}
	for (i = 0, len = keys.length; i < len; i++) {
		if (subscriptions[keys[i]].rapid) {
			rapid++;
		}
	}
	interval = Math.ceil((keys.length - rapid)/(20 - rapid)) * 3;
	subtitle.textContent = worker.GUIp_i18n.forum_subs_count + keys.length + (keys.length > 0 ? (rapid > 0 ? worker.GUIp_i18n.forum_subs_rapid + rapid : '') + worker.GUIp_i18n.forum_subs_intv + interval + ' ' + worker.GUIp_i18n.format_time_minute : '');
	subtitle.style.display = '';
};
var addSubscriptionsLink = function() {
	var lnk = document.createElement('a'), div = document.createElement('div');
	lnk.href = '/forums/show/1/#guip_subscriptions';
	lnk.textContent = worker.GUIp_i18n.forum_subs.toLowerCase() + ' UI+';
	lnk.title = worker.GUIp_i18n.forum_subs + ' UI+';
	div.insertBefore(lnk,null);
	div.style.textAlign = 'center';
	div.style.marginTop = '0.5em';
	document.getElementById('content').insertBefore(div,null);
};


// topic formatting
var val, ss, se, nls, nle, selection;
var initEditor = function(editor) {
	val = editor.value;
	ss = editor.selectionStart;
	se = editor.selectionEnd;
	selection = worker.getSelection().isCollapsed ? '' : worker.getSelection().toString().trim().replace(/\n[\n\s]*/g, '<br>');
};
var putSelectionTo = function(editor, pos, quoting) {
	editor.focus();
	editor.selectionStart = editor.selectionEnd = pos + (quoting ? selection.length : 0);
};
var basicFormatting = function(left_and_right, editor) {
	try {
		initEditor(editor);
		while (ss < se && val[ss].match(/\s/)) {
			ss++;
		}
		while (ss < se && val[se - 1].match(/\s/)) {
			se--;
		}
		editor.value = val.slice(0, ss) + (val && val[ss - 1] && val[ss - 1].match(/[a-zA-Zа-яА-ЯёЁ]/) ? ' ' : '') + left_and_right[0] + val.slice(ss, se) + selection + left_and_right[1] + (val && val [se] && val[se].match(/[a-zA-Zа-яА-ЯёЁ]/) ? ' ' : '') + val.slice(se);
		putSelectionTo(editor, se + left_and_right[0].length, true);
		return false;
	} catch(error) {
		worker.console.error(error);
	}
};
var quoteFormatting = function(quotation, editor) {
	try {
		initEditor(editor);
		nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n\n' : (val[ss - 2] && !val[ss - 2].match(/\n/) ? '\n' : '');
		nle = ss !== se && val ? ((val[se] && !val[se].match(/\n/) || !val[se]) ? '\n\n'
																				: (val[se + 1] && !val[se + 1].match(/\n/) ? '\n'
																														   : ''))
							   : '' +
			  selection ? (!selection[selection.length - 1].match(/\n/) ? '\n\n'
																		: (selection && selection[selection.length - 2] && !selection[selection.length - 2].match(/\n/) ? '\n'
																																										: ''))
						: '';
		editor.value = val.slice(0, ss) + nls + quotation + val.slice(ss, se) + selection + nle + val.slice(se);
		putSelectionTo(editor, se + quotation.length + nls.length + (se > ss || selection ? nle.length : 0), true);
		return false;
	} catch(error) {
		worker.console.error(error);
	}
};
var listFormatting = function(list_marker, editor) {
	try {
		initEditor(editor);
		nls = val && val[ss - 1] && !val[ss - 1].match(/\n/) ? '\n' : '';
		nle = val && val[se] && !val[se].match(/\n/) ? '\n\n' : (val[se + 1] && !val[se + 1].match(/\n/) ? '\n' : '');
		var count = val.slice(ss, se).match(/\n/g) ? val.slice(ss, se).match(/\n/g).length + 1 : 1;
		editor.value = val.slice(0, ss) + nls + list_marker + ' ' + val.slice(ss, se).replace(/\n/g, '\n' + list_marker + ' ') + nle + val.slice(se);
		putSelectionTo(editor, se + nls.length + (list_marker.length + 1)*count, true);
		return false;
	} catch(error) {
		worker.console.error(error);
	}
};
var pasteBr = function(dummy, editor) {
	try {
		initEditor(editor);
		var pos = editor.selectionDirection === 'backward' ? ss : se;
		editor.value = val.slice(0, pos) + '<br>' + val.slice(pos);
		putSelectionTo(editor, pos + 4, true);
		return false;
	} catch(error) {
		worker.console.error(error);
	}
};
var setClickActions = function(id, container) {
	var elem, temp = '#' + id + ' .formatting.',
		buttons = [
			{ class: 'bold', func: basicFormatting, params: ['*', '*'] },
			{ class: 'underline', func: basicFormatting, params: ['+', '+'] },
			{ class: 'strike', func: basicFormatting, params: ['-', '-'] },
			{ class: 'italic', func: basicFormatting, params: ['_', '_'] },
			{ class: 'godname', func: basicFormatting, params: ['"', '":пс'] },
			{ class: 'link', func: basicFormatting, params: ['"', '":'] },
			{ class: 'sup', func: basicFormatting, params: ['^', '^'] },
			{ class: 'sub', func: basicFormatting, params: ['~', '~'] },
			{ class: 'monospace', func: basicFormatting, params: ['@', '@'] },
			{ class: 'bq', func: quoteFormatting, params: 'bq. ' },
			{ class: 'bc', func: quoteFormatting, params: 'bc. ' },
			{ class: 'pre', func: quoteFormatting, params: 'pre. ' },
			{ class: 'ul', func: listFormatting, params: '*' },
			{ class: 'ol', func: listFormatting, params: '#' },
			{ class: 'br', func: pasteBr, params: null },
		];
	for (i = 0, len = buttons.length; i < len; i++) {
		if ((elem = $q(temp + buttons[i].class))) {
			elem.onclick = buttons[i].func.bind(this, buttons[i].params, container);
		}
	}
};
var addFormattingButtons = function() {
	var formatting_buttons =
		'<div>' +
			'<button class="formatting button bold" title="' + worker.GUIp_i18n.bold_hint + '">' + worker.GUIp_i18n.bold + '</button>' +
			'<button class="formatting button underline" title="' + worker.GUIp_i18n.underline_hint + '">' + worker.GUIp_i18n.underline + '</button>' +
			'<button class="formatting button strike" title="' + worker.GUIp_i18n.strike_hint + '">' + worker.GUIp_i18n.strike + '</button>' +
			'<button class="formatting button italic" title="' + worker.GUIp_i18n.italic_hint + '">' + worker.GUIp_i18n.italic + '</button>' +
			'<button class="formatting bq" title="' + worker.GUIp_i18n.quote_hint + '">bq.</button>' +
			'<button class="formatting bc" title="' + worker.GUIp_i18n.code_hint + '">bc.</button>' +
			'<button class="formatting bc pre" title="' + worker.GUIp_i18n.pre_hint + '">pre.</button>' +
			(worker.GUIp_locale === 'ru' ? '<button class="formatting button godname" title="Вставить ссылку на бога"></button>' : '') +
			'<button class="formatting button link" title="' + worker.GUIp_i18n.link_hint + '">a</button>' +
			'<button class="formatting button ul" title="' + worker.GUIp_i18n.unordered_list_hint + '">•</button>' +
			'<button class="formatting button ol" title="' + worker.GUIp_i18n.ordered_list_hint + '">1.</button>' +
			'<button class="formatting button br" title="' + worker.GUIp_i18n.br_hint + '"></button>' +
			'<button class="formatting button sup" title="' + worker.GUIp_i18n.sup_hint + '">X<sup>2</sup></button>' +
			'<button class="formatting button sub" title="' + worker.GUIp_i18n.sub_hint + '">X<sub>2</sub></button>' +
			'<button class="formatting button monospace" title="' + worker.GUIp_i18n.monospace_hint + '">' + worker.GUIp_i18n.monospace + '</button>' +
		'</div>';
	$id('post_body_editor').insertAdjacentHTML('afterbegin', formatting_buttons);
	setClickActions('post_body_editor', $id('post_body'));
};
var fixGodnamePaste = function() {
	if (!worker.jQuery) {
		return;
	}
	worker.ReplyForm.add_name = function(name,e) {
		try {
			var editor;
			if (document.getElementById('edit').style.display !== 'none' && document.getElementById('edit_body')) {
				editor = document.getElementById('edit_body');
			} else {
				editor = document.getElementById('post_body');
				if (document.getElementById('reply').style.display === 'none') {
					worker.ReplyForm.show();
				}
			}
			initEditor(editor);
			var pos = editor.selectionDirection === 'backward' ? ss : se;
			editor.value = val.slice(0, pos) + '*' + name + '*, ' + val.slice(pos);
			worker.setTimeout(function() {
				putSelectionTo(editor, pos + name.length + 4, false);
			}, 50);
		} catch(error) {
			worker.console.error(error);
		}
		e.preventDefault();
		return false;
	};
	var godnameLinks = document.querySelectorAll('.vcard .gravatar a');
	if (worker.$(godnameLinks[i]).off)
	for (var i = 0, len = godnameLinks.length; i < len; i++) {
		worker.$(godnameLinks[i]).off('click');
		godnameLinks[i].addEventListener('click',worker.ReplyForm.add_name.bind(null,godnameLinks[i].dataset.gname),false);
	}
};


// topic other improvements
var pw, pw_pb_int;
var checkHash = function() {
	var guip_hash, post;
	// scroll to a certain post #
	if (guip_hash = location.hash.match(/#guip_(\d+)/)) {
		post = $C('spacer')[+guip_hash[1] - 1];
		location.hash = post ? post.id : '';
	}
	// highlight target post
	if (!storage.get('Option:disableTargetPostHighlight') && (guip_hash = location.hash.match(/#post_(\d+)/))) {
		if (post = $c('e_highlight')) {
			post.classList.remove('e_highlight');
		}
		if (post = $id('post_' + guip_hash[1] + '-row')) {
			post.classList.add('e_highlight');
		}
	}
};
var findPost = function(el) {
	do {
		el = el.parentNode;
	} while (!el.classList.contains('post'));
	return el;
};
var picturesAutoreplace = function() {
	if (!storage.get('Option:disableLinksAutoreplace')) {
		var links = document.querySelectorAll('.post .body a'),
			imgs = [],
			onerror = function(i) {
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				imgs[i] = null;
			},
			onload = function(i) {
				var oldBottom, hash = location.hash.match(/\d+/),
					post = findPost(links[i]),
					linkBeforeCurrentPost = hash ? +post.id.match(/\d+/)[0] < +hash[0] : false;
				if (linkBeforeCurrentPost) {
					oldBottom = post.getBoundingClientRect().bottom;
				}
				links[i].removeChild(links[i].getElementsByTagName('img')[0]);
				var hint = links[i].innerHTML;
				links[i].outerHTML = '<div class="img_container"><a id="link' + i + '" href="' + links[i].href + '" target="_blank" alt="' + worker.GUIp_i18n.open_in_a_new_tab + '"></a><div class="hint">' + hint + '</div></div>';
				imgs[i].alt = hint;
				var new_link = document.getElementById('link' + i),
					width = Math.min(imgs[i].width, 456),
					height = imgs[i].height*(imgs[i].width <= 456 ? 1 : 456/imgs[i].width);
				if (height < 1500) {
					new_link.insertAdjacentHTML('beforeend', '<div style="width: ' + width + 'px; height: ' + height + 'px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px;"></div>');
				} else {
					new_link.insertAdjacentHTML('beforeend', '<div style="width: ' + width + 'px; height: 750px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px;"></div>' +
															 '<div id="linkcrop' + i + '" style="width: ' + width + 'px; height: ' + (342*width/456) + 'px; background-image: url(' + worker.GUIp_getResource('images/crop.png') + '); background-size: ' + width + 'px; position: absolute; top: ' + (750 - 171*width/456) + 'px;"></div>' +
															 '<div style="width: ' + width + 'px; height: 750px; background-image: url(' + imgs[i].src + '); background-size: ' + width + 'px; background-position: 100% 100%;"></div>');
					if (worker.GUIp_browser === 'Opera') {
						worker.GUIp_getResource('images/crop.png',document.getElementById('linkcrop' + i));
					}
				}
				if (linkBeforeCurrentPost) {
					var diff = post.getBoundingClientRect().bottom - oldBottom;
					worker.console.log(hash, +post.id.match(/\d+/), linkBeforeCurrentPost, diff);
					worker.scrollTo(0, worker.scrollY + diff);
				}
			};
		for (i = 0, len = links.length; i < len; i++) {
			if (links[i].href.match(/jpe?g|png|gif/i)) {
				links[i].insertAdjacentHTML('beforeend', '<img class="img_spinner" src="/images/spinner.gif">');
				imgs[i] = document.createElement('img');
				imgs[i].onerror = onerror.bind(null, i);
				imgs[i].onload = onload.bind(null, i);
				imgs[i].src = links[i].href;
			}
		}
	}
};
var updatePostsNumber = function() {
	if (topics[topic]) {
		var page = location.search.match(/page=(\d+)/);
		page = page ? +page[1] - 1 : 0;
		var posts = page*25 + document.getElementsByClassName('post').length;
		var is_last_page = !document.querySelector('.next_page') || document.querySelector('.next_page.disabled');
		if (topics[topic].posts < posts) {
			topics[topic].posts = posts;
			var dates = document.getElementsByTagName('abbr');
			topics[topic].date = (new worker.Date(dates[dates.length - 1].title)).getTime();
			topics[topic].by = document.querySelectorAll('.fn > span:first-child > a')[dates.length - 1].textContent;
			storage.set('ForumSubscriptions', JSON.stringify(topics));
		}
		var informers = JSON.parse(storage.get('ForumInformers'));
		if (informers[topic] && (posts >= informers[topic].posts || is_last_page)) {
			informers[topic].obsolete = true;
			storage.set('ForumInformers', JSON.stringify(informers));
		}
	}
};
var improveTopic = function() {
	checkHash();
	picturesAutoreplace();
	updatePostsNumber();
};


// main code
var i, len, topic, isForum, isTopic, isSubs, topics;
var setInitVariables = function() {
	GUIp.common.forceDesktopPage();
	isForum = location.pathname.match(/forums\/show\//) !== null,
	isTopic = location.pathname.match(/topic/) !== null,
	isSubs = location.pathname.match(/forums\/show\/1/) && location.hash.match(/#guip_subscriptions/);
	storage.god_name = GUIp.common.getCurrentGodname();
	topics = JSON.parse(storage.get('ForumSubscriptions'));
};
var GUIp_forum = function() {
	try {
		if (!worker.GUIp_i18n || !worker.GUIp_browser || !worker.GUIp.common) { return; }
		worker.clearInterval(starter);

		setInitVariables();

		if (location.pathname.match(/\/news/) !== null) {
			return;
		}

		if (isSubs) {
			prepareSubscriptionsList();
		}

		if (isForum) {
			addSmallElements();
		}

		if (!isSubs && (isForum || isTopic)) {
			addLinks();
		}

		document.body.classList.add('forum');
		GUIp.common.addCSSFromURL(worker.GUIp_getResource('forum.css'), 'forum_css');
		GUIp.common.addCSSFromString(storage.get('UserCss'));
		GUIp.common.setPageBackground(storage.get('Option:useBackground'));

		if (isTopic) {
			addFormattingButtons();
			fixGodnamePaste();
			improveTopic();
		}

		if (topics && !isSubs && (isForum || isTopic)) {
			addSubscriptionsLink();
		}
	} catch(e) {
		worker.console.error(e);
	}
};
var starter = worker.setInterval(GUIp_forum, 100);



})();