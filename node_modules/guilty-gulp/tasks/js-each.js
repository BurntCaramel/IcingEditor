var _ = require('underscore');

module.exports = function jsEachTask(gulp, guilty, options)
{
	options = _.extend({
		taskName: 'js-each',
		srcPathGlob: '**/*.js',
		destPath: './'
	}, options);
	
	var taskName = options.taskName;
	var srcPathGlob = options.srcPathGlob;
	var destPath = options.destPath;
	
	gulp.task(
		guilty.taskName(taskName),
		guilty.defaultTaskDependencies(),
		function() {
			return gulp.src(guilty.srcPath(srcPathGlob), {base: guilty.srcPath()})
				.pipe(guilty.destJS(destPath));
		}
	);
	
	guilty.addWatch(function() {
		gulp.watch(guilty.srcPath(srcPathGlob), [guilty.taskName(taskName)]);
	});
};