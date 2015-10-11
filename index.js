'use strict';

let fs = require('fs'),
    path = require('path'),
    cluster = require('cluster'),
    cpus = require('os').cpus().length,
    stream = fs.createWriteStream(path.join(__dirname, 'debug.log'), {flags: 'a'}),
    config = require(path.join(__dirname, 'config.json'));

if (cluster.isMaster) {

    for (let c = 0; c < Math.max(1, Math.min(cpus, config.maxCPUs)); c++) {
        cluster.fork();
        log(0, 'Worker has started!', null);
    }

    cluster.on('exit', (worker, code, signal) => {
        log(1, `Worker ${worker.process.pid} has died! (signal: ${signal})`, null);
        cluster.fork();
        log(0, 'Worker has started!', null);
    });

} else {

    let http = require('http'),
        chokidar = require('chokidar'),
        platforms = {};

    chokidar.watch(path.join(path.normalize(config.rootDir), '*', config.platformFileName), {
        depth: 1
    }).on('all', (event, platformFilePath) => {
        let platformPath = path.dirname(platformFilePath),
            platformName = path.basename(platformPath);

        switch (event) {
            case 'add':
                addPlatform(platformPath, platformName);
                break;
            case 'change':
                removePlatform(platformPath, platformName);
                addPlatform(platformPath, platformName);
                break;
            case 'unlink':
                removePlatform(platformPath, platformName);
                break;
        }
    });

    http.createServer((request, response) => {
        let platformName = request.headers['x-platform'],
            platform = platforms[platformName];

        if (typeof platform === 'function') {
            try {
                platform(request, response, platformName);
                log(0, 'Request was delegated to platform.', platformName);
            } catch (error) {
                log(1, 'Error occured during request processing.', platformName, error);
            }
        } else {
            response.setHeader('Content-Type', 'text/plain');
            response.write((platform ? 'Platform is not a function.' : 'Platform is not found.') + ` (host: ${platformName})`);
            response.end();
        }
    }).listen(config.serverPort, (error) => {
        log(error ? 1 : 0, `Server has ${error ? 'not ' : ''}started! (port: ${config.serverPort})`);
    });

    process.on('uncaughtException', function (error) {
        log(1, 'Uncaught exception occured!', null, error);
    });

    function addPlatform (platformPath, platformName) {
        let indexFilePath = path.join(platformPath, config.indexFileName);
        try {
            platforms[platformName] = require(indexFilePath);
            log(0, 'Platform was created successfully!', platformName);
        } catch (error) {
            log(1, 'Index file could not be loaded for platform!', platformName, error);
        }
    };

    function removePlatform (platformPath, platformName) {
        for (let c in require.cache) {
            if (c.substr(0, platformPath.length + 1) === platformPath + '/') delete require.cache[c];
        }
        delete platforms[platformName];
        log(0, 'Platform was removed successfully!', platformName);
    };

}

function log (status, message, platformName, error) {
    status = status ? 'error' : 'info';
    if (platformName) message += ` (platform: ${platformName})`;
    if (error) message += `\n${error.stack}`;
    message = `${new Date().toLocaleString()} :: ${status} :: ${message}\n${'='.repeat(60)}`;
    console[status](message);
    stream.write(message + '\n');
};
