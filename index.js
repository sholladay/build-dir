'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const fsAtomic = require('fs-atomic');
const buildData = require('build-data');
const buildPath = require('build-path');
const del = require('del');

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

const mkdtemp = () => {
    return new Promise((resolve, reject) => {
        fs.mkdtemp(path.join(os.tmpdir(), '/'), (err, tempPath) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tempPath);
        });
    });
};

const buildDir = (option) => {
    return buildData(option).then(buildPath);
};

buildDir.latest = (option) => {
    return buildData.latest(option).then(buildPath);
};

buildDir.link = (option) => {
    const config = Object.assign({}, option);
    const { branch, version } = config;

    if (!branch) {
        throw new TypeError('A branch is required to create the build path.');
    }
    if (!version) {
        throw new TypeError('A version is required to create the build path');
    }

    const cwd = path.resolve(config.cwd || '');

    const branchLatestPath = buildPath({
        branch,
        version : 'latest'
    });

    const absBranchLatestLink = path.resolve(cwd, branchLatestPath);

    const absLatestBuildLink = path.resolve(cwd, 'latest-build');

    return fsAtomic.symlink(version, absBranchLatestLink).then(() => {
        return fsAtomic.symlink(branchLatestPath, absLatestBuildLink);
    });
};

buildDir.prepare = (option) => {
    const config = Object.assign({}, option);
    const cwd = config.cwd = path.resolve(config.cwd || '');

    return buildData(config).then((data) => {
        return mkdtemp().then((tempPath) => {
            return {
                path : tempPath,
                finalize() {
                    const newPath = path.resolve(cwd, buildPath(data));
                    return fsAtomic.mkdir(path.dirname(newPath))
                        .then(() => {
                            return del(newPath, {
                                force : true
                            });
                        })
                        .then(() => {
                            return rename(tempPath, newPath);
                        })
                        .then(() => {
                            return buildDir.link(Object.assign({ cwd }, data));
                        });
                }
            };
        });
    });
};

module.exports = buildDir;
