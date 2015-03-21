var coffeeify = require('coffeeify');
var _ = require('underscore');

module.exports = function coffeeBrowserifyTask(gulp, guilty, options)
{
	options = _.extend({
		taskName: 'coffee-browserify',
		srcFilePath: 'main.coffee',
		watchPathGlob: '**/*.{coffee,js,json}',
		destFilePath: 'main.js',
		browserifySetUpCallback: null,
		browserifyOptions: {}
	}, options);
	
	var passedCallback = options.browserifySetUpCallback;
	options.browserifySetUpCallback = function(browserifyInstance) {
		browserifyInstance.transform(coffeeify);
		
		if (passedCallback) {
			passedCallback(browserifyInstance);
		}
	};
	
	options.browserifyOptions = _.extend({
		extensions: ['.coffee']
	}, options.browserifyOptions);
	
	return guilty.requireTask('js-browserify', options)
};