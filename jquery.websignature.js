(function($, undefined) {

var points,
	index = 0,
	X = 0,
	Y = 1,
	BUTTON_LEFT = 1,
	isLeftButtonDown = false,
	noRender = -1;

$.widget("ui.webSignature", {
	options : {
		signature : null,
		ajaxOptions : null
	},

	_create : function() {
		this._init;
	},

	_getOffsetLeft : function() {
		return this.element.offset().left;
	},

	_getOffsetTop : function() {
		return this.element.offset().top;
	},

	load : function(array) {
		if (Array.isArray(array))
			for (p in array)
				this._paint(array[p][X], array[p][Y]);
		else
			this._load();
	},

	_load : function() {
		var self = this,
			o = this.options;
		if (o.ajaxOptions == null)
			return;
		this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
			url: o.ajaxOptions.url,
			success: function(r) {
				array = r.signature;
				for (p in array)
					self._paint(array[p][X], array[p][Y]);
			},
			error: function(r) {
				;
			}
		}));
	},

	_createPoint : function(x, y) {
		point = new Array(2);
		point[X] = parseInt(x);
		point[Y] = parseInt(y);
		return point;
	},

	_fill : function(currentX, currentY, lookBehindX, lookBehindY) {
		var tempX = currentX,
			tempY = currentY,
			isXNegative = ((lookBehindX - currentX) < 0) ? true : false,
			isYNegative = ((lookBehindY - currentY) < 0) ? true : false,
			gapX = this._gap(lookBehindX, currentX),
			gapY = this._gap(lookBehindY, currentY),
			rise = Math.max(gapX, gapY);
			s = this._slope(gapX, gapY);
		this._paint(currentX, currentY);
		for (j = 0, i = 0; i < rise; i++) {
			if (j < s) {
				if (isXNegative && !isYNegative) {
					if (rise == gapX) {
						tempX--;
						tempY;
					} else {
						tempX;
						tempY++;
					}
				} else if (!isXNegative && isYNegative) {
					if (rise == gapX) {
						tempX++;
						tempY;
					} else {
						tempX;
						tempY--;
					}
				} else if (isXNegative && isYNegative) {
					if (rise == gapX) {
						tempX--;
						tempY;
					} else {
						tempX;
						tempY--;
					}
				} else {
					if (rise == gapX) {
						tempX++;
						tempY;
					} else {
						tempX;
						tempY++;
					}
				}
				j++;
			} else {
				if (isXNegative && !isYNegative) {
					if (rise == gapX) {
						tempX--;
						tempY++;
					} else {
						tempX--;
						tempY++;
					}
				} else if (!isXNegative && isYNegative) {
					if (rise == gapX) {
						tempX++;
						tempY--;
					} else {
						tempX++;
						tempY--;
					}
				} else if (isXNegative && isYNegative) {
					if (rise == gapX) {
						tempX--;
						tempY--;
					} else {
						tempX--;
						tempY--;
					}
				} else {
					if (rise == gapX) {
						tempX++;
						tempY++;
					} else {
						tempX++;
						tempY++;
					}
				}
				j = 0;
			}
			this._paint(tempX, tempY);
		}
	},

	_gap : function(c1, c2) {
		return Math.abs(Math.abs(c1) - Math.abs(c2));
	},

	_slope : function(x, y) {
		return Math.round(Math.max(x, y)/Math.min(x, y));
	},

	_lastPoint : null,

	_getLastPoint : function() {
		return this._lastPoint;
	},

	_setLastPoint : function(point) {
		this._lastPoint = point;
	},

	_render : function(point, element) {
		var currentX = point[X];
		var currentY = point[Y];
		var lookBehindX = 0;
		var lookBehindY = 0;
		if (this._getLastPoint() != null) {
			lookBehindX = this._getLastPoint()[X];
			lookBehindY = this._getLastPoint()[Y];
			if (lookBehindX != noRender
				&& lookBehindY != noRender
				&& currentX != noRender
				&& currentY != noRender) {
				this._fill(currentX, currentY, lookBehindX, lookBehindY);
			} else if (currentX != noRender && currentY != noRender) {
				this._paint(currentX, currentY);
			}
		} else {
			this._paint(currentX, currentY);
		}
		this._setLastPoint(point);
	},

	_init : function() {
		var self = this
			o = this.options;
		if (o.signature != null)
			points = o.signature;
		self.element.addClass("pad");
		self.element.bind("mousemove.webSignature", function(event) {
			event.preventDefault();
			if (isLeftButtonDown) {
				point = self._createPoint(event.pageX - self._getOffsetLeft(), event.pageY - self._getOffsetTop());
				self._render(point, self.element);
			}
		});
		self.element.bind("mousedown.webSignature", function(event) {
			event.preventDefault();
			if (event.which == BUTTON_LEFT) {
				isLeftButtonDown = true;
				point = self._createPoint(event.pageX - self._getOffsetLeft(), event.pageY - self._getOffsetTop());
				self._render(point, self.element);
			}
		});
		self.element.bind("mouseup.webSignature", function(event) {
			event.preventDefault();
			if (isLeftButtonDown) {
				isLeftButtonDown = false;
				point = self._createPoint(noRender, noRender);
				self._render(point, self.element);
			}
		});
	},

	_paint : function(x, y) {
		point = this._createPoint(x, y);
		$("<span></span>")
			.addClass("point")
			.css("top", point[Y] + this._getOffsetTop())
			.css("left", point[X] + this._getOffsetLeft())
			.appendTo(this.element);
		if (points != null && index < points.length)
			points[index++] = point;
		else if (points != null) {
			points.length *= 2;
			points[index++] = point;
		}
	},

	widget: function() {
		return this.element;
	}
});

$.extend($.ui.webSignature);

})(jQuery);
