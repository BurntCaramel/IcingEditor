var React = require('react');
let {ButtonMixin, BaseClassNamesMixin} = require('../ui/ui-mixins');

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
				className: this.getClassNameStringWithChildSuffix('_title')
			}, title)
		].concat(children);
		
		return React.createElement('label', {
			className: this.getClassNameStringWithExtensions()
		}, children);
	}
})

EditorFields.createInputLabel = function(title, children) {	
	var labelChildren = [
		React.createElement('span', {
			className: 'inputLabel_title'
		}, title)
	].concat(children);
	
	return React.createElement('label', {
		className: 'inputLabel'
	}, labelChildren);
};

var ChoiceInput = React.createClass({
	getDefaultProps: function() {
		return {
			choiceInfos: [],
			value: {
				selectedChoiceID: null,
				selectedChoiceValues: null
			},
			keyPath: [],
			onChangeInfo: null
		};
	},
	
	getDefaultSelectedChoiceID: function() {
		var choiceInfos = this.props.choiceInfos;
		return choiceInfos[0].id;
	},
	
	getSelectedChoiceID: function() {
		var value = this.props.value;
		var selectedChoiceID = value ? value.selectedChoiceID : null;
		if (!selectedChoiceID) {
			selectedChoiceID = this.getDefaultSelectedChoiceID();
		}
		return selectedChoiceID;
	},
	
	onSelectChange: function(event) {
		var newSelectedChoiceID = event.target.value;
		var onChangeInfo = this.props.onChangeInfo;
		if (onChangeInfo) {
			onChangeInfo({
				selectedChoiceID: newSelectedChoiceID
			});
		}
	},
	
	onChildFieldChangeInfo: function(fieldChangeInfo) {
		var changeInfo = {
			selectedChoiceID: this.getSelectedChoiceID(),
			selectedChoiceValues: fieldChangeInfo
		};
		
		var onChangeInfo = this.props.onChangeInfo;
		if (onChangeInfo) {
			onChangeInfo(changeInfo);
		}
	},
	
	render: function() {
		var props = this.props;
		var choiceInfos = props.choiceInfos;
		var value = props.value;
		var title = props.title;
		
		var selectedChoiceID = this.getSelectedChoiceID();
		var selectedChoiceInfo = null;
	
		var optionElements = choiceInfos.map(function(choiceInfo, choiceIndex) {
			if (choiceInfo.id === selectedChoiceID) {
				selectedChoiceInfo = choiceInfo;
			}
		
			return React.createElement('option', {
				key: choiceInfo.id,
				value: choiceInfo.id,
			}, choiceInfo.title);
		});
		
		var children = [
			EditorFields.createInputLabel(title, [
				React.createElement('select', {
					value: selectedChoiceID,
					onChange: this.onSelectChange,
					className: 'choice_select'
				}, optionElements)
			])
		];
		
		if (selectedChoiceInfo) {
			children = children.concat(
				React.createElement(EditorFields.FieldsHolder, {
					fields: selectedChoiceInfo.fields,
					values: value ? value.selectedChoiceValues : null,
					onChangeInfo: this.onChildFieldChangeInfo,
					className: 'choice_fieldsHolder'
				})
			);
		}
		
		return React.createElement('div', {
			className: 'choice'
		}, children);
	}
});

EditorFields.createElementForField = function(fieldJSON, value, onChangeInfo) {
	var type = fieldJSON.type;
	var ID = fieldJSON.id;
	var title = fieldJSON.title;
	
	if (!type) {
		type = 'text';
	}
	
	if (EditorFields.fieldTypeIsTextual(type)) {
		var inputType = type;
		
		return React.createElement(InputLabel, {
			title,
			additionalClassNameExtensions: [`-inputType-${type}`]
		}, [
			React.createElement('input', {
				type: inputType,
				value: value,
				onChange: function(event) {
					var newValue = event.target.value;
					onChangeInfo(
						changeInfoWithIDAndValue(ID, newValue)
					);
				},
				className: 'input-textual input-' + type
			})
		]);
		
		/*
		return EditorFields.createInputLabel(title, [
			React.createElement('input', {
				type: inputType,
				value: value,
				onChange: function(event) {
					var newValue = event.target.value;
					onChangeInfo(
						changeInfoWithIDAndValue(ID, newValue)
					);
				},
				className: 'input-textual input-' + type
			})
		]);
		*/
	}
	else if (type === 'choice') {
		return React.createElement(ChoiceInput, {
			choiceInfos: fieldJSON.choices,
			value: value,
			title: title,
			onChangeInfo: function(changeInfo) {
				onChangeInfo(
					changeInfoWithIDAndValue(ID, changeInfo)
				);
			}
		});
	}
	
	console.error('unknown field type', type);
};

EditorFields.FieldsHolder = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['fieldsHolder'],
			fields: [],
			values: {},
			onChangeInfo: null
		}
	},
	
	render: function() {
		var props = this.props;
		var fields = props.fields;
		var values = props.values;
		var onChangeInfo = props.onChangeInfo;
		
		var fieldElements = fields.map(function(fieldJSON) {
			var fieldID = fieldJSON.id;
			var valueForField = values ? values[fieldID] : null;
			return EditorFields.createElementForField(
				fieldJSON, valueForField, onChangeInfo
			);
		});
		
		return React.createElement('div', {
			key: 'fields',
			className: this.getClassNameStringWithExtensions()
		}, fieldElements);
	}
});


module.exports = EditorFields;