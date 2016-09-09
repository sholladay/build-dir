# build-dir [![Build status for build-dir on Circle CI.](https://img.shields.io/circleci/project/sholladay/build-dir/master.svg "Circle Build Status")](https://circleci.com/gh/sholladay/build-dir "Build Dir Builds")

> Get a place to put your build.

## Why?

 - Fast and convenient, easy to set up.
 - Namespaces builds in a human-friendly manner.
 - Encourages cache-safe URLs.
 - Uses a solid convention, `build/<branch>/<version>`.
 - Gracefully handles edge cases for git branches.

## Install

```sh
npm install build-dir --save
```

## Usage

Get it into your program.

```js
const buildDir = require('build-dir');
```

Get a path to use when writing the build.

```js
buildDir().then((dirPath) => {
    console.log('Build directory:', dirPath);
    // 'build/master/1.0.0'
});
```

Get the path that was used for the most recent build.

```js
buildDir.latest().then((dirPath) => {
    console.log('Build directory:', dirPath);
});
```

Set up convenient `latest-build` and branch-specific `latest` links.

```js
buildDir.link().then(() => {
    console.log('Linking complete.')
    // latest-build -> build/<branch>/latest -> build/<branch>/<version>
});
```

Let us manage the lifecycle steps for you.

```js
buildDir.prepare().then((dir) => {
    // Put stuff in here:
    console.log('Temp dir:', dir.path);

    // ... some time later ...

    // Move the temp dir to its permanent home and set up
    // latest links.
    return dir.finalize();
});
```

## API

### buildDir(option)

#### option

Type: `object`

[Build data](https://github.com/sholladay/build-data).

##### cwd

Type: `string`<br>
Default: `process.cwd()`

The parent directory of the build root.

##### branch

Type: `string`

Use the given branch name, instead of asking git.

##### version

Type: `string`

Use the given version, instead of asking [build-version](https://github.com/sholladay/build-version).

### buildDir.latest(option)

Same as `buildDir()`, except the `branch` defaults to the most recently built branch and `version` defaults to the most recently built version of the `branch`.

### buildDir.link(option)

Takes `cwd`, `branch`, and `version` on the option object.

Within the `cwd`, writes a symlink at `latest-build` pointing to `build/<branch>/latest` and from there to `version`.

### buildDir.prepare(option)

Returns a promise for an object with these fields:

 - `path` is a newly created temporary directory for you to write the build to.
 - `finalize()` moves `path` to its final location and runs `buildDir.link()` on it.

## Related

 - [build-version](https://github.com/sholladay/build-version) - Get a version for your build.
 - [build-data](https://github.com/sholladay/build-data) - Get metadata for your build.
 - [build-path](https://github.com/sholladay/build-path) - Get a path for the given build.
 - [build-keys](https://github.com/sholladay/build-keys) - Get the paths of files from your build.
 - [build-files](https://github.com/sholladay/build-files) - Read the files from your build.

## Contributing

See our [contributing guidelines](https://github.com/sholladay/build-dir/blob/master/CONTRIBUTING.md "The guidelines for participating in this project.") for more details.

1. [Fork it](https://github.com/sholladay/build-dir/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/build-dir/compare "Submit code to this project for review.").

## License

[MPL-2.0](https://github.com/sholladay/build-dir/blob/master/LICENSE "The license for build-dir.") © [Seth Holladay](http://seth-holladay.com "Author of build-dir.")

Go make something, dang it.
