'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const fsAtomic = require('fs-atomic');
const mkdirtemp = require('mkdirtemp');
const buildData = require('build-data');
const buildPath = require('build-path');
const del = require('del');

const rename = util.promisify(fs.rename);

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
    const tempPath = await mkdirtemp();

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
