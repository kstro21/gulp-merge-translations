const gutil = require('gulp-util');
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

    function mergeFile(file) {
        if (file.isNull()) {
            return this.queue(file);
        }

        if (file.isStream()) {
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME, PLUGIN_NAME + ': Streaming not supported!'));
        }

        const locale = config.getLocale(path.basename(file.path));

        if(!locale) {
            return gutil.log('WARNING: invalid file name, no locale can be found, ignoring file:', file.path);
        }

        if (!fileInfo) {
            fileInfo = file;
        }

        const contentString = file.contents.toString('utf8').trim();

        if(contentString.indexOf('{') !== 0) {
            return gutil.log('WARNING: file must only contain object as root, ignoring file:', file.path);
        }

        let parsed = {};
        try {
            parsed = JSON.parse(contentString);
        } catch(err) {
            err.message = 'ERROR: parsing ' + file.path + ': ' + err.message;
            return this.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
        }

        if(!mergeds[locale]) {
            mergeds[locale] = {};
        }

        config.merge(mergeds[locale], parsed);

    }

    /**
     * Build the files streams and emit them
     */
    function endStream() {
        Object.keys(mergeds).forEach((locale) => {
            const merged = mergeds[locale];
            const contents = JSON.stringify(merged, config.jsonReplacer, config.jsonSpace);

            this.emit('data', new gutil.File({
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
