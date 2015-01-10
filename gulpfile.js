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
	srcFilePath: 'styles/main.scss',
	destCSSPath: './'
});

// Browserify, for javascript use 'js-browserify'
guilty.requireTask('js-browserify', {
	srcFilePath: 'index.js',
	destFilePath: 'main.js'
});

/*
gulp.task('main-js-browserify', function(cb) {
	cb();
});*/

/*
// Use as many copy tasks as you like, just give them a unique taskName.
guilty.requireTask('copy', {
	taskName: 'vendor-js',
	srcPathGlob: 'vendor-js/porthole.min.js',
	destPath: './'
});
*/
// Copies any html files straight across.
guilty.requireTask('html');


// Main task
gulp.task(
	guilty.taskNameGroup,
	// Adds the prefix to the tasks, in this case 'main-...'
	guilty.taskName([
		'images',
		'compass',
		'js-browserify',
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
