Guilty Gulp
===========

Gulp set up for web assets. Conveniently create tasks for Browserify, CoffeeScript, Compass (SCSS), SVG.

#### For a full example, see the [gulpfile-example.js](gulpfile-example.js) file.

### Create multiple groups of tasks, each with their own individual settings

```JavaScript
var guilty = require('./guilty-gulp')({
	taskNameGroup: 'main'
});
```

### Extensible tasks, and watch tasks built-in

Create multiple variations of any task.
Specify a `taskName`, which you can then use using `guilty.taskName('myTaskName')`.
Watch tasks are automatically created based on the paths you specified.

```JavaScript
guilty.requireTask('copy', {
	taskName: 'vendor-js',
	srcPathGlob: 'vendor-js/porthole.min.js',
	destPath: './'
});
```

### Separate file for each task

### Production and Development

It has separate production and development folders, just use the flag `--production` to build to a separate folder with minified CSS and JS.

### Build from scratch

Clean by using the flag `--clean`
