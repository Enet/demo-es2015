'use strict';

let path = require('path');

module.exports = function (app) {
    return function ($) {
        try {
            let page = $.route.destination.page;
            app.getHandler(path.join('modules', page, page + '.node.js'))($);
        } catch (error) {
            $.next(error);
        }
    };
};
