'use strict';

const
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
    fsAtomic = require('fs-atomic'),
    branchName = require('branch-name'),
    readPkgUp = require('read-pkg-up'),
    del = require('del'),
    buildRoot = 'build';

function makeBuildPath(data) {
    return path.join(buildRoot, data.branch, data.version);
}

function getBuildData(known) {

    known = known || Object.create(null);

    return Promise.all([
            known.branch || branchName.assumeMaster(),
            known.version || readPkgUp().then((data) => {
                if (data && data.pkg) {
                    return data.pkg.version;
                }
                throw new TypeError(
                    'Unable to determine the project version.'
                );
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

        return new Promise((resolve, reject) => {

            fs.mkdtemp(path.join(os.tmpdir(), '/'), (err, tempPath) => {

                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    path : tempPath,
                    finalize() {
                        const newPath = makeBuildPath(data);
                        return fsAtomic.mkdir(path.dirname(newPath))
                            .then(() => {
                                return del(newPath);
                            })
                            .then(() => {
                                return new Promise((resolve, reject) => {
                                    fs.rename(tempPath, newPath, (err) => {
                                        if (err) {
                                            reject(err);
                                            return;
                                        }
                                        resolve();
                                    });
                                });
                            })
                            .then(() => {
                                return link(data);
                            });
                    }
                });
            });
        });
    });
}

module.exports = {
    get,
    link,
    prepare
};
