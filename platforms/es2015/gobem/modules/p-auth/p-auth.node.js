module.exports = function (app) {
    return function ($) {
        if ($.auth.login) return $.next(new app.RedirectError(app.routes.root));
        $.server.title = 'Authentication' + $.server.title;
        $.next();
    };
};
