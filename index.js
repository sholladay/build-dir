'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const fsAtomic = require('fs-atomic');
const branchName = require('branch-name');
const readPkgUp = require('read-pkg-up');
const del = require('del');

const buildRoot = 'build';

const makeBuildPath = (data) => {
    return path.join(buildRoot, data.branch, data.version);
};

const getBuildData = (option) => {
    const config = Object.assign({}, option);
    return Promise.all([
        config.branch || branchName.assumeMaster(),
        config.version || readPkgUp().then((data) => {
            if (data && data.pkg) {
                return data.pkg.version;
            }
            throw new TypeError(
                'Unable to determine the project version.'
            );
        })
    ])
        .then((data) => {
            return {
                branch  : data[0],
                version : data[1]
            };
        });
};

const get = (option) => {
    return getBuildData(option).then((data) => {
        return makeBuildPath(data);
    });
};

const link = (option) => {
    return getBuildData(option).then((data) => {
        const { branch, version } = data;
        const branchLatestPath = path.join(buildRoot, branch, 'latest');

        return fsAtomic.symlink(version, branchLatestPath).then(() => {
            return fsAtomic.symlink(branchLatestPath, 'latest-build');
        });
    });
};

const rename = (oldPath, newPath) => {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

const prepare = (option) => {
    return getBuildData(option).then((data) => {
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
                                return rename(tempPath, newPath);
                            })
                            .then(() => {
                                return link(data);
                            });
                    }
                });
            });
        });
    });
};

module.exports = {
    get,
    link,
    prepare
};
