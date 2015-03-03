var gulp = require('gulp');
var guilty = require('./guilty-gulp')({
	taskNameGroup: 'main',
	gulp: gulp,
	onError: function(e) {
		console.log(e.err.stack);
	}
});


// Optimizes and SVGs, copies across images.
guilty.requireTask('images');

// SCSS compiled using Compass and Autoprefixer.
guilty.requireTask('compass', {
	srcFilePath: 'styles/main.scss'
});

// Browserify, for javascript use 'js-browserify'
guilty.requireTask('js-browserify', {
	taskName: 'js-main',
	srcFilePath: 'index.js',
	destFilePath: 'main.js'
});

// dummy.js
guilty.requireTask('js-browserify', {
	taskName: 'js-dummy',
	srcFilePath: 'dummy/dummy.js',
	destFilePath: 'dummy.js'
});

// untitled.js
guilty.requireTask('js-browserify', {
	taskName: 'js-untitled',
	srcFilePath: 'dummy/untitled.js',
	destFilePath: 'untitled.js'
});

gulp.task(
	guilty.taskName('js'),
	guilty.taskName([
		'js-main',
		'js-dummy',
		'js-untitled'
	])
);

// Copies any html files straight across.
guilty.requireTask('html');


// Main task
gulp.task(
	guilty.taskNameGroup,
	// Adds the prefix to the tasks, in this case 'main-...'
	guilty.taskName([
		'images',
		'compass',
		'js',
		//'jst',
		//'vendor-js', // Use the taskName customized above from the 'copy' task
		'html'
	])
);

// Just run our group's main task
gulp.task(
	'default',
	[
		guilty.taskNameGroup
	]
);

// Guilty Gulp sets up a watch task for each group automatically.
// Easily add to this using guilty.addWatch(function)
gulp.task(
	'watch',
	[
		guilty.taskNameGroup,
		guilty.taskName('watch')
	]
);
