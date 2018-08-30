const PluginError = require('plugin-error');
const Vinyl = require('vinyl');
const path = require('path');
const through = require('through');

/**
 * Merge translations files
 *
 * @param fileName {String} Base file name, it will be used to generate a name based on locale detected in each file name.
 * @param settings {Object} Configuration object with the following options:
 *  - getLocale:    {Function} Get the locale from file name, see getLocale function.
 *  - merge:        {Function} Merge the json parsed objects, defaul Object.assign.
 *  - sep:          {String}   Mark where the locale is in the file name, also used to generate file. Defaul = '_'.
 *  - jsonReplacer: {Function} See JSON.stringify for reference.
 *  - jsonSpace:    {String}   See JSON.stringify for reference.
 * @returns {*}
 */
module.exports = function (fileName = 'translations', settings = {}) {
    const PLUGIN_NAME = 'gulp-merge-translations';

    const config = Object.assign({
        getLocale: getLocale,
        merge: Object.assign,
        sep: '_'
    }, settings);

    const filePattern = new RegExp(`${config.sep}(.+)\\.json$`);
    const mergeds = {};
    let fileInfo = null;

	function validFile(file) {
		if (file.isNull()) {
            this.queue(file);
        } else if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, `${PLUGIN_NAME} + : Streaming not supported!`));
        }
	}
	
	function setFileInfo(file) {
		if (!fileInfo) {
            fileInfo = file;
        }
	}
	
	function shouldIgnore(locale, contentString) {
		return !(locale && contentString.indexOf('{') === 0);
	}
	
    function mergeFile(file) {
        validFile.call(this, file);
        setFileInfo(file);

        const locale = config.getLocale(path.basename(file.path));
        const contentString = file.contents.toString('utf8').trim();

        if(shouldIgnore(locale, contentString)) {
            console.warn('WARNING: invalid file name, no locale can be found, ignoring file:', file.path);
        } else {
			let parsed = {};
			try {
				parsed = JSON.parse(contentString);

				mergeds[locale] = mergeds[locale] || {};

				config.merge(mergeds[locale], parsed);
			} catch(err) {
				this.emit('error', new PluginError(PLUGIN_NAME, `parsing ${file.path}: ${err.message}`));
			}
		}
    }

    /**
     * Build the files streams and emit them
     */
    function endStream() {
        Object.keys(mergeds).forEach((locale) => {
            const merged = mergeds[locale];
            const contents = JSON.stringify(merged, config.jsonReplacer, config.jsonSpace);

            this.emit('data', new Vinyl({
                cwd: fileInfo.cwd,
                base: fileInfo.base,
                path: path.join(fileInfo.base, `${fileName}${config.sep}${locale}.json`),
                contents: new Buffer(contents)
            }));
        });

        this.emit('end');
    }

    /**
     * Return an the locale code parsed from file name.
     * Ex:
     *  const fileBaseName = 'translation_en-US.json'
     *  console.log(getLocale(fileBaseName))
     *
     *  Output: 'en-US'
     *
     * @param fileBaseName {String} path.basename(file.path)
     * @returns {String}
     * @private
     */
    function getLocale(fileBaseName) {
        const matches = fileBaseName.match(filePattern);

        return matches && matches[1];
    }

    return through(mergeFile, endStream);
};
