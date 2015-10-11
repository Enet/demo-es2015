module.exports = function (app) {
    return function ($) {
        $.server.title = 'Error' + $.server.title;
        $.next();
    };
};
