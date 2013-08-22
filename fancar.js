// Carousel control implemented in javascript. Supports momentum and "magnetism" for pulling to discrete elements.
//  By Gideon Goodwin 8-21-2013
FanCar = function() {
    this.m_containerEl = document.querySelector('div.carousel');
    this.m_list = document.querySelector('div.carousel ul');
    this.m_listEls = document.querySelectorAll('div.carousel li');

    this.calculateLayoutForCurrentWindowSize();

    this.m_currentCenterOffset = this.calculateCenterOffsetForListEl(0);
    this.m_currentVelocity = 0;

    this.m_snapActive = false;

    this.m_lastDragInfo = null;
    this.m_dragging = false;
    this.attachHandlers();

    this.doLayout();
    this.startUpdateTick();
}

// class constants
FanCar.prototype.kPaddingXPixels = 100;
FanCar.prototype.kPaddingYFactor = 0.25;
FanCar.prototype.kFrictionDecel = 2500;   // pixels per second^2
FanCar.prototype.kCenterBubbleRangeFactor = 0.6;  // this fraction of width causes items to zoom in
FanCar.prototype.kCenterBubbleScale = 1.3;
FanCar.prototype.kSnapAccel = 120;
FanCar.prototype.kMaxVelocity = 8000;
FanCar.prototype.kSnapDebounceThreshold = 20;
FanCar.prototype.kSnapVelThreshold = 300;

FanCar.prototype.attachHandlers = function() {
    var that = this;
    window.addEventListener('resize', function() {
	that.calculateLayoutForCurrentWindowSize();
	that.doLayout();
    });

    window.addEventListener('mousedown', function(e) {
	that.m_lastDragInfo = { x: e.pageX, time: Util.getCurrentTimeMs() };
	that.m_dragging = true;
	e.preventDefault();
	return false;
    });

    window.addEventListener('mousemove', function(e) {
	if (!that.m_dragging) {
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
	that.m_dragging = false;
	e.preventDefault();
	return false;
    });
}

// cache/set layout-related values for the current window size.
FanCar.prototype.calculateLayoutForCurrentWindowSize = function() {
    var windowSize = Util.getWindowSize();
    this.m_xCenterOffset = windowSize.w / 2;

    // the range in the center of the screen in which elements zoom in.
    this.m_bubbleRangeAbs = this.kCenterBubbleRangeFactor * this.m_xCenterOffset;

    this.m_basePaddingX = this.kPaddingXPixels;
    this.m_basePaddingY = windowSize.h * this.kPaddingYFactor;

    this.m_baseElementSize = windowSize.h - (2 * this.m_basePaddingY);  // elements are square so this is both width and height.

    var numEls = this.m_listEls.length;
    this.m_totalListWidth = numEls * this.m_baseElementSize + ((numEls + 1) * this.m_basePaddingX);
    this.m_list.style.width = this.m_totalListWidth + 'px';
}

// returns the x offset into the list that should be centered for the i'th list element.
FanCar.prototype.calculateCenterOffsetForListEl = function(i) {
    return i * (this.m_baseElementSize + this.m_basePaddingX) + this.m_basePaddingX + (this.m_baseElementSize / 2);
}

// inverse of above, used for calculating nearest snap points.
FanCar.prototype.calculateListElIndexForOffset = function(offset) {
    return (offset - (this.m_baseElementSize / 2) - this.m_basePaddingX) / (this.m_baseElementSize + this.m_basePaddingX);
}

FanCar.prototype.getElScale = function(i)
{
    var thisElCenterPoint = this.m_basePaddingX + i * (this.m_baseElementSize + this.m_basePaddingX) + (this.m_baseElementSize / 2);
    var distanceToCenter = Math.abs(thisElCenterPoint - this.m_currentCenterOffset);
    var scaleFactor = Math.min(1, Math.max(0, (this.m_bubbleRangeAbs - distanceToCenter) / this.m_bubbleRangeAbs));

    // smooth using sin(x)...nah, doesn't feel right.
    // scaleFactor = scaleFactor * Math.PI / 2;
    // scaleFactor = Math.sin(scaleFactor);

    return Util.interpolate(1, this.kCenterBubbleScale, scaleFactor);
}

FanCar.prototype.doLayout = function() {
    for( var i = 0; i < this.m_listEls.length; ++i ) {
	var thisScale = this.getElScale(i);
	var thisElementSize = thisScale * this.m_baseElementSize;
	var thisCenterX = this.m_basePaddingX + i * (this.m_basePaddingX + this.m_baseElementSize) + (this.m_baseElementSize / 2);
	var thisCenterY = this.m_basePaddingY + (this.m_baseElementSize / 2);

	var thisEl = this.m_listEls[i];
	thisEl.style.left = Math.round((thisCenterX - (thisElementSize / 2))) + 'px';
	thisEl.style.top  = Math.round((thisCenterY - (thisElementSize / 2))) + 'px';
	thisEl.style.width  = Math.round(thisElementSize) + 'px';
	thisEl.style.height = Math.round(thisElementSize) + 'px';
    }
    this.m_list.style.left = Math.round(this.m_xCenterOffset - this.m_currentCenterOffset) + 'px';
}

FanCar.prototype.handleSnap = function() {
    var snapLeftIndex = Math.floor(this.calculateListElIndexForOffset(this.m_currentCenterOffset));
    snapLeftIndex = Math.max(0, Math.min(this.m_listEls.length - 1, snapLeftIndex));

    var leftOffset = this.calculateCenterOffsetForListEl(snapLeftIndex) - this.m_currentCenterOffset;
    var targetSnapOffset = leftOffset;
    var snapRightIndex = snapLeftIndex + 1;
    if (snapRightIndex < this.m_listEls.length) {
	var rightOffset = this.calculateCenterOffsetForListEl(snapRightIndex) - this.m_currentCenterOffset;
	if (Math.abs(rightOffset) < Math.abs(leftOffset)) {
	    targetSnapOffset = rightOffset;
	}
    }

    // within snap threshold?
    if (Math.abs(targetSnapOffset) < this.kSnapDebounceThreshold) {
	this.m_currentCenterOffset += targetSnapOffset;
	this.m_currentVelocity = 0;
	this.m_snapActive = false;
    } else {
	if (targetSnapOffset > 0) {
	    this.m_currentVelocity += this.kSnapAccel;
	} else if (targetSnapOffset < 0) {
	    this.m_currentVelocity -= this.kSnapAccel;
	}
    }
}

FanCar.prototype.updateState = function(elapsedS) {
    // update visible dom (only if velocity is nonzero).
    if (this.m_currentVelocity != 0) {
	var thisOffset = this.m_currentVelocity * elapsedS;
	this.m_currentCenterOffset += thisOffset;
	this.doLayout();
    }

    // update current velocity to simulate friction.
    if (this.m_currentVelocity > 0) {
	this.m_currentVelocity = Math.max(0, this.m_currentVelocity - (elapsedS * this.kFrictionDecel));
    } else {
	this.m_currentVelocity = Math.min(0, this.m_currentVelocity + (elapsedS * this.kFrictionDecel));
    }

    // potentially start a snap to an element's center position, but not if we are currently dragging, and
    //  only if our velocity has slowed enough for it to kick in.
    if (!this.m_dragging && Math.abs(this.m_currentVelocity) < this.kSnapVelThreshold) {
	this.m_snapActive = true;
    }

    if (this.m_snapActive) {
	this.handleSnap();
    }

    // clip
    this.m_currentVelocity = Math.min(this.kMaxVelocity, Math.max(-this.kMaxVelocity, this.m_currentVelocity));
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
