'use strict';

let path = require('path');

module.exports = function (app) {
    return function ($) {
        try {
            let wrapper = $.route.destination.wrapper;
            if (wrapper) {
                app.getHandler(path.join('modules', wrapper, wrapper + '.node.js'))($);
            } else {
                $.next();
            }
        } catch (error) {
            $.next(error);
        }
    };
};
