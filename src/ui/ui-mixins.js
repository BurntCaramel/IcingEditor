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
	
	getClassNamesWithChildSuffixes(childSuffixes) {
		return getClassNamesWithSuffixes(this.getBaseClassNames(), childSuffixes);
	},
	
	getClassNameStringWithChildSuffixes(childSuffixes) {
		return this.getClassNamesWithChildSuffixes(childSuffixes).join(' ');
	},
	
	getClassNamesWithChildSuffix(childSuffix) {
		return getClassNamesWithSuffixes(this.getBaseClassNames(), [childSuffix]);
	},
	
	getClassNameStringWithChildSuffix(childSuffix) {
		return this.getClassNamesWithChildSuffix(childSuffix).join(' ');
	}
};


var ButtonMixin = {
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			selected: false
			//baseClassNames: ['button']
		};
	},
	
	render() {
		var props = this.props;
		var title = props.title;
		
		var extensions = [];
		if (props.selected) {
			extensions.push('-selected');
		}
		
		var classNames = this.getClassNamesWithExtensions(extensions);
		
		return React.createElement('button', {
			className: classNames.join(' '),
			onClick: props.onClick
		}, title);
	}
};

var Mixins = {
	ButtonMixin,
	BaseClassNamesMixin
};
module.exports = Mixins;