/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');


let BaseClassNamesMixin = require('./BaseClassNamesMixin');


var ButtonMixin = {
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			selected: false
			//baseClassNames: ['button']
		};
	},
	
	onClick(event) {
		event.stopPropagation();
		
		this.props.onClick(event);
	},
	
	render() {
		let {
			title,
			selected
		} = this.props;
		
		var extensions = [];
		if (selected) {
			extensions.push('-selected');
		}
		
		var classNames = this.getClassNamesWithExtensions(extensions);
		
		return React.createElement('button', {
			className: classNames.join(' '),
			onClick: this.onClick
		}, title);
	}
};

var Mixins = {
	ButtonMixin,
	BaseClassNamesMixin
};
module.exports = Mixins;