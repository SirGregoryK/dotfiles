(function() {
	var prefix = window.chrome.extension.getURL('');
	localStorage.setItem('eGUI_prefix', prefix);
	var scripts = {
		common: prefix + 'common.js',
		superhero: prefix + 'superhero.js',
		phrases_ru: prefix + 'phrases_ru.js',
		phrases_en: prefix + 'phrases_en.js',
		guip_chrome: prefix + 'guip_chrome.js',
		options_page: prefix + 'options_page.js',
		options: prefix + 'options.js',
		forum: prefix + 'forum.js',
		log: prefix + 'log.js',
		jsep: prefix + 'jsep.min.js'
	};
	function createScripts(urls, locale) {
		urls = [scripts.common, scripts.guip_chrome, scripts['phrases_' + locale]].concat(urls);
		for (var i = 0, len = urls.length; i < len; i++) {
			var scr = document.createElement('script');
			scr.type = 'text/javascript';
			scr.src = urls[i];
			scr.id = 'godville-ui-plus-' + i;
			scr.charset = 'UTF-8';
			document.head.appendChild(scr);
		}
	}
	function checkPathFor(locale) {
		var path = location.pathname;
		if (path.match(/^\/superhero/)) {
			createScripts([scripts.superhero, scripts.jsep], locale);
		} else if (path.match(/^\/user\/(?:profile|rk_success)/)) {
			createScripts([scripts.options_page, scripts.options, scripts.jsep], locale);
		} else if (path.match(/^\/(forums\/(show(?:\_topic)?\/\d+|subs|last_posts|last_subs|posts_by_god)|forums|news$)/)) {
			createScripts(scripts.forum, locale);
		} else if (path.match(/^\/duels\/log\//)) {
			createScripts(scripts.log, locale);
		}
	}

	var site = location.href;
	if (site.match(/^https?:\/\/(godville\.net|gdvl\.tk|gv\.erinome\.net)/)) {
		checkPathFor('ru');
	} else if (site.match(/^https?:\/\/(godvillegame\.com|gvg\.erinome\.net)/)) {
		checkPathFor('en');
	}
})();