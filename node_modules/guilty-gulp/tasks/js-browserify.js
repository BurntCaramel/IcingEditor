var source = require('vinyl-source-stream');
var browserify = require('browserify');
var envify = require('envify/custom');
var babelify = require('babelify');
var path = require('path');
var notify = require('gulp-notify');
var _ = require('underscore');

module.exports = function jsBrowserifyTask(gulp, guilty, options)
{
	options = _.extend({
		taskName: 'js-browserify',
		srcFilePath: 'main.js',
		watchPathGlob: '**/*.{js,json}',
		destFilePath: 'main.js',
		browserifySetUpCallback: function(browserifyInstance) {},
		browserifyOptions: {},
		useBabel: true,
		envifyEnvironment: {
			NODE_ENV: guilty.isProduction() ? 'production' : 'development'
		},
		envifyIsGlobal: true
	}, options);
	
	var taskName = options.taskName;
	var srcFilePath = options.srcFilePath;
	var watchPathGlob = options.watchPathGlob || srcFilePath;
	var destFilePath = options.destFilePath;
	var useBabel = options.useBabel;
	var envifyEnvironment = options.envifyEnvironment;
	var envifyIsGlobal = options.envifyIsGlobal;
	
	var browserifySetUpCallback = options.browserifySetUpCallback;
	var browserifyOptions = _.extend({
		entries: './' + srcFilePath,
		basedir: guilty.srcPath(),
		extensions: ['.js']
	}, options.browserifyOptions);
	
	gulp.task(
		guilty.taskName(taskName),
		guilty.defaultTaskDependencies(),
		function() {
			var browserifyInstance = browserify(browserifyOptions);
			
			if (useBabel) {
				browserifyInstance.transform(
					babelify
				);
			}
			
			browserifyInstance.transform(
				{
					global: envifyIsGlobal
				},
				envify(envifyEnvironment)
			);
			
			if (browserifySetUpCallback) {
				browserifySetUpCallback.call(null, browserifyInstance);
			}
			
			var bundleStream = browserifyInstance.bundle();
			
			return bundleStream
				.on('error', function(error) {
					notify.onError(taskName + ': <%= error.message %><%= console.log(error) %>')(error);
					//this.end();
					this.emit("end");
				})
				.pipe(source(path.basename(destFilePath)))
				.pipe(guilty.destJS(path.dirname(destFilePath)))
			;
		}
	);
	
	guilty.addWatch(function() {
		gulp.watch(guilty.srcPath(watchPathGlob), [guilty.taskName(taskName)]);
	});
};