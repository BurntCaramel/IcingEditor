/**
	Copyright 2015 Patrick George Wyndham Smith
*/

import React, { PropTypes } from 'react';
var Toolbars = require('./EditorToolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/ContentStore');
var ContentActions = require('../actions/ContentActions');
var ConfigurationStore = require('../stores/ConfigurationStore');
var ReorderingStore = require('../stores/ReorderingStore');


const CatalogItem = React.createClass({
	mixins: [BaseClassNamesMixin],

	propTypes: {
		actions: PropTypes.shape({
			onEditIdentifier: PropTypes.func,
		})
	},

	getDefaultProps() {
		return {
		};
	},

	onEditIdentifier() {
		let {
			actions
		} = this.props;
	},

	render() {
		var classNameExtensions = [];

		var children = [];

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});

const Catalog = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			baseClassNames: ['catalog'],
			items: []
		};
	},

	render() {
		var { items } = this.props;

		return items.map((item, index) => {
			return React.createElement(CatalogItem, {
				key: `item-${index}`,
				designations: item.designations,
				content: item.content,
				baseClassNames: this.getChildClassNamesWithSuffix('item')
			});
		});
	}
});


return {
	CatalogItem
};
