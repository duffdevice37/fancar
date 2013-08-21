FanCar = function() {
    this.m_containerEl = document.querySelector('div.carousel');
    this.m_listEls = document.querySelectorAll('div.carousel li');

    this.m_currentOffset = 0;
    this.m_currentVelocity = 0;  // x pixels per second

    this.attachHandlers();

    this.calculateLayoutForCurrentWindowSize();

    this.doLayout();

    this.startUpdateTick();
}

// class constants
FanCar.prototype.kPaddingXFactor = 0.1;  // padding values specified as factors so it scales with window size.
FanCar.prototype.kPaddingYFactor = 0.2;

FanCar.prototype.attachHandlers = function() {
    var that = this;
    window.addEventListener('resize', function() {
	that.calculateLayoutForCurrentWindowSize();
	that.doLayout();
    });


    // TODO: input event handlers.
}

// cache layout-related values for the current window size.
FanCar.prototype.calculateLayoutForCurrentWindowSize = function() {
    var windowSize = Util.getWindowSize();

    var numEls = this.m_listEls.length;

    this.m_basePaddingX = windowSize.w * this.kPaddingXFactor;
    this.m_basePaddingY = windowSize.h * this.kPaddingYFactor;

    this.m_baseElementSize = windowSize.h - (2 * this.m_basePaddingY);  // elements are square so this is both width and height.

    this.m_totalListWidth = numEls * this.m_baseElementSize + ((numEls + 1) * this.m_basePaddingX);

    // assumption is that the carousel effect gradually zooms in the elements closest to the
    // center of the window, but each element's center point is fixed relative to the container.
    // this implies that as the centermost elements grow, the free space between them changes.
    // may look better to have the free space stay fixed/or have a more sophisticated model overall.
}

FanCar.prototype.doLayout = function() {
    // calculate and set l/t/w/h for each element
    for( var i = 0; i < this.m_listEls.length; ++i ) {
	var thisScale = 1;  // TODO scale grows when close to window center.
	var thisElementSize = thisScale * this.m_baseElementSize;
	var thisCenterX = this.m_basePaddingX + i * (this.m_basePaddingX + this.m_baseElementSize) + (this.m_baseElementSize / 2);
	var thisCenterY = this.m_basePaddingY + (this.m_baseElementSize / 2);

	var thisEl = this.m_listEls[i];
	thisEl.style.left = Math.round((thisCenterX - (thisElementSize / 2))) + 'px';
	thisEl.style.top  = Math.round((thisCenterY - (thisElementSize / 2))) + 'px';
	thisEl.style.width  = thisElementSize + 'px';
	thisEl.style.height = thisElementSize + 'px';
    }
    this.m_containerEl.style.width = this.m_totalListWidth + 'px';
}

FanCar.prototype.startUpdateTick = function() {
    // TODO: update offset for given velocity and time interval.
}

FanCar.prototype.show = function() {
    this.m_containerEl.style.display = 'inline-block';
}
