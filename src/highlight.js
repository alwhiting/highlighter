const ffmpeg = require('./ffmpeg');
const async = require('async');
const fs = require('fs');
const path = require('path');
const rmdir = require('./rmdir');

module.exports = (input, cb) => {
    const outputBasename = path.basename(input.output);
    const extIndex = outputBasename.lastIndexOf('.');
    const workDir = path.join(input.root, `processing-temp-${extIndex > -1 ? outputBasename.substring(0, outputBasename.lastIndexOf('.')) : outputBasename}-${Date.now()}`);

    fs.mkdir(workDir, err => {
        if (err) throw err;

        async.forEachOf(input.cuts,
            (cut, index, done) => ffmpeg.saveSlice(path.join(input.root, cut.file), cut.start, cut.end, path.join(workDir, `${index}.mp4`), done),
            err => {
                if (err) return cb(err);

                ffmpeg.combine(workDir, input.output, err => {
                    if (err) return cb(err);
                    rmdir(workDir, cb);
                });
            });
    });
};


