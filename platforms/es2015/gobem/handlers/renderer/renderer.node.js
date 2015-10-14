'use strict';

let path = require('path'),
    cache = new Map();

module.exports = function (app) {
    return function ($) {
        let destination = $.route.destination,
            handleError = error => {
                $.status = 500;
                $.next(error);
            },
            pageData = $.server.page || {},
            wrapperData = $.server.wrapper || {};

        destination.wrapper = ($.get.wrapper || destination.wrapper).toLowerCase();
        app.getPagePromise(`modules/${destination.page}+modules/${destination.wrapper}:`).then(pageFiles => {
            let pageTemplate = app.getTemplate(path.join('modules', destination.page, destination.page + '.jst')),
                pageContent = pageTemplate(pageData);

            wrapperData.title = $.server.title || '';
            wrapperData.url = $.route.url;
            wrapperData.client = $.client;
            wrapperData.content = pageContent;
            wrapperData.page = sortAndFilterFiles(pageFiles);

            if ($.get.wrapper) {
                $.echo(JSON.stringify(wrapperData));
                $.next();
            } else {
                app.getPagePromise(`modules/${destination.wrapper}+modules/${destination.wrapper}:`).then(wrapperFiles => {
                    wrapperData.wrapper = sortAndFilterFiles(wrapperFiles);
                    let wrapperTemplate = app.getTemplate(path.join('modules', destination.wrapper, destination.wrapper + '.jst')),
                        wrapperContent = wrapperTemplate(wrapperData);

                    $.echo(wrapperContent);
                    $.next();
                }).catch(handleError);
            }
        }).catch(handleError);
    };
};

function sortAndFilterFiles (unsortedFiles) {
    let cacheKey = unsortedFiles.toString(),
        cacheValue = cache.get(unsortedFiles);

    if (cacheValue) return cacheValue;

    let sortedFiles = {
            modules: [],
            scripts: [],
            services: [],
            styles: []
        };

    unsortedFiles.forEach(filePath => {
        let catName = getCatName(filePath);
        if (sortedFiles[catName]) sortedFiles[catName].push(filePath);
    });

    cacheValue = {
        files: {
            css: sortedFiles.styles,
            js: sortedFiles.scripts.concat(sortedFiles.services)
        },
        components: {
            css: filterByTech(sortedFiles.modules, '.styl.css'),
            js: filterByTech(sortedFiles.modules, '.js.html'),
            html: filterByTech(sortedFiles.modules, '.html')
        }
    };

    cache.set(cacheKey, cacheValue);
    return cacheValue;
};

function filterByTech (array, techName) {
    return array.filter(filePath => getTechName(filePath) === techName);
};

function getTechName (filePath) {
    let baseName = path.basename(filePath),
        delimIndex = baseName.indexOf('.');

    return ~delimIndex ? baseName.substr(delimIndex) : '';
};

function getCatName (filePath) {
    let catDelim = path.sep,
        delimIndex = filePath.indexOf(catDelim);

    return ~delimIndex ? filePath.substr(0, delimIndex) : filePath;
};
