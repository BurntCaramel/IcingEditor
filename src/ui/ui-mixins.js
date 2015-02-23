var React = require('react');

var ButtonMixin = {
	getDefaultProps: function() {
		return {
			selected: false
			//baseClassNames: ['button']
		};
	},
	
	render: function() {
		var props = this.props;
		var title = props.title;
		
		var baseClassNames = props.baseClassNames;
		var classNames = baseClassNames.slice();
		
		if (props.className) {
			classNames.push(props.className);
		}
		
		var addClassNameExtension = function(extension) {
			classNames.push.apply(classNames, baseClassNames.map(function(className) {
				return className + extension;
			}));
		};

		if (props.selected) {
			addClassNameExtension('-selected');
		}
		
		return React.createElement('button', {
			className: classNames.join(' '),
			onClick: props.onClick
		}, title);
	}
};

var Mixins = {
	ButtonMixin: ButtonMixin
};
module.exports = Mixins;