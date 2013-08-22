var Util = {
    log: function(str) {
	console.log(str);
    },

    assert: function(condition, str) {
	if(!condition) {
	    console.log('ASSERT FAILED: ' + str);
	    debugger;
	}
    },

    getWindowSize: function() {
	// from http://stackoverflow.com/questions/3437786/how-to-get-web-page-size-browser-window-size-screen-size-in-a-cross-browser-wa
	var w = window,
	d = document,
	e = d.documentElement,
	g = d.getElementsByTagName('body')[0],
	x = w.innerWidth || e.clientWidth || g.clientWidth,
	y = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return {w: x, h: y};
    },

    getCurrentTimeMs: function() {
	return (new Date()).getTime();
    },

    interpolate: function(min, max, factor) {
	return factor * (max - min) + min;
    },

    // TODO consider adding bind() here
};
