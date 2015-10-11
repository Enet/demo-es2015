'use strict';

module.exports = function ($, callback) {
    let login = $.post.login,
        password = $.post.password;
    if ($.method === 'POST' && login === 'root' && password === 'toor') {
        $.cookie.set('login', login);
        callback(200, login);
    } else {
        $.cookie.set('login', '', 0);
        callback(403);
    }
};
