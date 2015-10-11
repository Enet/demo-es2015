'use strict';

let path = require('path'),
    chokidar = require('chokidar');

global[Symbol(__filename)] && global[Symbol(__filename)].close();
global[Symbol(__filename)] = chokidar.watch(__dirname, {
    ignoreInitial: true
}).on('all', function onFileChange (event, filePath) {
    if (filePath !== __filename) delete require.cache[filePath];
});

module.exports = function (app) {
    return function ($) {
        let filePath = mapURItoFS($.url.path);
        try {
            let handler = require(filePath);
            handler($, (status, data) => {
                $.status = status;
                $.echo(JSON.stringify(arguments.length === 1 ? '' : data));
                $.next();
            });
        } catch (error) {
            $.status = 500;
            $.next(error);
        };
    };
};

function mapURItoFS (uri) {
    uri = (uri + '').replace('/api/', '');
    let filePath = path.join(__dirname, path.normalize(uri));
    if (filePath === __filename || path.relative(__dirname, filePath).indexOf('..') === 0) {
        return null;
    } else {
        return filePath;
    }
};
