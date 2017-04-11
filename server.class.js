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

        this.app.all('/readings/*', function(req, res, next) {
            res.send(require('fs').readFileSync(__dirname + '/' + 
                req.path.substr('/readings/'.length), 'utf8'));
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