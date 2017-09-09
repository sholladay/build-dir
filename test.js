import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import test from 'ava';
import writePkg from 'write-pkg';
import mkdirtemp from 'mkdirtemp';
import buildDir from '.';

const mkdir = promisify(fs.mkdir);
const readlink = promisify(fs.readlink);
const stat = promisify(fs.stat);
const access = promisify(fs.access);

const pathExists = async (filePath) => {
    try {
        await access(filePath);
        return true;
    }
    catch (err) {
        return false;
    }
};

const isDirectory = async (filePath) => {
    const status = await stat(filePath);
    return status.isDirectory();
};

test('buildDir()', async (t) => {
    const dir = await buildDir();
    t.is(typeof dir, 'string');
    t.true(dir.startsWith('build'));
    t.true(dir.length > 0);
    t.truthy(dir);
    t.is(
        await buildDir({
            branch  : 'foo',
            version : 'bar'
        }),
        path.join('build', 'foo', 'bar')
    );
});

test('buildDir.latest()', async (t) => {
    const cwd = await mkdirtemp();
    await writePkg(cwd, { version : '1.0.0' });
    const build = await buildDir.prepare({ cwd });
    await build.finalize();
    const dir = await buildDir.latest({ cwd });
    t.is(dir, path.join('build', 'master', '1.0.0'));
});

test('buildDir.link()', async (t) => {
    const cwd = await mkdirtemp();
    await mkdir(path.join(cwd, 'build'));
    await mkdir(path.join(cwd, 'build', 'foo'));
    await buildDir.link({
        cwd,
        branch  : 'foo',
        version : 'bar'
    });
    const latestBuildTarget = await readlink(path.join(cwd, 'latest-build'));
    t.is(latestBuildTarget, path.join('build', 'foo', 'latest'));
    const branchLatestTarget = await readlink(path.join(cwd, 'build', 'foo', 'latest'));
    t.is(branchLatestTarget, 'bar');
});

test('buildDir.prepare()', async (t) => {
    const cwd = await mkdirtemp();
    const build = await buildDir.prepare({
        cwd,
        branch  : 'foo',
        version : 'bar'
    });
    t.is(typeof build.path, 'string');
    t.true(build.path.length > 0);
    t.true(await isDirectory(build.path));
    t.false(await pathExists(path.join(cwd, 'latest-build')));
    t.false(await pathExists(path.join(cwd, 'build')));
    await build.finalize();
    t.false(await pathExists(build.path));
    t.true(await isDirectory(path.join(cwd, 'build', 'foo', 'bar')));
    const latestBuildTarget = await readlink(path.join(cwd, 'latest-build'));
    t.is(latestBuildTarget, path.join('build', 'foo', 'latest'));
    const branchLatestTarget = await readlink(path.join(cwd, 'build', 'foo', 'latest'));
    t.is(branchLatestTarget, 'bar');
});
