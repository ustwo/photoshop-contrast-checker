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

			var csInterface = new CSInterface();
			var apiMajorVersion = csInterface.getCurrentApiVersion().major;
			console.log("API version:", apiMajorVersion);
			var extensionId =  csInterface.getExtensionID();
			console.log("Extension ID:", extensionId);

			function getForegroundColor() {
				csInterface.evalScript("getForegroundColor()", function (color) {
					console.log("Got app foreground color", color);
					colors.fg = tinycolor("#" + color);
				});
			}

			function getBackgroundColor() {
				csInterface.evalScript("getBackgroundColor()", function (color) {
					console.log("Got app background color", color);
					colors.bg = tinycolor("#" + color);
					that.setColors();
					that.checkColors();
					that.updateColors();
				});
			}

			function PSCallback(csEvent) {
				getForegroundColor();
				getBackgroundColor();
			}

			// TODO: figure out why the new way doesn't want to work
			// See: http://www.davidebarranca.com/2015/09/html-panel-tips-18-photoshop-json-callback/
			//if (apiMajorVersion === 5) {
				csInterface.addEventListener("PhotoshopCallback", PSCallback);
			// } else {
			// 	csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, PSCallback);
			// }

			var event = new CSEvent("com.adobe.PhotoshopRegisterEvent", "APPLICATION");
			event.extensionId = extensionId;
			csInterface.dispatchEvent(event);

			jQuery(selectors.fg).spectrum({
				preferredFormat: "hex",
				showInput: true,
				showInitial: true,
			});

			jQuery(selectors.fg).on("change.spectrum", function(e, color) {
				console.log("New foreground color picked", color.toHex());
				csInterface.evalScript("setForegroundColor('" + color.toHex() + "')");
			});

			jQuery(selectors.bg).spectrum({
				preferredFormat: "hex",
				showInput: true,
				showInitial: true
			});

			jQuery(selectors.bg).on("change.spectrum", function( e, color) {
				console.log("New background color picked", color.toHex());
				csInterface.evalScript("setBackgroundColor('" + color.toHex() + "')");
			});

			jQuery("#foreground-color-variants").on("click", "li", function(e) {
				csInterface.evalScript("setForegroundColor('" + jQuery(this).data('color') + "')");
			});

			jQuery("#background-color-variants").on("click", "li", function(e) {
				csInterface.evalScript("setBackgroundColor('" + jQuery(this).data('color') + "')");
			});

			getForegroundColor();
			getBackgroundColor();
		},

		setColors: function() {
			jQuery(selectors.fg).spectrum("set", colors.fg);
			jQuery(selectors.bg).spectrum("set", colors.bg);
		},

		updateColors: function() {
			jQuery(selectors.fg).css({ backgroundColor: colors.fg.toHexString() });
			jQuery(selectors.labels.fg).html(colors.fg.toHexString().toUpperCase());

			jQuery(selectors.bg).css({ backgroundColor: colors.bg.toHexString() });
			jQuery(selectors.labels.bg).html(colors.bg.toHexString().toUpperCase());
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
				values.readability = tinycolor.readability(colors.fg, colors.bg);
				console.log("Color check results", values);
				this.generateVariations();
			}

			this.updateValues(values.readability);
		},

		generateVariations: function() {
			// these variables decide how the rendered variation grid will look
			var columns = 4;
			var rows = 4;
			var totalHeight = 100;
			var $foregroundVariantsParentElement = jQuery("#foreground-color-variants").empty();
			var $backgroundVariantsParentElement = jQuery("#background-color-variants").empty();

			// convert to HSV space as changing saturation and value is the best bet getting higher contrast
			var foregroundHSV = colors.fg.toHsv();
			var backgroundHSV = colors.bg.toHsv();

			// push away from color to the furthest corner in the color space to get the maximum difference (= maximum contrast)
			var foregroundValueDirection = (0.5 - backgroundHSV.v) * 1 / Math.abs(0.5 - backgroundHSV.v);
			var foregroundSaturationDirection = (0.5 - backgroundHSV.s) * 1 / Math.abs(0.5 - backgroundHSV.s);
			var backgroundValueDirection = (0.5 - foregroundHSV.v) * 1 / Math.abs(0.5 - foregroundHSV.v);
			var backgroundSaturationDirection = (0.5 - foregroundHSV.s) * 1 / Math.abs(0.5 - foregroundHSV.s);

			// find the difference between current the max / min values depending on which direction we need to go
			var foregroundValueSpace = foregroundValueDirection === 1 ? 1 - foregroundHSV.v : foregroundHSV.v;
			var foregroundSaturationSpace = foregroundSaturationDirection === 1 ? 1 - foregroundHSV.s : foregroundHSV.s;
			var backgroundValueSpace = backgroundValueDirection === 1 ? 1 - backgroundHSV.v : backgroundHSV.v;
			var backgroundSaturationSpace = backgroundSaturationDirection === 1 ? 1 - backgroundHSV.s : backgroundHSV.s;

			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < columns; j++) {
					// tweaked ratios, excluding extremes like 0 and 1
					var rowProgressRatio = (i + 1) / (rows + 1);
					var columnProgressRatio = (j + 1) / (columns + 1);

					// ready to calculate color values and render cells for foreground colors
					var newForegroundColor = tinycolor
						.fromRatio({
							h: foregroundHSV.h,
							s: foregroundHSV.s + foregroundSaturationSpace * rowProgressRatio * foregroundSaturationDirection,
							v: foregroundHSV.v + foregroundValueSpace * columnProgressRatio * foregroundValueDirection });
					var $foregroundColorElement = jQuery("<li></li>")
						.css({
							backgroundColor: '#'+newForegroundColor.toHex(),
							width: 100 / columns + '%',
							height: totalHeight / rows + 'px'
						})
						.data('color', newForegroundColor.toHex());
					$foregroundVariantsParentElement.append($foregroundColorElement);

					// ready to calculate color values and render cells for background colors
					var newBackgroundColor = tinycolor
						.fromRatio({
							h: backgroundHSV.h,
							s: backgroundHSV.s + backgroundSaturationSpace * rowProgressRatio * backgroundSaturationDirection,
							v: backgroundHSV.v + backgroundValueSpace * columnProgressRatio * backgroundValueDirection });
					var $backgroundColorElement = jQuery("<li></li>")
						.css({
							backgroundColor: '#'+newBackgroundColor.toHex(),
							width: 100 / columns + '%',
							height: totalHeight / rows + 'px'
						})
						.data('color', newBackgroundColor.toHex());
					$backgroundVariantsParentElement.append($backgroundColorElement);
				}
			}
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
