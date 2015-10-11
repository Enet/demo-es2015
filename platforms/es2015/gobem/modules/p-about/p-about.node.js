'use stirct';

module.exports = function (app) {
    return function ($) {
        $.server.title = 'About Project' + $.server.title;
        $.next();
    };
};
