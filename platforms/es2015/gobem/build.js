'use strict';

let path = require('path');

module.exports = function (app) {
    let cacheDir = path.join(app.config.gobem.rootDir, 'cache');

    return [
        ['select', 0, /^modules\/([pw]-\w+)\/\1\.node\.js$/],
        ['gobem-proc-set-handler', app.setHandler, [app]],

        ['select', 0, /^modules\/([pw]-\w+)\/\1\.jst$/],
        ['gobem-proc-justjst', app.setTemplate],

        ['select', 0, /[^.]+\.css$/],
        ['gobem-proc-filter'],
        ['write', 10],

        ['select', 0, /[^.]+\.styl$/],
        ['gobem-proc-filter'],
        ['gobem-proc-stylus', {
            commonStylus: 'styles/common/common',
            cacheDir
        }],
        ['gobem-proc-sqwish', {
            cacheDir
        }],
        ['write', 10],

        ['select', 0, /[^.]+\.js$/],
        ['write', 1],

        ['select', 0, /^modules\/[^.]+\.(js|styl|html)$/],
        ['gobem-proc-component'],
        ['write', 1],

        ['select', 1, /^[^.]+\.html$/],
        ['write', 10],

        ['select', 1, /^[^.]+\.js$/],
        ['gobem-proc-serve', 'beat.serveFunction([$SERVICES], ($ARGUMENTS) => {', '});\n'],
        ['gobem-proc-prettydiff', {
            cacheDir
        }],
        ['gobem-proc-filter'],
        ['gobem-proc-wrap-script'],
        ['write', 10]
    ];
};
