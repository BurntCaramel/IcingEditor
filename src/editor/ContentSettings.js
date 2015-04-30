/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
var Immutable = require('immutable');
var ContentStore = require('../stores/ContentStore.js');
let ContentActions = require('../actions/ContentActions');
var EditorFields = require('./EditorFields');

let {
	BaseClassNamesMixin
} = require('../ui/ui-mixins');


let ContentSettingsElement = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['document_contentSettings'],
			documentID: null,
			specsURLs: null
		};
	},
	
	getSettingsFields() {
		return [
			{
				"id": "defaultSpecs",
				"type": "group",
				"title": "Default Specs:",
				"fields": [
					{
						"id": "useBasicSpecs",
						"title": "Use Basic Specs",
						"type": "boolean",
						"value": false
					},
					{
						"id": "useAdvancedSpecs",
						"title": "Use Advanced Specs",
						"type": "boolean",
						"value": false
					}
				]
			},
			{
				"id": "additionalSpecsURLs",
				"type": "url",
				"multiple": true,
				"title": "Additional Specs URLs:",
				"description": "The Specs you would like to use for this document.",
				"placeholder": "Enter the URL to a Specs JSON file"
			}
		]
	},
	
	getSettingsValues() {
		let {
			documentID,
			defaultSpecsOptions,
			specsURLs
		} = this.props;
		
		return {
			"defaultSpecs": {
				"useBasicSpecs": defaultSpecsOptions.get('wantsDefaultBasicSpecs', true),
				"useAdvancedSpecs": defaultSpecsOptions.get('wantsDefaultAdvancedSpecs', false)
			},
			"additionalSpecsURLs": (specsURLs == null ? [] : specsURLs.toJS())
		}
	},
	
	onReplaceInfoAtKeyPath(info, keyPath) {
		let {
			documentID,
			specsURLs
		} = this.props;
		
		//console.log(keyPath, info);
		if (keyPath[0] === 'defaultSpecs') {
			var booleanValue = info;
			let documentActions = ContentActions.getActionsForDocument(documentID);
			
			if (keyPath[1] === 'useBasicSpecs') {
				documentActions.changeWantsDefaultBasicSpecs(booleanValue);
			}
			else if (keyPath[1] === 'useAdvancedSpecs') {
				documentActions.changeWantsDefaultAdvancedSpecs(booleanValue);
			}
		}
		else if (keyPath[0] === 'additionalSpecsURLs') {
			let index = keyPath[1];
			
			if (specsURLs == null) {
				specsURLs = Immutable.List();
			}
			
			specsURLs = specsURLs.set(index, info);
			//console.log('specsURLs set', specsURLs.toJS());
			ContentActions.setSpecsURLsForDocumentWithID(documentID, specsURLs);
		}
	},
	
	render() {
		let children = [];
		
		let headingText = 'Settings for Document';
		let values = this.getSettingsValues();
		
		children.push(
			React.createElement('h2', {
				key: 'heading',
				className: this.getChildClassNameStringWithSuffix('_heading')
			}, headingText),
			React.createElement(EditorFields.FieldsHolder, {
				key: 'fields',
				className: this.getChildClassNameStringWithSuffix('_fields'),
				fields: this.getSettingsFields(),
				values,
				onReplaceInfoAtKeyPath: this.onReplaceInfoAtKeyPath
			})
		);
		
		return React.createElement('div', {
			className: 'contentSettings'
		}, children);
	}
});

module.exports = ContentSettingsElement;