module.exports = function (app) {
    return function ($) {
        if (!$.auth.login) return $.next(new app.RedirectError(app.routes.auth));
        $.server.title = 'ToDo List' + $.server.title;

        $.server.page = {};
        $.server.page.items = $.session.items = $.session.items || {};
        $.next();
    };
};
