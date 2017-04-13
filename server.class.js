/**
 * This is a basic Express server.  We'll build in this class in future 
 * modules.
 * @class
 */
class Server {
    constructor() {
        this.express = require('express');
        this.app = this.express();
        this.setupRoutes();
        this.startServer();
    }

    /**
     * Sets up the necessary routing.
     */
    setupRoutes() {
        this.app.use(this.express.static(__dirname + '/www'));
        this.app.use(this.express.static(__dirname + '/module1/www'));
        this.app.use(this.express.static(__dirname + '/module2/www'));
        this.app.use(this.express.static(__dirname + '/module3/www'));
        this.app.use(this.express.static(__dirname + '/module4/www'));
        this.app.use(this.express.static(__dirname + '/module5/www'));
        this.app.use(this.express.static(__dirname + '/projects/www'));
        this.app.use(this.express.static(__dirname + '/module1/frontend'));
        this.app.use(this.express.static(__dirname + '/module2/frontend'));
        this.app.use(this.express.static(__dirname + '/module3/frontend'));
        this.app.use(this.express.static(__dirname + '/module4/frontend'));
        this.app.use(this.express.static(__dirname + '/module5/frontend'));
        
        this.app.all('/meta/*', function(req, res, next) {
            var path = req.path.substr('/meta/'.length);
            var dirname = require('path').dirname(path);
            var filename = require('path').basename(path);
            if (require('fs').existsSync(dirname + '/meta.json')) {
                res.send(require('fs').readFileSync(dirname + '/meta.json', 
                    'utf8'));
            }
            else {
                res.send('{}');
            }
        });

        this.app.all('/readings/*', function(req, res, next) {
            var path = req.path.substr('/readings/'.length);
            var dirname = require('path').dirname(path);
            var filename = require('path').basename(path);
                filename = filename.split('.');
                filename.splice(-1, 0, 'modified');
                filename = filename.join('.');
            try {
                if (require('fs').existsSync(dirname + '/' + 
                    filename)) {
                        res.send(require('fs').readFileSync(dirname + '/' + 
                            filename, 'utf8'));
                    } else {
                        res.send(require('fs').readFileSync(__dirname + '/' + 
                            path, 'utf8'));
                    }
            } catch(e) {
                res.send('');
            }
        });
        
        this.app.all('/reset/*', function(req, res, next) {
            var path = req.path.substr('/reset/'.length);
            var dirname = require('path').dirname(path);
            var filename = require('path').basename(path);
                filename = filename.split('.');
                filename.splice(-1, 0, 'modified');
                filename = filename.join('.');
            try {
                if (require('fs').existsSync(__dirname + '/' + dirname + '/' + 
                    filename)) {
                        require('fs').unlinkSync(__dirname + '/' + dirname + 
                            '/' + filename);
                    } else {
                        console.info('An error: file not found?');
                    }
                res.send();
            } catch(e) {
                res.send('');
            }
        });
        
        this.app.all('/run/*', function(req, res, next) {
            res.send('Node runner is being worked on.  Check back soon.');
            return;
            // TODO:
            var status = '';
            var file = req.path.substr('/run/'.length);
            // open the log file for writing
            var log = __dirname + '/' + file.replace(/\\/g, '/')
                .replace(/\//g, '_') + '.log';
            require('fs').writeFileSync(log, '');
            var ws = require('fs').createWriteStream(log);
            let original = process.stdout.write;
            process.stdout.write = process.stderr.write = ws.write.bind(ws);

            // run the file now
            require(__dirname + '/' + file);
            
            // begin the read
            let sent = false;
            var rs = require('fs').createReadStream(log);
            res.set('etag', (new Date()).getTime());
            rs.on('data', function(data) {
                res.write(data);
            });
            rs.on('end', function() {
                res.end();
                try {require('fs').unlinkSync(log);} catch(e) {console.log(e);}
                try {ws.end();} catch(e) {console.log(e);}
                process.stdout.write = process.stderr.write = original;
                sent = true;
            });
            setTimeout(() => {
                if (!sent) {
                    rs.pause();
                    ws.end();
                    res.send();
                    try {require('fs').unlinkSync(log);} catch(e) {}
                }
            }, 60000);
        });
        
        this.app.post('/save/*', function(req, res, next) {
            var path = req.path.substr('/save/'.length);
            var dirname = require('path').dirname(path);
            var filename = require('path').basename(path);
            let data = '';
            req.on('data', function(datum) {
                data += datum;
            });
            req.on('end', function() {
                filename = filename.split('.');
                filename.splice(-1, 0, 'modified');
                filename = filename.join('.');
                require('fs').writeFileSync(dirname + '/' + filename, data);
                res.send();
            });
        });
    }

    /**
     * Starts an Express.js server.  If port 3000 is not open, throws an error.
     * @return {Promise} A promise that resolves when the server is up, throws
     * if port 3000 is occupied or some other error occurs.
     */
    startServer() {
        return new Promise((resolve, reject) => {
            try {
                this.app.listen(3000, function() {
                    console.info('Server listening on port 3000');
                    resolve();
                });
            } catch(e) {
                console.warn()
                reject(e);
            }
        });
    }
}

module.exports = Server;