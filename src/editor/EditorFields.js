/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
let {ButtonMixin, BaseClassNamesMixin} = require('../ui/ui-mixins');
var normalizeURL = require('normalize-url');
let KeyCodes = require('../ui/KeyCodes');


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
};

var FieldLabel = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps() {
		return {
			baseClassNames: ['fieldLabel'],
			additionalClassNameExtensions: [],
			children: [],
			required: false,
			recommended: false,
			showLabelBeforeChildren: true
		}
	},
	
	render() {
		let props = this.props;
		let {
			children,
			title,
			description,
			required,
			recommended,
			showLabelBeforeChildren
		} = props;
		
		if (required) {
			title += ' (required)'
		}
		else if (recommended) {
			title += ' (recommended)'
		}
		
		let leadingChildren = [
			React.createElement('span', {
				key: 'title',
				className: this.getChildClassNameStringWithSuffix('_title')
			}, title)
		];
		
		if (description) {
			React.createElement('span', {
				key: 'description',
				className: this.getChildClassNameStringWithSuffix('_description')
			}, description)
		}
		
		if (showLabelBeforeChildren) {
			children = leadingChildren.concat(children);
		}
		else {
			children = children.concat(leadingChildren);
		}
		
		return React.createElement('label', {
			className: this.getClassNameStringWithExtensions()
		}, children);
	}
});

let TextualField = React.createClass({
	getDefaultProps() {
		return {
			type: 'text',
			value: null,
			required: false,
			recommended: false,
			placeholder: null,
			continuous: false,
			onValueChanged: null,
			tabIndex: 0
		};
	},
	
	getInitialState() {
		return {
			pendingValue: null
		};
	},
	
	getInputTypeForFieldType(type) {
		if (type === 'number' || type === 'number-integer') {
			return 'text';
		}
		else {
			return type;
		}
	},
	
	onKeyDown(event) {
		let keyCode = event.which;
		if (keyCode === KeyCodes.ReturnOrEnter) {
			this.onCommitChange(event);
		}
	},
	
	onBlur(event) {
		this.onCommitChange(event);
	},
	
	onMakePendingChange(event) {
		var newValue = event.target.value;
		this.setState({
			pendingValue: newValue
		});
	},
	
	onCommitChange(event) {
		let {
			onValueChanged
		} = this.props;
		
		var newValue = event.target.value;
		onValueChanged(newValue);
		
		this.setState({
			pendingValue: null
		});
	},
	
	revertValue() {
		this.setState({
			pendingValue: null
		});
	},
	
	render() {
		let {
			type,
			ID,
			required,
			recommended,
			title,
			description,
			placeholder,
			continuous,
			value,
			tabIndex,
			onValueChanged
		} = this.props;
		let {
			pendingValue
		} = this.state;
		
		if (typeof pendingValue === 'string') {
			value = pendingValue;
		}
		
		let children = [];
		
		if (type === 'text-long') {
			children.push(
				React.createElement('textarea', {
					key: 'textarea',
					value,
					placeholder,
					rows: 6,
					onKeyDown: this.onKeyDown,
					onBlur: this.onBlur,
					onChange: continuous ? this.onCommitChange : this.onMakePendingChange,
					className: 'input-textual input-' + type,
					tabIndex
				})
			);
		}
		else {
			let inputType = this.getInputTypeForFieldType(type);
			
			children.push(
				React.createElement('input', {
					key: 'input',
					type: inputType,
					value,
					placeholder,
					onKeyDown: this.onKeyDown,
					onBlur: this.onBlur,
					onChange: continuous ? this.onCommitChange : this.onMakePendingChange,
					className: 'input-textual input-' + type,
					tabIndex
				})
			);
		}
		
		return React.createElement(FieldLabel, {
			key: ID,
			title,
			description,
			required,
			recommended,
			additionalClassNameExtensions: ['-fieldType-textual', `-fieldType-${type}`]
		}, children);
	}
});

