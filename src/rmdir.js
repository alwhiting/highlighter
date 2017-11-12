const async = require('async');
const fs = require('fs');
const path = require('path');

module.exports = (dir, done) => {
    fs.readdir(dir, (err, files) => {
        if (err) return done(err);

        async.each(files, (file, done) => {
            fs.unlink(path.join(dir, file), done);

        }, (err) => {
            if (err) return done(err);
            fs.rmdir(dir, done);
        });
    });
};
