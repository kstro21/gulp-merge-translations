# gulp-merge-translations 
Do you use [angular-translate](https://github.com/angular-translate/angular-translate)? Do you use [angular-translate-loader-static-files](https://github.com/angular-translate/bower-angular-translate-loader-static-files)?
Then you can have translations files per module, merged into a single file per locale, configure [angular-translate](https://github.com/angular-translate/angular-translate) just once and make a single request to load translations.

<a href="#install">Install</a> |
<a href="#example">Example</a> |
<a href="#options">Options</a> |
<a href="#license">License</a>

----

## Install

Install with [npm](https://npmjs.org/package/gulp-merge-translations)

```
npm install gulp-merge-translations --save-dev
```

## Example
Suppose we have:
- /source/users/i18n_en.json
- /source/users/i18n_ar.json
- /source/dashboard/i18n_en.json
- /source/dashboard/i18n_ar.json

```js
import mergeTranslations from 'gulp-merge-translations';

gulp.task('default', function() {
  return gulp.src(source/**/*.json)
        .pipe(mergeTranslations())
        .pipe(gulp.dest('dist/i18n/'));
});
```

**Output**
- /dist/i18n/translations_en.json
- /dist/i18n/translations_ar.json

```js
angular.module("myModule", []).config(["$translateProvider", function($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        files: [
            {
                prefix: 'i18n/translations_',
                suffix: '.json'
            }
        ]
    });
}]);
```

## Options

gulp-merge-translations(`fileName` = 'translations', `settings` = {})

----

**fileName** {String} - Default: 'translations'  
The final file name will be `fileName` + `settings.sep` + '.json'

**settings** {Object} With the following options  
 - **getLocale** {Function} Received the path base name and must return the locale. Ex: 'i18n_en-US.json' return 'en-US'
 - **merge** {Function} Default: `Object.assign`
 - **sep** {String} Used to determine the locale in the file name. Also used to generate the output file name. Default: '_'
 - **jsonReplacer** {Function} See JSON.stringify for reference. Default: undefined
 - **jsonSpace** {Function} See JSON.stringify for reference. Pass a number or `\t` for debugging the output file. Default: undefined

 
More than an extension or lib, this is a way of using [angular-translate](https://github.com/angular-translate/angular-translate) and [angular-translate-loader-static-files](https://github.com/angular-translate/bower-angular-translate-loader-static-files) together. But, note that this is not bind to any of this libraries as we are merging raw json files, so, the way of use it is all up to you.


## License

MIT License

Copyright (c) 2017 [Castro Roy](https://www.linkedin.com/in/castro-roy-152936a1)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
