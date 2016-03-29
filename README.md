# build-dir

> Get a place to put your build

## Why?

 - Fast and convenient, easy to set up.
 - Namespaces builds in a human-friendly manner.
 - Encourages cache-safe URLs.
 - Uses a solid convention, `build/<branch>/<version>`.
 - Gracefully handles edge cases for git branches.

## Install

````sh
npm install build-dir --save
````

## Usage

Get it into your program.
````javascript
const buildDir = require('build-dir');
````

Get a path to use when writing the build.
````javascript
buildDir.get().then(function (dirPath) {
   console.log(dirPath);
});
````

## Contributing
See our [contributing guidelines](https://github.com/sholladay/build-dir/blob/master/CONTRIBUTING.md "The guidelines for being involved in this project.") for more details.

1. [Fork it](https://github.com/sholladay/build-dir/fork).
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/build-dir/compare "Submit code to this repo now for review.").

## License
[MPL-2.0](https://github.com/sholladay/build-dir/blob/master/LICENSE "The license for build-dir.")

Go make something, dang it.
