'use strict';
let path = require('path'),
    fs = require('fs'),
    async = require('async'),
    gobem = require('gobem'),
    justjst = require('justjst'),
    alasym = require('alasym'),
    reqponse = require('reqponse'),
    app;

app = {
    start: function () {
        let config = this.config = require(path.join(__dirname, 'config.json'));

        config.toLoad = config.toLoad.concat(
            Array
                .from(new Set(config.queue.content.concat(config.queue.api)))
                .map(handlerName => path.join('handlers', handlerName, handlerName + '.node.js'))
        );

        config.gobem.rootDir = path.join(__dirname, config.gobem.rootDir);
        config.gobem.extraArguments.push(this);
        config.gobem.beforeBuilding = beforeBuilding;
        config.gobem.afterBuilding = afterBuilding;
        config.gobem.rebuildByFile = config.toLoad.concat(config.gobem.rebuildByFile);

        gobem.configure(config.gobem).build();
        return this;
    },

    setHandler: function (name, handler) {
        this._handlers[name] = handler;
        return this;
    },

    getHandler: function (name) {
        return this._handlers[name];
    },

    setTemplate: function (name, template) {
        this._templates[name] = justjst(template);
        return this;
    },

    getTemplate: function (name) {
        return this._templates[name];
    },

    getPagePromise: function (name) {
        return gobem.use(name);
    },

    handleRequest: function (request, response) {
        let $ = new reqponse.Reqponse(request, response),
            queue = app.config.queue[$.url.splitted[0] === 'api' ? 'api' : 'content'],
            buildError = gobem.status();

        $.header.set('Content-Type', 'text/html; charset=UTF-8');
        buildError && $.error(buildError);

        async.eachSeries(queue, (handlerName, handlerNext) => {
            let handlerPath = path.join('handlers', handlerName, handlerName + '.node.js'),
                handler = app.getHandler(handlerPath);

            if (!handler) return handlerNext();
            $.next = handlerNext;
            try {
                handler($);
            } catch (error) {
                handlerNext(error);
            }
        }, error => {
            if (error instanceof app.RedirectError) {
                $.status = 302;
                $.header.set('Location', 'https://' + $.header.get('host') + error.url + $.url.parsed.search);
            } else if (error && error !== buildError) {
                $.error(error);
            }
            $.send();
        });
    },

    _templates: {},
    _handlers: {}
};

function getTechName (filePath) {
    let baseName = path.basename(filePath),
        delimIndex = baseName.indexOf('.');

    return ~delimIndex ? baseName.substr(delimIndex) : '';
};

function beforeBuilding (next, config) {
    async.each(app.config.toLoad, (relFilePath, fileNext) => {
        let filePath = path.join(config.rootDir, relFilePath),
            techName = getTechName(relFilePath);
        switch (techName) {
            case '.node.js':
                try {
                    delete require.cache[require.resolve(filePath)];
                    let handler = require(filePath)(app);
                    if (typeof handler === 'function') {
                        app.setHandler(relFilePath, handler);
                        fileNext();
                    } else {
                        fileNext(`Module of handler returns not a function! (path: ${relFilePath})`);
                    }
                } catch (error) {
                    fileNext(error);
                }
                break;
            case '.jst':
                fs.readFile(filePath, 'utf8', (error, fileContent) => {
                    app.setTemplate(relFilePath, fileContent || '');
                    fileNext(error);
                });
                break;
            case '.yml':
                alasym.loadConfig(filePath)
                    .then(routes => {
                        app.routes = routes;
                        fileNext();
                    })
                    .catch(fileNext);
                break;
        }
    }, next);
};

function afterBuilding (next, config) {
    next();
};

app.RedirectError = function (route) {
    this.url = typeof route === 'object' ? route.url : route;
};
app.RedirectError.prototype = new Error();

module.exports = app.start().handleRequest;
