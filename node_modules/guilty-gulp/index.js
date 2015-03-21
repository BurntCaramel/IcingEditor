var gulputil = require('gulp-util');
var path = require('path');
var minifyCSS = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var lazypipe = require('lazypipe');
var streamify = require('gulp-streamify');
var clean = require('gulp-clean');
var _ = require('underscore');


var isProduction = function()
{
	// Use by adding --production to gulp command
	return !!(gulputil.env.production);
}

var shouldClean = function()
{
	// Use by adding --clean to gulp command
	return !!(gulputil.env.clean) || this.isProduction();
}

var srcPath = function(filePath)
{
	if (filePath == null) {
		filePath = '';
	}
	
	return path.join(this.baseSrcFolder, filePath);
}

var destPath = function(filePath)
{
	if (filePath == null) {
		filePath = '';
	}
	
	return path.join(this.baseDestFolder, filePath);
}

var dest = function(filePath)
{
	var gulp = this.gulp;
	var stream = lazypipe();
	
	var destFilePath = this.destPath(filePath);
	stream = stream.pipe(gulp.dest, destFilePath);
	
	return stream();
}

var destCSS = function(filePath)
{
	var stream = lazypipe();
	
	if (this.isProduction()) {
		stream = stream.pipe(minifyCSS);
	}
	
	stream = stream.pipe(this.dest, filePath);
	
	return stream();
}

var destJS = function(filePath)
{
	// Todo: Skip the minifying of files with '.min' in the name.
	
	var stream = lazypipe();
	
	if (this.isProduction()) {
		stream = stream.pipe(streamify, uglify());
	}
	
	stream = stream.pipe(this.dest, filePath);
	
	return stream();
}


var taskName = function(inputTaskNameOrNames)
{
	var taskNameGroup = this.taskNameGroup;
	var fullTaskName = function(taskName) {
		return taskNameGroup + '-' + taskName;
	};
	
	var taskNames;
	if (typeof inputTaskNameOrNames === 'string') {
		var taskName = inputTaskNameOrNames;
		return fullTaskName(taskName);
	}
	// Array of task name strings.
	else {
		var taskNames = inputTaskNameOrNames;
		return _.map(taskNames, fullTaskName);
	}
}

var setUpBaseTasks = function()
{
	var gulp = this.gulp;
	var destPath = this.destPath();
	
	var self = this;
	self.hasCleaned = false;
	
	gulp.task(this.taskName('clean-once'), function(cb) {
		if (self.hasCleaned) {
			return cb();
		}
		
		self.hasCleaned = true;
		
		return gulp.src(destPath, {read: false})
			.pipe(clean())
		;
	});

	gulp.task(this.taskName('setup'), this.shouldClean() ? [this.taskName('clean-once')] : [], function(cb) {
		cb();
	});
}

var defaultTaskDependencies = function()
{
	return [
		this.taskName('setup')
	];
}

var defaultTaskDependenciesWith = function(otherDependencies)
{
	var defaultTaskDependencies = this.defaultTaskDependencies();
	otherDependencies = _.compact(otherDependencies); // Remove null or false
	return _.union(defaultTaskDependencies, otherDependencies);
}

var addWatch = function(watchFunction)
{
	this.watchFunctions.push(watchFunction);
}

var setUpWatchTask = function()
{
	var gulp = this.gulp;
	var watchFunctions = this.watchFunctions;
	
	gulp.task(this.taskName('watch'), function() {
		// Call all the watch functions.
		_.invoke(watchFunctions, 'call');
	});
}

var requireTask = function(taskName)
{
	var gulp = this.gulp;
	var argumentsForTask = _.rest(_.toArray(arguments));
	
	// Add the arguments to the front: gulp, guilty
	argumentsForTask.splice(0, 0, gulp, this);
	
	var taskCreatorFunction = require(path.join(__dirname, 'tasks', taskName));
	taskCreatorFunction.apply(null, argumentsForTask);
	
	return taskName;
}



module.exports = function(options) {
	var gulp = options.gulp ? options.gulp : require('gulp');
	
	var baseSrcFolder = './src/'
	var baseDestFolder = isProduction() ? './prod/' : './dev/';
	
	var newInstance = {
		gulp: gulp,
		taskNameGroup: options.taskNameGroup,
		isProduction: isProduction,
		shouldClean: shouldClean,
		baseSrcFolder: options.baseSrcFolder ? options.baseSrcFolder : baseSrcFolder,
		baseDestFolder: options.baseDestFolder ? options.baseDestFolder : baseDestFolder,
		srcPath: srcPath,
		destPath: destPath,
		dest: dest,
		destCSS: destCSS,
		destJS: destJS,
		taskName: taskName,
		setUpBaseTasks: setUpBaseTasks,
		defaultTaskDependencies: defaultTaskDependencies,
		defaultTaskDependenciesWith: defaultTaskDependenciesWith,
		watchFunctions: [],
		addWatch: addWatch,
		setUpWatchTask: setUpWatchTask,
		watch: (typeof(options.watch) !== 'undefined')  ? options.watch : true,
		requireTask: requireTask
	};
	
	if (options.onError) {
		gulp.on('err', options.onError);
	}
	
	_.bindAll(newInstance, 'srcPath', 'destPath', 'dest', 'destCSS', 'destJS', 'taskName');
	
	newInstance.setUpBaseTasks();
	
	if (newInstance.watch) {
		newInstance.setUpWatchTask();
	}
	
	return newInstance;
};