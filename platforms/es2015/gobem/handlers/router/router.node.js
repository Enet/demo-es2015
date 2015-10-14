'use strict';

let alasym = require('alasym');
module.exports = function (app) {
    return function ($) {
        let route = alasym.matchURL(app.routes, $.url.pathname, $.method);
        if (route && route.destination && route.destination.page && route.destination.wrapper) {
            $.route = route;
        } else {
            $.route = app.routes.error;
        }
        $.next();
    };
};
