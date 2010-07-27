(function($, undefined) {

var POINT_COUNT = 1000,
	points = new Array(POINT_COUNT),
	index = 0,
	X = 0,
	Y = 1,
	BUTTON_LEFT = 1,
	isLeftButtonDown = false,
	noRender = -1;

$.widget("ui.webSignature", {
	_create : function() {
		this._init;
	},

	_init : function() {
		this.element.addClass("pad");
		this.element.bind("mousemove", function(event) {
			event.preventDefault();
			if (index < POINT_COUNT && isLeftButtonDown) {
				points[index] = new Array(2);
				points[index][X] = event.pageX;
				points[index][Y] = event.pageY;
				index++;
			}
		});
		this.element.bind("mousemove", renderSig);
		this.element.bind("mousedown", function(event) {
			event.preventDefault();
			if (event.which == BUTTON_LEFT)
				isLeftButtonDown = true;
		});
		this.element.bind("mouseup", function(event) {
			event.preventDefault();
			isLeftButtonDown = false;
			points[index] = new Array(2);
			points[index][X] = noRender;
			points[index][Y] = noRender;
			index++;
		});
	},

	widget: function() {
		return this.element;
	}
});

var last = 0; // remember where we stopped
function renderSig() {
	if (!isLeftButtonDown)
		return;
	var currentIndex = index; // we don't want the end point to update during the for loop
	for (k = last, point = points[k]; k < currentIndex && point != null; point = points[++k]) {
		var currentX = point[X];
		var currentY = point[Y];
		var lookBehindX = 0;
		var lookBehindY = 0;
		if (points[k-1] != null) {
			lookBehindX = points[k-1][X];
			lookBehindY = points[k-1][Y];
			if (lookBehindX == noRender
				|| lookBehindY == noRender
				|| points[k][X] == noRender
				|| points[k][Y] == noRender) {
				k++;
				break;
			}
			var gapX = Math.abs(Math.abs(lookBehindX) - Math.abs(currentX));
			var gapY = Math.abs(Math.abs(lookBehindY) - Math.abs(currentY));
			var rise = Math.max(gapX, gapY);
			var run = Math.min(gapX, gapY);
			var slope = Math.round(Math.floor(rise)/Math.floor(run)) - 1; //Math.round(rise/run);
			//$("#output").append("currentX " + currentX + " currentY " + currentY + " lookBehindX " + lookBehindX + " lookBehindY " + lookBehindY + " rise " + rise + " run " + run + " slope " + slope + "<br />");
			var FILLER_COUNT = 100;
			var filler = new Array(FILLER_COUNT);
			var isXNegative = ((lookBehindX - currentX) < 0) ? true : false;
			var isYNegative = ((lookBehindY - currentY) < 0) ? true : false;
			var tempX = currentX;
			var tempY = currentY;
			for (i = 0, j = 1; i <= rise; i++) {
				filler[i] = new Array(2);
				if (j < slope) {
					if (isXNegative && !isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY;
						} else {
							filler[i][X] = tempX;
							filler[i][Y] = tempY++;
						}
					} else if (!isXNegative && isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY;
						} else {
							filler[i][X] = tempX;
							filler[i][Y] = tempY--;
						}
					} else if (isXNegative && isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY;
						} else {
							filler[i][X] = tempX;
							filler[i][Y] = tempY--;
						}
					} else {
						if (rise == gapX) {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY;
						} else {
							filler[i][X] = tempX;
							filler[i][Y] = tempY++;
						}
					}
					j++;
				} else {
					if (isXNegative && !isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY++;
						} else {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY++;
						}
					} else if (!isXNegative && isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY--;
						} else {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY--;
						}
					} else if (isXNegative && isYNegative) {
						if (rise == gapX) {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY--;
						} else {
							filler[i][X] = tempX--;
							filler[i][Y] = tempY--;
						}
					} else {
						if (rise == gapX) {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY++;
						} else {
							filler[i][X] = tempX++;
							filler[i][Y] = tempY++;
						}
					}
					j = 0;
				}
			}

			//$("#output").append(lookBehindX + ", " + lookBehindY + " ");
			for (point in filler) {
				//$("#output").append(filler[point][Y] + "y, " + filler[point][X] + "x<br />");
				$("<span></span>")
					.addClass("point")
					.css("top", filler[point][Y])
					.css("left", filler[point][X])
					.appendTo(this);
			}
		}
		$("<span></span>")
			.addClass("point")
			.css("top", currentY)
			.css("left", currentX)
			.appendTo(this);
	}
	last = k;
}

$.extend($.ui.webSignature);

})(jQuery);
