'use strict';

module.exports = function ($, callback) {
    if (!$.auth.login) return callback(403);
    $.session.items = $.session.items || {};

    let id = $.post.id + '';
    if ($.session.items[id]) {
        delete $.session.items[id];
    } else {
        return callback(500);
    }

    callback(200);
};
