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
		"text-long": true,
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

var FieldLabel = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['fieldLabel'],
			additionalClassNameExtensions: []
		}
	},
	
	render() {
		let props = this.props;
		let {
			children,
			title,
			required,
			recommended
		} = props;
		
		if (required) {
			title += ' (required)'
		}
		else if (recommended) {
			title += ' (recommended)'
		}
		
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

let ChoiceField = React.createClass({
	getDefaultProps() {
		return {
			choiceInfos: [],
			value: {},
			onReplaceInfoAtKeyPath: null,
			tabIndex: 0
		};
	},
	
	getDefaultSelectedChoiceID() {
		// Choose first item by default.
		var choiceInfos = this.props.choiceInfos;
		return choiceInfos[0].id;
	},
	
	getSelectedChoiceID() {
		var value = this.props.value;
		var selectedChoiceID = value ? value.choice_selectedID : null;
		if (!selectedChoiceID) {
			selectedChoiceID = this.getDefaultSelectedChoiceID();
		}
		return selectedChoiceID;
	},
	
	onSelectChange(event) {
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
	
	onChildFieldReplaceInfoAtKeyPath(info, keyPath) {
		let selectedChoiceID = this.getSelectedChoiceID();
		
		keyPath = [selectedChoiceID].concat(keyPath);
		
		var onReplaceInfoAtKeyPath = this.props.onReplaceInfoAtKeyPath;
		if (onReplaceInfoAtKeyPath) {
			onReplaceInfoAtKeyPath(info, keyPath);
		}
	},
	
	render() {
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
			React.createElement(FieldLabel, {
				key: 'label',
				title,
				additionalClassNameExtensions: ['-fieldType-choice']
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

let FieldGroup = React.createClass({
	getDefaultProps() {
		return {
			fields: [],
			value: {},
			onReplaceInfoAtKeyPath: null,
			tabIndex: 0
		};
	},
	
	onChildFieldReplaceInfoAtKeyPath(info, keyPath) {
		var onReplaceInfoAtKeyPath = this.props.onReplaceInfoAtKeyPath;
		if (onReplaceInfoAtKeyPath) {
			onReplaceInfoAtKeyPath(info, keyPath);
		}
	},
	
	render() {
		let {
			fields,
			value,
			title,
			ID,
			tabIndex
		} = this.props;
		
		let children = [
			React.createElement(EditorFields.FieldsHolder, {
				key: 'fields',
				fields,
				values: value,
				onReplaceInfoAtKeyPath: this.onChildFieldReplaceInfoAtKeyPath,
				className: 'group_fieldsHolder'
			})
		];
		
		return React.createElement('div', {
			className: 'group'
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
		let required = fieldJSON.required || false;
		let recommended = fieldJSON.recommended || false;
	
		if (!type) {
			type = 'text';
		}
	
		if (EditorFields.fieldTypeIsTextual(type)) {
			var fieldType = type;
		
			return React.createElement(FieldLabel, {
				key: ID,
				title,
				required,
				recommended,
				additionalClassNameExtensions: ['-fieldType-textual', `-fieldType-${type}`]
			}, [
				React.createElement('input', {
					key: ID,
					type: fieldType,
					value,
					placeholder: fieldJSON.placeholder,
					onChange(event) {
						var newValue = event.target.value;
					
						if (fieldType === 'url') {
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
			return React.createElement(ChoiceField, {
				key: ID,
				ID,
				choiceInfos: fieldJSON.choices,
				value: value,
				title,
				onReplaceInfoAtKeyPath(info, additionalKeyPath = []) {
					let keyPath = [ID].concat(additionalKeyPath);
					onReplaceInfoAtKeyPath(info, keyPath);
				},
			});
		}
		else if (type === 'group') {
			return React.createElement(FieldGroup, {
				key: ID,
				ID,
				fields: fieldJSON.fields,
				value: value,
				title,
				onReplaceInfoAtKeyPath(info, additionalKeyPath = []) {
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