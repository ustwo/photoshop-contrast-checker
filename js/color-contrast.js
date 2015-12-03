jQuery("#btn_reload").click( function () {
	window.location.reload();
});

var tinycolor = require("tinycolor2");

var colorContrast = (function() {
	var colors = {
			fg: "",
			bg: ""
		},
		values = {
			AAsmall : false,
			AAlarge : false,
			AAAsmall : false,
			AAAlarge : false,
			readability : 0
		},
		$slider = jQuery("#slider").slider({
			max: 21,
			disabled: true
		}),
		selectors = {
			fg: "#fg-selector",
			bg: "#bg-selector",
			value: "#contrast-value",
			accessibleLevels: "#accessible-levels",
			sliderHandle: ".ui-slider-handle",
			classes : {
				success: "success",
				failed: "failed"
			},
			result: {
				aaSmall:  "#aa-small-result",
				aaLarge:  "#aa-large-result",
				aaaSmall: "#aaa-small-result",
				aaaLarge: "#aaa-large-result",
			},
			labels : {
				fg: "#fg-label",
				bg: "#bg-label"
			}
		};

	return {
		init: function() {
			var that = this;

			this.getColors();
			this.checkColors();
			this.updateColors();

			jQuery("#fg-selector").spectrum({
				color: colors.fg
			});

			jQuery("#fg-selector").on("move.spectrum", function(e, color) {
				colors.fg = tinycolor(jQuery(selectors.labels.fg).html());

				jQuery(selectors.fg).css({ backgroundColor: color.toHexString() });
				jQuery(selectors.labels.fg).html(color.toHexString());

				that.checkColors();
			});

			jQuery("#bg-selector").spectrum({
				color: colors.bg
			});

			jQuery("#bg-selector").on("move.spectrum", function( e, color) {
				colors.bg = tinycolor(jQuery(selectors.labels.bg).html());

				jQuery(selectors.bg).css({ backgroundColor: color.toHexString() });
				jQuery(selectors.labels.bg).html(color.toHexString());

				that.checkColors();
			});
		},

		getColors: function() {
			colors.fg = tinycolor(jQuery(selectors.labels.fg).html());
			colors.bg = tinycolor(jQuery(selectors.labels.bg).html());
		},

		updateColors: function() {

			jQuery(selectors.fg).css({ backgroundColor: colors.fg.toHexString() });
			jQuery(selectors.labels.fg).html(colors.fg.toHexString());

			jQuery(selectors.bg).css({ backgroundColor: colors.bg.toHexString() });
			jQuery(selectors.labels.bg).html(colors.bg.toHexString());
		},

		areColorsValid: function() {
			return (colors.fg.isValid()) && (colors.bg.isValid());
		},

		checkColors: function() {
			if (this.areColorsValid()) {
				values.AAsmall = tinycolor.isReadable(colors.fg, colors.bg, {level: "AA", size:"small"});
				values.AAlarge = tinycolor.isReadable(colors.fg, colors.bg, {level: "AA", size:"large"});
				values.AAAsmall = tinycolor.isReadable(colors.fg, colors.bg, {level: "AAA", size:"small"});
				values.AAAlarge = tinycolor.isReadable(colors.fg, colors.bg, {level: "AAA", size:"large"});
				console.log(values);
			}

			values.readability = tinycolor.readability(colors.fg, colors.bg);

			this.updateValues(values.readability);
		},

		areNotAccessible: function() {
			return (!values.AAsmall && !values.AAlarge && !values.AAAsmall && !values.AAAlarge);
		},

		removeAndAddClass: function(classToApply) {
			jQuery(selectors.sliderHandle).removeClass(selectors.classes.success);
			jQuery(selectors.sliderHandle).removeClass(selectors.classes.failed);
			jQuery(selectors.sliderHandle).addClass(classToApply);
		},

		updateValues: function(num) {
			if (num !== undefined && $slider !== undefined) {
				$slider.slider("value", num);
				jQuery(selectors.value).html(num.toFixed(2));
			}

			if (this.areNotAccessible()) {
				this.removeAndAddClass(selectors.classes.failed);
			} else {
				var classes = [selectors.result.aaSmall, selectors.result.aaLarge, selectors.result.aaaSmall, selectors.result.aaaLarge ];

				for (i in classes) {
					jQuery(classes[i]).removeClass(selectors.classes.success);
					jQuery(classes[i]).removeClass(selectors.classes.failed);
				}

				this.removeAndAddClass(selectors.classes.success);
			}

			if (values.AAsmall ? jQuery(selectors.result.aaSmall).addClass(selectors.classes.success) : jQuery(selectors.result.aaSmall).addClass(selectors.classes.failed));
			if (values.AAlarge ? jQuery(selectors.result.aaLarge).addClass(selectors.classes.success) : jQuery(selectors.result.aaLarge).addClass(selectors.classes.failed));
			if (values.AAAsmall ? jQuery(selectors.result.aaaSmall).addClass(selectors.classes.success) : jQuery(selectors.result.aaaSmall).addClass(selectors.classes.failed));
			if (values.AAAlarge ? jQuery(selectors.result.aaaLarge).addClass(selectors.classes.success) : jQuery(selectors.result.aaaLarge).addClass(selectors.classes.failed));
		}
	}
}());

colorContrast.init();
