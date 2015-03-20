/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
let {ButtonMixin, BaseClassNamesMixin} = require('../ui/ui-mixins');
var normalizeURL = require('normalize-url');


var EditorFields = {};

var changeInfoWithIDAndValue = function(ID, value) {
	var changeInfo = {};
	changeInfo[ID] = value;
	return changeInfo;
};

EditorFields.fieldTypeIsTextual = function(fieldType) {
	var textualFieldTypes = {
		"text": true,
		"url": true,
		"email": true,
		"tel": true,
		"number": true,
		"number-integer": true
	}
	if (textualFieldTypes[fieldType]) {
		return true;
	}
	else {
		return false;
	}
}

var InputLabel = React.createClass({
	getDefaultProps: function() {
		return {
			title: ''
		}
	},
	
	render: function() {
		var props = this.props;
		var title = this.props.title;
		
		var children = [
			React.createElement('span', {
				className: 'inputLabel_title'
			}, title)
		];
	
		return React.createElement('label', {
			className: 'inputLabel'
		}, children);
	}
});

var InputLabel = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['inputLabel'],
			additionalClassNameExtensions: []
		}
	},
	
	render() {
		let props = this.props;
		let {
			children,
			title
		} = props;
		
		children = [
			React.createElement('span', {
				key: 'title',
				className: this.getChildClassNameStringWithSuffix('_title')
			}, title)
		].concat(children);
		
		return React.createElement('label', {
			className: this.getClassNameStringWithExtensions()
		}, children);
	}
});

var ChoiceInput = React.createClass({
	getDefaultProps: function() {
		return {
			choiceInfos: [],
			value: {},
			onReplaceInfoAtKeyPath: null,
			tabIndex: 0
		};
	},
	
	getDefaultSelectedChoiceID: function() {
		// Choose first item by default.
		var choiceInfos = this.props.choiceInfos;
		return choiceInfos[0].id;
	},
	
	getSelectedChoiceID: function() {
		var value = this.props.value;
		var selectedChoiceID = value ? value.choice_selectedID : null;
		if (!selectedChoiceID) {
			selectedChoiceID = this.getDefaultSelectedChoiceID();
		}
		return selectedChoiceID;
	},
	
	onSelectChange: function(event) {
		let newSelectedChoiceID = event.target.value;
		let info = {
			choice_selectedID: newSelectedChoiceID
		};
		info[newSelectedChoiceID] = {};
		
		let onReplaceInfoAtKeyPath = this.props.onReplaceInfoAtKeyPath;
		if (onReplaceInfoAtKeyPath) {
			onReplaceInfoAtKeyPath(info, []);
		}
	},
	
	onChildFieldReplaceInfoAtKeyPath: function(info, keyPath) {
		let selectedChoiceID = this.getSelectedChoiceID();
		
		keyPath = [selectedChoiceID].concat(keyPath);
		
		var onReplaceInfoAtKeyPath = this.props.onReplaceInfoAtKeyPath;
		if (onReplaceInfoAtKeyPath) {
			onReplaceInfoAtKeyPath(info, keyPath);
		}
	},
	
	render: function() {
		let {
			choiceInfos,
			value,
			title,
			ID,
			tabIndex
		} = this.props;
		
		var selectedChoiceID = this.getSelectedChoiceID();
		var selectedChoiceInfo = null;
	
		// Create <option> for each choice.
		var optionElements = choiceInfos.map(function(choiceInfo, choiceIndex) {
			if (choiceInfo.id === selectedChoiceID) {
				selectedChoiceInfo = choiceInfo;
			}
		
			return React.createElement('option', {
				key: choiceInfo.id,
				value: choiceInfo.id,
			}, choiceInfo.title);
		});
		// Create <label> and <select>
		var children = [
			React.createElement(InputLabel, {
				key: 'label',
				title
			}, [
				React.createElement('select', {
					key: 'select',
					value: selectedChoiceID,
					onChange: this.onSelectChange,
					className: 'choice_select',
					tabIndex
				}, optionElements)
			])
		];
		
		// Show fields for the selected choice.
		if (selectedChoiceInfo) {
			children = children.concat(
				React.createElement(EditorFields.FieldsHolder, {
					key: 'fields',
					fields: selectedChoiceInfo.fields,
					values: value ? value[selectedChoiceID] : null,
					onReplaceInfoAtKeyPath: this.onChildFieldReplaceInfoAtKeyPath,
					className: 'choice_fieldsHolder'
				})
			);
		}
		
		return React.createElement('div', {
			className: 'choice'
		}, children);
	}
});

EditorFields.FieldsHolder = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['fieldsHolder'],
			fields: [],
			values: {},
			onChangeInfo: null
		}
	},
	
	createElementForField(fieldJSON, value) {
		let {
			onReplaceInfoAtKeyPath
		} = this.props;
		
		var type = fieldJSON.type;
		var ID = fieldJSON.id;
		var title = fieldJSON.title;
	
		if (!type) {
			type = 'text';
		}
	
		if (EditorFields.fieldTypeIsTextual(type)) {
			var inputType = type;
		
			return React.createElement(InputLabel, {
				key: ID,
				title,
				additionalClassNameExtensions: [`-inputType-${type}`]
			}, [
				React.createElement('input', {
					key: ID,
					type: inputType,
					value: value,
					onChange: function(event) {
						var newValue = event.target.value;
					
						if (inputType === 'url') {
							//let normalizedURL = normalizeURL(newValue);
							//console.log('URL', normalizedURL);
						}
					
						onReplaceInfoAtKeyPath(
							newValue,
							[ID]
						);
					},
					className: 'input-textual input-' + type,
					tabIndex: 0
				})
			]);
		}
		else if (type === 'choice') {
			return React.createElement(ChoiceInput, {
				key: ID,
				ID,
				choiceInfos: fieldJSON.choices,
				value: value,
				title: title,
				onReplaceInfoAtKeyPath: function(info, additionalKeyPath = []) {
					let keyPath = [ID].concat(additionalKeyPath);
					onReplaceInfoAtKeyPath(info, keyPath);
				},
			});
		}
	
		console.error('unknown field type', type);
	},
	
	render() {
		var props = this.props;
		var fields = props.fields;
		var values = props.values;
		
		var fieldElements = fields.map(function(fieldJSON) {
			var fieldID = fieldJSON.id;
			var valueForField = values ? values[fieldID] : null;
			return this.createElementForField(
				fieldJSON, valueForField
			);
		}, this);
		
		return React.createElement('div', {
			key: 'fields',
			className: this.getClassNameStringWithExtensions()
		}, fieldElements);
	}
});


module.exports = EditorFields;