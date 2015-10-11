'use strict';

let path = require('path');

module.exports = function (app) {
    let config = {uploadDir: path.join(app.config.gobem.rootDir, 'temp')};

    return function ($) {
        $.client = {};
        $.server = {};
        $.bus = {};

        $.parse($.next, config);
    };
};
