/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');


function getClassNamesWithSuffixes(baseClassNames, suffixes) {
	if (suffixes.length === 0) {
		return [];
	}
	
	return baseClassNames.reduce(function(classNamesSoFar, className) {
		classNamesSoFar.push.apply(classNamesSoFar, suffixes.map(function(suffix) {
			return className + suffix;
		}));
		return classNamesSoFar;
	}, []);
};


var BaseClassNamesMixin = {
	getBaseClassNames() {
		var props = this.props;
		var baseClassNames = props.baseClassNames || [];
		
		if (props.className) {
			baseClassNames = baseClassNames.concat(props.className);
		}
		
		return baseClassNames;
	},
	
	// For the main element
	
	getClassNamesWithExtensions(additionalExtensions) {
		var props = this.props;
		var baseClassNames = this.getBaseClassNames();
		
		var extensions = [];
		if (props.additionalClassNameExtensions) {
			extensions = extensions.concat(props.additionalClassNameExtensions);
		}
		if (additionalExtensions) {
			extensions = extensions.concat(additionalExtensions);
		}
		
		var classNamesWithExtensions = getClassNamesWithSuffixes(baseClassNames, extensions);
		return baseClassNames.concat(classNamesWithExtensions);
	},
	
	getClassNameStringWithExtensions(additionalExtensions) {
		return this.getClassNamesWithExtensions(additionalExtensions).join(' ');
	},
	
	// For children of the main element
	
	// Pass this to a child element's baseClassNames prop, if they also use BaseClassNamesMixin
	getChildClassNamesWithSuffix(childSuffix) {
		return getClassNamesWithSuffixes(this.getBaseClassNames(), [childSuffix]);
	},
	
	// Pass this to a child element's className prop
	getChildClassNameStringWithSuffix(childSuffix) {
		return this.getChildClassNamesWithSuffix(childSuffix).join(' ');
	}
};

module.exports = BaseClassNamesMixin;