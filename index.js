'use strict';

const
    branchName = require('branch-name'),
    readPkgUp = require('read-pkg-up'),
    path = require('path');

function getBuildDir() {
    return Promise.all([
            branchName.assumeMaster(),
            readPkgUp()
        ]).then(function (data) {
            const
                branch = data[0],
                version = data[1].pkg.version;

            return path.join('build', branch, version);
        });
}

module.exports = {
    get : getBuildDir
};
