'use strict';

const
    branchName = require('branch-name'),
    readPkgUp = require('read-pkg-up'),
    path = require('path'),
    fs = require('fs'),
    buildRoot = 'build';

function getBuildData(known) {

    known = known || Object.create(null);

    return Promise.all([
            known.branch || branchName.assumeMaster(),
            known.version || readPkgUp().then((data) => {
                return data.pkg.version;
            })
        ]).then(function (data) {
            return {
                branch  : data[0],
                version : data[1]
            };
        });
}

function get(known) {
    return getBuildData(known).then((data) => {
            const
                branch = data.branch,
                version = data.version;

            return path.join(buildRoot, branch, version);
        });
}

function link() {
    return getBuildData().then((data) => {
        const
            branch = data.branch,
            version = data.version,
            branchLatestPath = path.join(buildRoot, branch, 'latest');

        return new Promise((resolve) => {
            fs.symlink(version, branchLatestPath, (err) => {
                if (err) {
                    throw err;
                }
                fs.symlink(branchLatestPath, 'latest-build', (err) => {
                    if (err) {
                        throw err;
                    }
                    resolve();
                });
            });
        });
    });
}

module.exports = {
    // TODO: Use the shorthand syntax here when Node.js upgrades V8
    //       to a version that does not throw a SyntaxError.
    get : get,
    link
};
