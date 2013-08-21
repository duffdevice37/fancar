// Carousel control implemented in javascript. Supports momentum and "magnetism" for pulling to discrete elements.
//  By Gideon Goodwin 8-21-2013
FanCar = function() {
    this.m_containerEl = document.querySelector('div.carousel');
    this.m_list = document.querySelector('div.carousel ul');
    this.m_listEls = document.querySelectorAll('div.carousel li');

    this.calculateLayoutForCurrentWindowSize();

    this.m_currentCenterPoint = this.calculateCenterPointForListEl(0);
    this.m_currentVelocity = 2000;  // x pixels per second

    this.m_lastDragInfo = null;
    this.attachHandlers();

    this.doLayout();
    this.startUpdateTick();
}

// class constants
// TODO: consider making x padding a fixed value instead. e.g. on ipad portrait mode this value calculates to be pretty small.
FanCar.prototype.kPaddingXFactor = 0.1;  // padding values specified as factors so it scales with window size.
FanCar.prototype.kPaddingYFactor = 0.2;
FanCar.prototype.kFrictionDecel = 1000;   // pixels per second^2

FanCar.prototype.attachHandlers = function() {
    var that = this;
    window.addEventListener('resize', function() {
	that.calculateLayoutForCurrentWindowSize();
	that.doLayout();
    });

    window.addEventListener('mousedown', function(e) {
	that.m_lastDragInfo = { x: e.pageX, time: Util.getCurrentTimeMs() };
	e.preventDefault();
	return false;
    });

    window.addEventListener('mousemove', function(e) {
	if (!that.m_lastDragInfo) {
	    return;
	}

	var lastDragInfo = that.m_lastDragInfo;
	var currentDragInfo = { x: e.pageX, time: Util.getCurrentTimeMs() };
	var elapsedS = (currentDragInfo.time - lastDragInfo.time) / 1000;
	that.m_currentVelocity = (lastDragInfo.x - currentDragInfo.x) / elapsedS;
	that.m_lastDragInfo = currentDragInfo;

	e.preventDefault();
	return false;
    });

    window.addEventListener('mouseup', function(e) {
	that.m_lastDragInfo = null;
	e.preventDefault();
	return false;
    });
}

// cache/set layout-related values for the current window size.
FanCar.prototype.calculateLayoutForCurrentWindowSize = function() {
    var windowSize = Util.getWindowSize();
    this.m_xCenterOffset = windowSize.w / 2;

    this.m_basePaddingX = windowSize.w * this.kPaddingXFactor;
    this.m_basePaddingY = windowSize.h * this.kPaddingYFactor;

    this.m_baseElementSize = windowSize.h - (2 * this.m_basePaddingY);  // elements are square so this is both width and height.

    var numEls = this.m_listEls.length;
    this.m_totalListWidth = numEls * this.m_baseElementSize + ((numEls + 1) * this.m_basePaddingX);
    this.m_list.style.width = this.m_totalListWidth + 'px';

    // assumption is that the carousel effect gradually zooms in the elements closest to the
    // center of the window, but each element's center point is fixed relative to the container.
    // this implies that as the centermost elements grow, the free space between them changes.
    // may look better to have the free space stay fixed/or have a more sophisticated model overall.
}

// returns the x offset into the list that should be centered for the i'th list element.
FanCar.prototype.calculateCenterPointForListEl = function(i) {
    return i * (this.m_baseElementSize + this.m_basePaddingX) + this.m_basePaddingX + (this.m_baseElementSize / 2);
}

FanCar.prototype.doLayout = function() {
    for( var i = 0; i < this.m_listEls.length; ++i ) {
	var thisScale = 1;  // TODO scale grows when close to window center.
	var thisElementSize = thisScale * this.m_baseElementSize;
	var thisCenterX = this.m_basePaddingX + i * (this.m_basePaddingX + this.m_baseElementSize) + (this.m_baseElementSize / 2);
	var thisCenterY = this.m_basePaddingY + (this.m_baseElementSize / 2);

	var thisEl = this.m_listEls[i];
	thisEl.style.left = Math.round((thisCenterX - (thisElementSize / 2))) + 'px';
	thisEl.style.top  = Math.round((thisCenterY - (thisElementSize / 2))) + 'px';
	thisEl.style.width  = Math.round(thisElementSize) + 'px';
	thisEl.style.height = Math.round(thisElementSize) + 'px';
    }
    this.m_list.style.left = Math.round(this.m_xCenterOffset - this.m_currentCenterPoint) + 'px';
}

FanCar.prototype.updateState = function(elapsedS) {
    if (this.m_currentVelocity === 0) {
	// not moving, nothing changed.
	return;
    }

    // use current velocity to update current screen centerpoint.
    var thisOffset = this.m_currentVelocity * elapsedS;
    this.m_currentCenterPoint += thisOffset;
    this.doLayout();

    // then update current velocity to simulate friction and magnetism.
    if (this.m_currentVelocity > 0) {
	this.m_currentVelocity = Math.max(0, this.m_currentVelocity - (elapsedS * this.kFrictionDecel));
    } else {
	this.m_currentVelocity = Math.min(0, this.m_currentVelocity + (elapsedS * this.kFrictionDecel));
    }

    // TODO magnetism. may want to skip this if currently dragging.
}

FanCar.prototype.startUpdateTick = function() {
    var that = this;
    var lastUpdateTime = null;

    var updateTick = function() {
	var now = Util.getCurrentTimeMs();
	if (lastUpdateTime === null) {
	    lastUpdateTime = now;
	    return;
	}

	var elapsedS = (now - lastUpdateTime) / 1000;
	that.updateState(elapsedS);
	lastUpdateTime = now;
    }

    // TODO: investigate onDisplayFrame event thingie.
    setInterval(updateTick, 16);
}

FanCar.prototype.show = function() {
    this.m_containerEl.style.display = 'inline-block';
}
