// suuuuper simple server to provide some basic ui
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const highlight = require('./highlight');

const port = 27015;

const serveApp = res => {
    res.writeHead(200, {'content-type': 'text/html'});
    fs.readFile('client/simple-client.html', 'utf8', (err, html) => {
        if (err) throw err;
        fs.readFile('client/app.js', 'utf8', (err, js) => {
            res.write(html.replace(/{appjs}/, js));
            res.end();
        });
    });
};

const probUserError = (err, res) => {
    res.writeHead(400);
    res.write(err.message);
    res.end();
};

http.createServer((req, res) => {
    if (req.method === 'GET') {
        const query = url.parse(req.url, true).query;

        if (query.root) {
            fs.readdir(query.root, (err, files) => {
                if (err) return probUserError(err, res);

                res.writeHead(200, {'content-type': 'application/json'});
                res.write(JSON.stringify(files));
                return res.end();
            });

        } else serveApp(res);

    } else if (req.method === 'POST') {
        let body = '';
        req.on('data', data => body += data);
        req.on('end', () => {
            try {
                const input = JSON.parse(body);
                highlight(input, err => {
                    if (err) return probUserError(err, res);

                    res.writeHead(204);
                    res.end();
                });
            } catch (e) {
                return probUserError(e, res);
            }
        });

    } else {
        res.writeHead(400);
        res.end();
    }

}).listen(port);

console.log(`Go to localhost:${port} in your browser.`);