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
			}

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
