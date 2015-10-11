'use strict';

module.exports = function ($, callback) {
    $.cookie.set('login', '', 0);
    callback(200);
};
