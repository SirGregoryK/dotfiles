window.GUIp_browser = 'Chrome';
window.GUIp_getResource = function(res) {
	return localStorage.getItem('eGUI_prefix') + res;
};
