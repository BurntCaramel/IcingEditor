var jstConcat = require('gulp-jst-concat');
var path = require('path');
var _ = require('underscore');

module.exports = function jstTask(gulp, guilty, options)
{
	options = _.extend({
		taskName: 'jst',
		srcGlobPath: '**/*.jst',
		destFilePath: 'jst.js'
	}, options);
	
	var taskName = options.taskName;
	var srcGlobPath = options.srcGlobPath;
	var destFilePath = options.destFilePath;
	
	gulp.task(
		guilty.taskName(taskName),
		guilty.defaultTaskDependencies(),
		function() {
			var jstStream = gulp.src(guilty.srcPath(srcGlobPath))
				.pipe(jstConcat(path.basename(destFilePath), {
					renameKeys: ['^.*/(.*).jst$', '$1']
				}))
				.pipe(guilty.destJS(path.dirname(destFilePath)))
			;
		}
	);
	
	guilty.addWatch(function() {
		gulp.watch(guilty.srcPath(srcGlobPath), [guilty.taskName(taskName)]);
	});
};