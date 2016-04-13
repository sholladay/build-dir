'use strict';

const
    branchName = require('branch-name'),
    readPkgUp = require('read-pkg-up'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    fsAtomic = require('fs-atomic'),
    buildRoot = 'build';

function makeBuildPath(data) {
    return path.join(buildRoot, data.branch, data.version);
}

function getBuildData(known) {

    known = known || Object.create(null);

    return Promise.all([
            known.branch || branchName.assumeMaster(),
            known.version || readPkgUp().then((data) => {
                return data.pkg.version;
            })
        ]).then((data) => {
            return {
                branch  : data[0],
                version : data[1]
            };
        });
}

function get(known) {
    return getBuildData(known).then((data) => {
            return makeBuildPath(data);
        });
}

function link(known) {
    return getBuildData(known).then((data) => {
        const
            branch = data.branch,
            version = data.version,
            branchLatestPath = path.join(buildRoot, branch, 'latest');

        return fsAtomic.symlink(version, branchLatestPath)
            .then(() => {
                return fsAtomic.symlink(branchLatestPath, 'latest-build');
            });
    });
}

function prepare(known) {
    return getBuildData(known).then((data) => {
        return new Promise((resolve) => {
            const prefix = path.join(os.tmpdir(), '/');
            fs.mkdtemp(prefix, (err, tempPath) => {
                if (err) {
                    throw err;
                }
                resolve({
                    path : tempPath,
                    finalize : () => {
                        return (new Promise((resolve) => {
                            const newPath = makeBuildPath(data);
                            fs.rename(tempPath, newPath, (err) => {
                                if (err) {
                                    throw err;
                                }
                                resolve();
                            });
                        })).then(() => {
                            return link(data);
                        });
                    }
                });
            });
        });
    });
}

module.exports = {
    // TODO: Use the shorthand syntax here when Node.js upgrades V8
    //       to a version that does not throw a SyntaxError.
    get : get,
    link,
    prepare
};
