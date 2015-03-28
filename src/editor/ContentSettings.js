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
				"id": "specs",
				"title": "Specs",
				"type": "choice",
				"choices": [
					{
						"id": "default",
						"title": "Use Default Specs"
					},
					{
						"id": "URLs",
						"title": "Enter List of Specs URLs",
						"fields": [
							{
								"id": "multiple",
								"type": "url",
								"multiple": true,
								"title": "Specs URLs",
								"description": "The Specs you would like to use for this document.",
								"placeholder": "Enter the URL to a Specs JSON file"
							}
						]
					}
				]
			}
		]
	},
	
	getSettingsValues() {
		let {
			documentID,
			specsURLs
		} = this.props;
		
		return {
			"specs": (
				specsURLs == null ?
				{
					"choice_selectedID": "default",
					"default": null
				}
				:
				{
					"choice_selectedID": "URLs",
					"URLs": {
						"multiple": specsURLs.toJS()
					}
				}
			)
		}
	},
	
	onReplaceInfoAtKeyPath(info, keyPath) {
		let {
			documentID,
			specsURLs
		} = this.props;
		
		//console.log(keyPath, info);
		if (keyPath[0] === 'specs') {
			// Choice changed
			if (keyPath[1] === undefined) {
				let specsChoice = info['choice_selectedID'];
				if (specsChoice === 'default') {
					ContentActions.setSpecsURLsForDocumentWithID(documentID, null);
				}
				else if (specsChoice === 'URLs') {
					//console.log('set []');
					ContentActions.setSpecsURLsForDocumentWithID(documentID, Immutable.List());
				}
			}
			else if (keyPath[1] === 'URLs') {
				if (keyPath[2] === 'multiple') {
					let index = keyPath[3];
					specsURLs = specsURLs.set(index, info);
					//console.log('specsURLs set', specsURLs.toJS());
					ContentActions.setSpecsURLsForDocumentWithID(documentID, specsURLs);
				}
			}
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
				values: this.getSettingsValues(),
				onReplaceInfoAtKeyPath: this.onReplaceInfoAtKeyPath
			})
		);
		
		return React.createElement('div', {
			className: 'contentSettings'
		}, children);
	}
});

module.exports = ContentSettingsElement;