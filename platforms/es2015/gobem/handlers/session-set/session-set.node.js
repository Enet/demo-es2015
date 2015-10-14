'use strict';

global[Symbol.for('__reddiz-session-set__')] && global[Symbol.for('__reddiz-session-set__')].end();
let reddiz = require('reddiz')();
global[Symbol.for('__reddiz-session-get__')] = global[Symbol.for('__reddiz-client__')];

module.exports = function (app) {
    let sessionConfig = app.config.session;
    return function ($) {
        let session = $[Symbol.for('__session__')],
            time = session.time,
            timeout = null,
            hasCustomTimeout = session.timeout !== undefined,
            needRefresh = sessionConfig.refresh || session.isNew || hasCustomTimeout;

        if (needRefresh) {
            time = Date.now();
            timeout = hasCustomTimeout ? session.timeout : sessionConfig.timeout;
            $.cookie.set(sessionConfig.cookie, session.id, timeout, '/');
        }

        reddiz
            .set(session.id, $.session, timeout, time)
            .then(() => $.next())
            .catch($.next);
    };
};
