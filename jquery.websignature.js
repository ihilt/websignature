(function($, undefined) {

var points,
	index = 0,
	X = 0,
	Y = 1,
	BUTTON_LEFT = 1,
	isLeftButtonDown = false,
	noRender = -1,
	offsetLeft = 0,
	offsetTop = 0;

$.widget("ui.webSignature", {
	options : {
		signature : null,
		ajaxOptions : null
	},

	_create : function() {
		this._init;
	},

	load : function() {
		var self = this,
			o = this.options;
		if (o.ajaxOptions == null)
			return;
		this.xhr = $.ajax($.extend({}, o.ajaxOptions, {
			url: o.ajaxOptions.url,
			success: function(r) {
				array = r.signature;
				for (p in array)
					self.paint(array[p][X], array[p][Y]);
			},
			error: function(r) {
				;
			}
		}));
	},

	createPoint : function(x, y) {
		point = new Array(2);
		point[X] = parseInt(x);
		point[Y] = parseInt(y);
		return point;
	},

	fill : function(currentX, currentY, lookBehindX, lookBehindY) {
		var tempX = currentX,
			tempY = currentY,
			isXNegative = ((lookBehindX - currentX) < 0) ? true : false,
			isYNegative = ((lookBehindY - currentY) < 0) ? true : false,
			gapX = this.gap(lookBehindX, currentX),
			gapY = this.gap(lookBehindY, currentY),
			rise = Math.max(gapX, gapY);
			s = this.slope(gapX, gapY);
		this.paint(currentX, currentY);
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
			this.paint(tempX, tempY);
		}
	},

	gap : function(c1, c2) {
		return Math.abs(Math.abs(c1) - Math.abs(c2));
	},

	slope : function(x, y) {
		return Math.round(Math.max(x, y)/Math.min(x, y));
	},

	lastPoint : null,

	getLastPoint : function() {
		return this.lastPoint;
	},

	setLastPoint : function(point) {
		this.lastPoint = point;
	},

	render : function(point, element) {
		var currentX = point[X];
		var currentY = point[Y];
		var lookBehindX = 0;
		var lookBehindY = 0;
		if (this.getLastPoint() != null) {
			lookBehindX = this.getLastPoint()[X];
			lookBehindY = this.getLastPoint()[Y];
			if (lookBehindX != noRender
				&& lookBehindY != noRender
				&& currentX != noRender
				&& currentY != noRender) {
				this.fill(currentX, currentY, lookBehindX, lookBehindY);
			} else if (currentX != noRender && currentY != noRender) {
				this.paint(currentX, currentY);
			}
		} else {
			this.paint(currentX, currentY);
		}
		this.setLastPoint(point);
	},

	_init : function() {
		this.load();
		var self = this
			o = this.options;
		points = o.signature;
		offsetTop = self.element.offset().top;
		offsetLeft = self.element.offset().left;
		self.element.addClass("pad");
		self.element.bind("mousemove.webSignature", function(event) {
			event.preventDefault();
			if (isLeftButtonDown) {
				point = self.createPoint(event.pageX - offsetLeft, event.pageY - offsetTop);
				self.render(point, self.element);
			}
		});
		self.element.bind("mousedown.webSignature", function(event) {
			event.preventDefault();
			if (event.which == BUTTON_LEFT) {
				isLeftButtonDown = true;
				point = self.createPoint(event.pageX - offsetLeft, event.pageY - offsetTop);
				self.render(point, self.element);
			}
		});
		self.element.bind("mouseup.webSignature", function(event) {
			event.preventDefault();
			if (isLeftButtonDown) {
				isLeftButtonDown = false;
				point = self.createPoint(noRender, noRender);
				self.render(point, self.element);
			}
		});
	},

	paint : function(x, y) {
		point = this.createPoint(x, y);
		$("<span></span>")
			.addClass("point")
			.css("top", point[Y] + offsetTop)
			.css("left", point[X] + offsetLeft)
			.appendTo(this.element);
		if (points != null && index < points.length)
			points[index++] = point;
	},

	widget: function() {
		return this.element;
	}
});

$.extend($.ui.webSignature);

})(jQuery);
