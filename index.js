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

buildDir.link = async (option) => {
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

    await fsAtomic.symlink(version, absBranchLatestLink);
    await fsAtomic.symlink(branchLatestPath, absLatestBuildLink);
};

buildDir.prepare = async (option) => {
    const config = Object.assign({}, option);
    const cwd = path.resolve(config.cwd || '');
    config.cwd = cwd;

    const data = await buildData(config);
    const tempPath = await mkdtemp();

    return {
        path : tempPath,
        async finalize() {
            const newPath = path.resolve(cwd, buildPath(data));
            await fsAtomic.mkdir(path.join(newPath, '..'));
            await del(newPath, {
                force : true
            });
            await rename(tempPath, newPath);
            await buildDir.link(Object.assign({ cwd }, data));
        }
    };
};

module.exports = buildDir;
