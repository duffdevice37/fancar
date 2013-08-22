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

    requestAnimFrame: function(cb) {
	if (window.requestAnimationFrame) {
	    window.requestAnimationFrame(cb);
	} else if (window.webkitRequestAnimationFrame) {
	    window.webkitRequestAnimationFrame(cb);
	} else if (window.mozRequestAnimationFrame) {
	    window.mozRequestAnimationFrame(cb);
	} else {
	    window.setTimeout(cb, 1000 / 60);
	}
    },
};
