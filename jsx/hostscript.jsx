function convertTypeID (typeArray) {
	return typeIDToStringID(Number(typeArray));
}

function getForegroundColor() {
	return app.foregroundColor.rgb.hexValue;
}

function setForegroundColor(hex) {
	var solidColorRef = new SolidColor();
	solidColorRef.rgb.hexValue = hex;
	app.foregroundColor = solidColorRef;
}

function getBackgroundColor() {
	return app.backgroundColor.rgb.hexValue;
}

function setBackgroundColor(hex) {
	var solidColorRef = new SolidColor();
	solidColorRef.rgb.hexValue = hex;
	app.backgroundColor = solidColorRef;
}
