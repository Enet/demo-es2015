'use strict';

module.exports = function ($, callback) {
    if (!$.auth.login) return callback(403);
    $.session.items = $.session.items || {};

    let id = $.post.id + '';
    if ($.session.items[id]) {
        return callback(500);
    } else {
        $.session.items[id] = {
            text: $.post.text + '',
            completed: !!+$.post.completed
        };
    }


    callback(200);
};
