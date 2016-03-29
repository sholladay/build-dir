'use strict';

const
    branchName = require('branch-name'),
    readPkgUp = require('read-pkg-up'),
    path = require('path');

function getBuildDir() {
    return Promise.all([
        readPkgUp(),
        branchName.assumeMaster()
    ]).then(function (data) {
        const
            pkgData = data[0],
            currBranch = data[1],
            projectVersion = pkgData.pkg.version;

        return path.join('build', currBranch, projectVersion);
    });
}

module.exports = {
    get : getBuildDir
};
