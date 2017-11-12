const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const EOL = require('os').EOL;

module.exports = {
    saveSlice: (file, start, end, saveAs, done) => {
        const startParam = `-ss ${start}`;
        const endParam = end ? `-to ${end}` : '';
        const cutCmd = `ffmpeg -i ${file} ${startParam} ${endParam} -async 1 -c copy ${saveAs}`;
        exec(cutCmd, {windowsHide: true}, (err, stdout, stderr) => done(err));
    },

    combine: (partsDir, saveAs, done) => {
        fs.readdir(partsDir, (err, files) => {
            if (err) return done(err);

            const concatFilesList = 'concat-slices';
            fs.writeFile(path.join(partsDir, concatFilesList), files.map(file => `file '${path.join(partsDir, file)}'`).join(EOL), err => {
                if (err) return done(err);

                const concatCmd = `ffmpeg -y -f concat -safe 0 -i "${path.join(partsDir, concatFilesList)}" -c copy ${saveAs}`;
                exec(concatCmd, {windowsHide: true}, (err, stdout, stderr) => done(err));
            });
        });
    }
}
