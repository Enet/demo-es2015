'use strict';

module.exports = function (app) {
    return function ($) {
        $.auth = {
            login: $.cookie.get('login') || null
        };
        $.next();
    };
};