let TextualFieldMultiple = React.createClass({
	getDefaultProps() {
		return {
			type: 'text',
			values: [],
			required: false,
			recommended: false,
			placeholder: null,
			continuous: false,
			onValueChangedAtIndex: null,
			tabIndex: 0
		};
	},
	
	render() {
		let {
			type,
			ID,
			title,
			required,
			recommended,
			placeholder,
			continuous,
			values,
			tabIndex,
			onValueChangedAtIndex
		} = this.props;
		
		// Add additional value ready to be filled in.
		if (values.length === 0 || (values[values.length - 1] || '').length !== 0) {
			values = values.concat('');
		}
		
		let fieldElements = values.map(function(value, valueIndex) {
			return React.createElement(TextualField, {
				key: `field-${valueIndex}`,
				type,
				ID,
				required,
				recommended,
				placeholder,
				continuous,
				value,
				tabIndex,
				onValueChanged: newValue => {
					onValueChangedAtIndex(newValue, valueIndex)
				}
			});
		});
		
		let children = [
			React.createElement(FieldLabel, {
				key: 'label',
				title
			})
		].concat(fieldElements);
		
		return React.createElement('div', {
			className: 'fieldsMultiple'
		}, children);
	}
});

let SwitchField = React.createClass({
	getDefaultProps() {
		return {
			value: false,
			onValueChanged: null,
			title: null,
			description: null,
			required: false,
			recommended: false,
			tabIndex: 0
		};
	},
	
	onChange(event) {
		let previousValue = this.props.value;
		let newValue = !previousValue;
		
		let onValueChanged = this.props.onValueChanged;
		if (onValueChanged) {
			onValueChanged(newValue);
		}
	},
	
	render() {
		let {
			ID,
			value,
			title,
			description,
			required,
			recommended,
			tabIndex
		} = this.props;
		
		var children = [
			React.createElement('input', {
				key: 'checkbox',
				type: 'checkbox',
				checked: value,
				onChange: this.onChange
			})
		];
		
		return React.createElement(FieldLabel, {
			key: ID,
			title,
			description,
			required,
			recommended,
			showLabelBeforeChildren: false,
			additionalClassNameExtensions: ['-fieldType-boolean']
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
		if (selectedChoiceInfo && selectedChoiceInfo.fields) {
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
			title: null,
			description: null,
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
			description,
			ID,
			tabIndex
		} = this.props;
		
		let children = [
			React.createElement(FieldLabel, {
				key: 'label',
				title,
				description,
				additionalClassNameExtensions: ['-fieldType-group']
			}),
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
		
		var type = fieldJSON.type || 'text';
		var ID = fieldJSON.id;
		var title = fieldJSON.title;
		var description = fieldJSON.description;
		let multiple = fieldJSON.multiple || false;
		let required = fieldJSON.required || false;
		let recommended = fieldJSON.recommended || false;
		let placeholder = fieldJSON.placeholder || null;
	
		if (EditorFields.fieldTypeIsTextual(type)) {
			var fieldType = type;
			
			let props = {
				key: ID,
				type,
				ID,
				title,
				description,
				required,
				recommended,
				placeholder
			};
			
			if (multiple) {
				props.values = value;
				props.onValueChangedAtIndex = function(newValue, valueIndex) {
					onReplaceInfoAtKeyPath(newValue, [ID, valueIndex]);
				}
				return React.createElement(TextualFieldMultiple, props);
			}
			else {
				props.value = value;
				props.onValueChanged = function(newValue) {
					onReplaceInfoAtKeyPath(newValue, [ID]);
				}
				return React.createElement(TextualField, props);
			}
		}
		else if (type === 'choice') {
			return React.createElement(ChoiceField, {
				key: ID,
				ID,
				choiceInfos: fieldJSON.choices,
				value,
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
				value,
				title,
				onReplaceInfoAtKeyPath(info, additionalKeyPath = []) {
					let keyPath = [ID].concat(additionalKeyPath);
					onReplaceInfoAtKeyPath(info, keyPath);
				},
			});
		}
		else if (type === 'boolean') {
			return React.createElement(SwitchField, {
				key: ID,
				ID,
				value,
				title,
				onValueChanged: newValue => {
					onReplaceInfoAtKeyPath(newValue, [ID]);
				}
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