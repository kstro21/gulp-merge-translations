const mergeTranslations = require('../');
const File = require('vinyl');
const path = require('path');

require('jasmine');

describe('gulp-merge-translations', () => {

    const file1 = new File({
      path: '/home/file1_es-ES.json',
      contents: new Buffer('{"name": "Nombre", "age": "Edad"}')
    });

    const file2 = new File({
      path: '/home/file2_es-ES.json',
      contents: new Buffer('{"family": "Familia"}')
    });

    const file3 = new File({
      path: '/home/file3_en-US.json',
      contents: new Buffer('{"family": "Family"}')
    });

    const file4 = new File({
      path: '/home/file4_en-US.json',
      contents: new Buffer('{"friend": "Friend"}')
    });

    it('should successfully merge files by locale', (done) => {
        const stream = mergeTranslations();
        let count = 0;

        stream.on('data', function(nfile){
            const fileJson = JSON.parse(nfile.contents.toString());
            ++count;

            expect(nfile).toBeDefined();
            expect(fileJson).toBeDefined();


            switch (count) {
                case 1:
                    expect(path.basename(nfile.path)).toEqual('translations_es-ES.json');
                    expect(fileJson.name).toBeDefined();
                    expect(fileJson.name).toEqual('Nombre');
                    expect(fileJson.age).toBeDefined();
                    expect(fileJson.age).toEqual('Edad');
                    expect(fileJson.family).toBeDefined();
                    expect(fileJson.family).toEqual('Familia');
                    break;
                case 2:
                    expect(path.basename(nfile.path)).toEqual('translations_en-US.json');
                    expect(fileJson.friend).toBeDefined();
                    expect(fileJson.friend).toEqual('Friend');
                    expect(fileJson.family).toBeDefined();
                    expect(fileJson.family).toEqual('Family');
                    break;
            }
        });

        stream.on('end', function(){
            expect(count).toEqual(2);
            done();
        });

        stream.write(file1);
        stream.write(file2);

        stream.write(file3);
        stream.write(file4);

        stream.end();
    });

    it('should change the file name', (done) => {
        const stream = mergeTranslations('locale');

        stream.on('data', function(nfile){
            expect(nfile).toBeDefined();
            expect(path.basename(nfile.path)).toEqual('locale_es-ES.json');
        });

        stream.on('end', function(){
            done();
        });

        stream.write(file1);
        stream.write(file2);

        stream.end();
    });

    it('should call custom getLocale function', (done) => {
        const config = {
            getLocale: function () {
                return 'en-UK';
            }
        };

        spyOn(config, 'getLocale').and.callThrough();;

        const stream = mergeTranslations('locale', config);

        stream.on('data', function(nfile){
            expect(nfile).toBeDefined();
            expect(path.basename(nfile.path)).toEqual('locale_en-UK.json');
        });

        stream.on('end', function(){
            expect(config.getLocale).toHaveBeenCalled();
            done();
        });

        stream.write(file1);
        stream.write(file2);

        stream.end();
    });

});
