var svgmin = require('gulp-svgmin');
var path = require('path');
var _ = require('underscore');
var gulpFilter = require('gulp-filter');

module.exports = function imagesTask(gulp, guilty, options)
{
	options = _.extend({
		taskName: 'images',
		srcFolder: 'images',
		destPath: 'images',
		dependencies: []
	}, options);
	
	var taskName = options.taskName;
	var srcFolder = options.srcFolder;
	var srcPathGlob = path.join(srcFolder, '/**/*');
	var destPath = options.destPath;
	
	var dependencies = guilty.defaultTaskDependenciesWith(options.dependencies);

	// Images
	gulp.task(
		guilty.taskName(taskName),
		dependencies,
		function() {
			var svgFilter = gulpFilter('**/*.svg');
			
			return gulp.src(guilty.srcPath(srcPathGlob), {base: guilty.srcPath(srcFolder)})
				.pipe(svgFilter)
				.pipe(svgmin())
				.pipe(svgFilter.restore())
				.pipe(guilty.dest(destPath))
			;
		}
	);
	
	guilty.addWatch(function() {
		gulp.watch(guilty.srcPath(srcPathGlob), [guilty.taskName(taskName)]);
	});
};