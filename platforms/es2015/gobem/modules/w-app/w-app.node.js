module.exports = function (app) {
    return function ($) {
        $.server.title = ' :: Demo App';
        $.server.wrapper = {};
        $.server.wrapper.auth = $.client.auth = $.auth;
        $.next();
    };
};
