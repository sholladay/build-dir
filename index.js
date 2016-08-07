'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const fsAtomic = require('fs-atomic');
const buildData = require('build-data');
const del = require('del');

const buildPath = (option) => {
    return path.join('build', option.branch, option.version);
};

const get = (option) => {
    return buildData(option).then((data) => {
        return buildPath(data);
    });
};

const link = (option) => {
    return buildData(option).then((data) => {
        const { branch, version } = data;
        const branchLatestDir = buildPath({
            branch,
            version : 'latest'
        });

        return fsAtomic.symlink(version, branchLatestDir).then(() => {
            return fsAtomic.symlink(branchLatestDir, 'latest-build');
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
    return buildData(option).then((data) => {
        return new Promise((resolve, reject) => {
            fs.mkdtemp(path.join(os.tmpdir(), '/'), (err, tempPath) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    path : tempPath,
                    finalize() {
                        const newPath = buildPath(data);
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
