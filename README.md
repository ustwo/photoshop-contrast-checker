# Photoshop Contrast Checker

Our vision is to make designers aware as early as possible in their design process on how to design for color vision deficiency (or color blindness) and provide the right tools for it.

### Usage

TBD

## Dependencies

* [Adobe Photoshop CC 2014 or later](http://www.adobe.com/uk/products/photoshop.html)
* [Node](https://nodejs.org/en/) (but only if you need to install more packages, otherwise bundled with Photoshop)

## Development

### Enable debug mode

In order to be able to run the extension without signing it, you'll have to set up debug mode in Creative Cloud.

First make sure to close all CC applications.

* On Mac, open the file `~/Library/Preferences/com.adobe.CSXS.#.plist` and add a row with key PlayerDebugMode, of type String, and value 1. Then in Terminal run `sudo killall cfprefsd` to refresh the property list cache.
* On Windows, open the registry key `HKEY_CURRENT_USER/Software/Adobe/CSXS.#` and add a key named PlayerDebugMode, of type String, and value 1.

Note: `#` is the number of your CSXS version.

More info on page 10 of the [USING THE ADOBE EXTENSION SDK guide](http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/creativesuite/pdfs/CC14_Extension_SDK.pdf)

### Copy the extension into place

Now that the system is ready to load the unsigned extension, the last thing you have to do is copy (or symlink) our extension into the shared extensions folder on disk:

* On Mac, copy the extension into `~/Library/Application Support/Adobe/CEP/extensions/` (or `/Library/Application Support/Adobe/CEP/extensions`)
* On Windows, copy the extension into `C:\<username>\AppData\Roaming\Adobe\CEP\extensions\` (or `C:\Program Files\Common Files\Adobe\CEP\extensions\`)

### Run and debug

You should be able to open the extension via `Window > Extensions` now.

To debug the running web app, open http://localhost:8088/ in Chrome.

### Read documentation

https://github.com/Adobe-CEP/CEP-Resources
http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/photoshop/pdfs/photoshop_scriptref_js.pdf

## Libraries & Submodules

* [Tinycolor 2](https://github.com/bgrins/TinyColor)

## Team
* [Juan Real](mailto:real@ustwo.com)
* [Daniel Demmel](mailto:dain@ustwo.com)
* [Elana J](mailto:elana@ustwo.com)
