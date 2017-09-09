# build-dir [![Build status for build-dir](https://img.shields.io/circleci/project/sholladay/build-dir/master.svg "Build Status")](https://circleci.com/gh/sholladay/build-dir "Builds")

> Get a place to put your build

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
    // 'build/master/0.1.0'
});
```

Set up convenient `latest-build` and branch-specific `latest` links.

```js
buildDir.link({ branch : 'dev', version : '1.1.1' }).then(() => {
    console.log('Linking complete.')
    // latest-build -> build/dev/latest -> build/dev/1.1.1
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

Returns a `Promise` for a path to use for your build. Does **not** create the path on disk (use `prepare()` and/or `link()` for that). Defaults to the current branch of the `cwd` and a newly generated version.

### buildDir.latest(option)

Same as `buildDir()`, except the `branch` defaults to the most recently built branch and `version` defaults to the most recently built version of the `branch`.

### buildDir.link(option)

Returns a `Promise`. Within the `cwd`, writes a symlink at `latest-build` pointing to `build/<branch>/latest` and from there to `<version>`. No default `branch` or `version` is used, you must provide them, since linking requires an existing build path on disk and relevant build data.

### buildDir.prepare(option)

Returns a `Promise` for an object with these fields:

 - `path` is a newly created temporary directory for you to write the build to.
 - `finalize()` moves `path` to its [final location](https://github.com/sholladay/build-path) and runs `buildDir.link()` to point to it.

#### option

Type: `object`

[Build data](https://github.com/sholladay/build-data).

##### cwd

Type: `string`<br>
Default: `process.cwd()`

Parent directory of the build root. Used to determine `branch` and `version` information when they are not provided.

##### branch

Type: `string`

A git branch name. Unless otherwise specified, defaults to the HEAD branch of the `cwd`.

##### version

Type: `string`

A [build version](https://github.com/sholladay/build-version). Where necessary, one will be constructed for you based on package.json and git repository data.

## Related

 - [delivr](https://github.com/sholladay/delivr) - Build your code and ship it to [S3](https://aws.amazon.com/s3/)
 - [build-files](https://github.com/sholladay/build-files) - Read the files from your build
 - [build-keys](https://github.com/sholladay/build-keys) - Get the paths of files from your build
 - [build-data](https://github.com/sholladay/build-data) - Get metadata for your build
 - [build-path](https://github.com/sholladay/build-path) - Get a path for the given build
 - [build-version](https://github.com/sholladay/build-version) - Get a version for your build

## Contributing

See our [contributing guidelines](https://github.com/sholladay/build-dir/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/build-dir/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/build-dir/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/build-dir/blob/master/LICENSE "License for build-dir") © [Seth Holladay](https://seth-holladay.com "Author of build-dir")

Go make something, dang it.
