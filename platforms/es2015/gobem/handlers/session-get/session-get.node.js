'use strict';

global[Symbol.for('__reddiz-session-get__')] && global[Symbol.for('__reddiz-session-get__')].end();

let crypto = require('crypto'),
    reddiz = require('reddiz')();

global[Symbol.for('__reddiz-session-get__')] = global[Symbol.for('__reddiz-client__')];

module.exports = function (app) {
    let sessionConfig = app.config.session;
    return function ($) {
        function next (session) {
            $[Symbol.for('__session__')] = session;
            $.session = session.data;
            $.next();
        };

        reddiz
            .get($.cookie.get(sessionConfig.cookie))
            .then(session => {
                if (session) {
                    next(session);
                } else {
                    let time = Date.now(),
                        hash = crypto.createHash('md5');

                    hash.update(Math.random().toString());
                    let id = hash.digest('hex') + '#' + time;

                    reddiz
                        .set(id, {}, time, sessionConfig.timeout)
                        .then(next)
                        .catch($.next);
                }
            })
            .catch($.next);
    };
};
