/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
import AppDispatcher from '../app-dispatcher';
var ConfigurationStore = require('../stores/ConfigurationStore');
var PreviewStore = require('../stores/PreviewStore');
var ReorderingStore = require('../stores/ReorderingStore');
var Immutable = require('immutable');
var eventIDs = require('../actions/ContentActionsEventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

let EditorFields = require('./EditorFields');

let {
	findParticularSubsectionOptionsInList,
	findParticularBlockTypeOptionsWithGroupAndTypeInMap
} = require('../assistants/TypesAssistant');

let {
	ButtonMixin,
	BaseClassNamesMixin
} = require('../ui/ui-mixins');

let KeyCodes = require('../ui/KeyCodes');

let MicroEvent = require('microevent');



var TextItemTextArea = React.createClass({
	getDefaultProps() {
		return {
			text: '',
			shorter: false,
			tabIndex: 0
		};
	},

	propsTypes: {
		text: React.PropTypes.string.isRequired,
		shorter: React.PropTypes.bool,
		tabIndex: React.PropTypes.number
	},

	getInitialState() {
		return {
			spaceWasJustPressed: false
		};
	},

	getTextAreaDOMNode() {
		return this.refs.textarea.getDOMNode();
	},

	placeSelectionCursorAtEnd() {
		let textArea = this.getTextAreaDOMNode();
		let textLength = textArea.value.length;
		textArea.focus();
		// Place cursor at end:
		textArea.setSelectionRange(textLength, textLength);
		// Select all:
		//textArea.setSelectionRange(0, textLength);
	},

	componentWillMount() {
		var actions = this.props.actions;
		//actions.registerSelectedTextRangeFunctionForEditedItem(this.getTextSelectionRange);
	},

	componentDidMount() {
		this.placeSelectionCursorAtEnd();
	},

	componentWillUnmount() {
		let actions = this.props.actions;
		//actions.unregisterSelectedTextRangeFunctionForEditedItem();
	},

	onChange() {
		let actions = this.props.actions;
		let text = this.getTextAreaDOMNode().value;
		actions.setTextForEditedTextItem(text);
	},

	onPaste(event) {
		event.stopPropagation();

		let actions = this.props.actions;

		let pastedText = event.clipboardData.getData('text/plain');
		// If has multiple lines:
		if (pastedText.indexOf("\n") !== -1) {
			// Create blocks for each line.
			actions.insertRelatedTextItemBlocksAfterEditedBlockWithPastedText(pastedText);

			event.preventDefault();
		}
		// Else let the textarea paste the text as normal.
	},

	hasNoText() {
		//var text = this.getTextAreaDOMNode().value;
		var text = this.props.text;
		return (text.length === 0);
	},

	getTextSelectionRange() {
		var textarea = this.getTextAreaDOMNode();
		return {
			"start": textarea.selectionStart,
			"end": textarea.selectionEnd
		};
	},

	selectionIsCaretAtBeginning() {
		var textSelectionRange = this.getTextSelectionRange();
		return (textSelectionRange.start === 0 && textSelectionRange.end === 0);
	},

	onKeyDown(e) {
		e.stopPropagation();

		let {
			actions,
			onModifierKeyChange
		} = this.props;

		let keyCode = e.which;

		if (KeyCodes.isModifier(keyCode)) {
			onModifierKeyChange(keyCode, true);
		}

		var spaceWasJustPressed = (keyCode == KeyCodes.Space);
		if (spaceWasJustPressed) { // Space key
			if (this.state.spaceWasJustPressed) {
				let text = this.props.text;
				// Only do something if some characters, and not just whitespace, have been typed.
				if (text.trim() === '') {
					return;
				}

				actions.finishTextAsSentenceWithTrailingSpaceForEditedTextItem()
				actions.addNewTextItemAfterEditedTextItem();
				e.preventDefault();
				spaceWasJustPressed = false;
			}
		}

		this.setState({spaceWasJustPressed});

		if (keyCode == KeyCodes.DeleteOrBackspace) { // Delete/Backspace key
			/*if (this.hasNoText()) {
				actions.removeEditedTextItem();
				e.preventDefault();
			}
			else*/
			if (this.selectionIsCaretAtBeginning()) {
				actions.joinEditedTextItemWithPreviousItem();
				e.preventDefault();
			}
		}
		else if (keyCode == KeyCodes.Tab) { // Tab key
			if (e.shiftKey) {
				actions.editPreviousItemBeforeEditedTextItem();
			}
			else {
				actions.editNextItemAfterEditedTextItem();
			}

			e.preventDefault();
		}
		else if (keyCode == KeyCodes.ReturnOrEnter) { // Return/enter key.
			if (e.shiftKey) {
				actions.addLineBreakAfterEditedTextItem();
			}
			// Command key
			else if (e.metaKey) {
				actions.finishEditing();
			}
			else {
				let splitBlock = !e.altKey; // Option key
				if (this.hasNoText() && false) {
					if (splitBlock) {
						actions.splitBlockBeforeEditedTextItem();
					}
				}
				else {
					var textSelectionRange = this.getTextSelectionRange();
					actions.splitTextInRangeOfEditedTextItem(textSelectionRange);

					// If text was selected, just break it into its own item but not into its own block.
					if (splitBlock /*&& textSelectionRange.start === textSelectionRange.end*/) {
						actions.splitBlockBeforeEditedTextItem();
					}
				}
			}

			e.preventDefault();
		}
	},

	onKeyUp(e) {
		e.stopPropagation();

		let {
			onModifierKeyChange
		} = this.props;

		let keyCode = e.which;

		if (KeyCodes.isModifier(keyCode)) {
			onModifierKeyChange(keyCode, false);
		}
	},

	onKeyPress(e) {
		e.stopPropagation();

		var actions = this.props.actions;

		//console.log('key press', e.which);
	},

	render() {
		let {
			text,
			shorter,
			tabIndex
		} = this.props;

		var classNames = [
			'textItemEditor_textarea'
		];

		if (shorter) {
			classNames.push(
				'textItemEditor_textarea-shorter'
			);
		}

		return React.createElement('textarea', {
			ref: 'textarea',
			value: text,
			className: classNames.join(' '),
			width: 10,
			height: 20,
			placeholder: 'Type text…',
			spellCheck: "true",
			//key: 'textarea',
			onChange: this.onChange,
			onKeyDown: this.onKeyDown,
			onKeyUp: this.onKeyUp,
			onKeyPress: this.onKeyPress,
			onPaste: this.onPaste,
			tabIndex
		});
	}
});

var ToolbarButton = React.createClass({
	mixins: [ButtonMixin],

	getDefaultProps() {
		return {
			//baseClassNames: ['toolbarButton']
			className: 'toolbarButton'
		};
	}
});

var SecondaryButton = React.createClass({
	mixins: [ButtonMixin],

	getDefaultProps() {
		return {
			baseClassNames: ['secondaryButton']
		};
	}
});

var ButtonDivider = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			baseClassNames: ['divider']
		};
	},

	render() {
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions()
		})
	}
});

var ToolbarDivider = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			baseClassNames: ['toolbarDivider']
		};
	},

	render() {
		//var text = ' · ';
		var text = ' ';
		return React.createElement('span', {
			className: this.getClassNameStringWithExtensions()
		}, text);
	}
});

var TraitButton = React.createClass({
	getDefaultProps() {
		return {
			traitSpec: {},
			traitValue: null
		};
	},

	getInitialState() {
		return {
			showFields: false
		}
	},

	statics: {
		events: {
			on: MicroEvent.prototype.bind,
			trigger: MicroEvent.prototype.trigger,
			off: MicroEvent.prototype.unbind
		},
		eventIDs: {
			didToggle: 'didToggle'
		}
	},

	componentDidMount() {
		this.didToggleFunction = (sourceComponent, showing) => {
			if (sourceComponent !== this) {
				if (showing) {
					this.close();
				}
			}
		};

		TraitButton.events.on(TraitButton.eventIDs.didToggle, this.didToggleFunction);
	},

	componentWillUnmount() {
		TraitButton.events.off(TraitButton.eventIDs.didToggle, this.didToggleFunction);
		this.didToggleFunction = null;
	},

	onToggleShowFields(event, flag) {
		let currentShowFields = this.state.showFields;
		let newShowFields = (typeof flag !== 'undefined') ? flag : !currentShowFields;
		if (newShowFields == currentShowFields) {
			return;
		}

		this.setState({
			showFields: newShowFields
		});

		TraitButton.events.trigger(TraitButton.eventIDs.didToggle, this, newShowFields);
	},

	close() {
		this.onToggleShowFields(null, false);
	},

	onToggleTrait(event) {
		var props = this.props;
		props.toggleTrait();
	},

	onReplaceInfoAtKeyPath(info, keyPath) {
		var props = this.props;
		props.replaceTraitInfoAtKeyPath(info, keyPath);
	},

	removeTrait(event) {
		var props = this.props;
		props.removeTrait();

		this.close();
	},

	render() {
		let {
			traitSpec,
			traitValue
		} = this.props;

		var traitID = traitSpec.get('id');
		var title = traitSpec.get('title');
		var isFields = traitSpec.has('fields');

		var isSelected = (traitValue != null && traitValue !== false);
		var onClick;
		var showFields = this.state.showFields;
		var buttonClassNameExtensions = [];
		if (isFields) {
			title += ' ▾';
			onClick = this.onToggleShowFields;
			if (showFields) {
				buttonClassNameExtensions.push('-showingFields');
			}
		}
		else {
			onClick = this.onToggleTrait;
		}

		var mainButton = React.createElement(ToolbarButton, {
			key: ('button-' + traitID),
			title,
			selected: isSelected,
			onClick,
			additionalClassNameExtensions: buttonClassNameExtensions
		});

		var children = [
			mainButton
		];

		if (showFields) {
			children.push(
				React.createElement('div', {
					key: 'traitOptions',
					className: 'traitOptions',
				}, [
					React.createElement(EditorFields.FieldsHolder, {
						key: 'fields',
						fields: traitSpec.get('fields').toJS(),
						values: traitValue,
						onReplaceInfoAtKeyPath: this.onReplaceInfoAtKeyPath
					}),
					React.createElement('div', {
						key: 'buttons',
						className: 'traitOptions_buttons'
					}, [
						React.createElement(SecondaryButton, {
							key: 'removeButton',
							title: 'Remove',
							className: 'removeButton',
							onClick: this.removeTrait
						}),
						React.createElement(SecondaryButton, {
							key: 'doneButton',
							title: 'Done',
							className: 'doneButton',
							onClick: this.close
						})
					])
				])
			);
		}

		return React.createElement('div', {
			key: `button-${traitID}`,
			className: 'buttonHolder'
		}, children);
	}
});

var TraitsToolbarMixin = {
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
		};
	},

	createButtonsForTraitSpecs(traitSpecs, chosenTraits) {
		var actions = this.props.actions;

		return traitSpecs.map(function(traitSpec) {
			if (traitSpec.get('disabled', false)) {
				return null;
			}

			var traitID = traitSpec.get('id');
			var traitValue = chosenTraits[traitID];

			return React.createElement(TraitButton, {
				key: `trait-${traitID}`,
				traitSpec,
				traitValue,
				actions,
				className: 'buttonHolder',
				toggleTrait: this.toggleTraitWithID.bind(this, traitID),
				replaceTraitInfoAtKeyPath: (info, keyPath) => {
					this.replaceInfoAtKeyPathForTraitWithID(info, keyPath, traitID)
				},
				removeTrait: this.removeTraitWithID.bind(this, traitID),
			});
		}, this).toJS();
	},

	createButtonGroupForTraitSpecs(groupID, traitSpecs, chosenTraits) {
		var buttons = this.createButtonsForTraitSpecs(traitSpecs, chosenTraits);
		return React.createElement('div', {
			key: groupID,
			className: this.getChildClassNameStringWithSuffix(`-${groupID}`)
		}, buttons);
	},

	render() {
		var props = this.props;
		var traitSpecs = props.traitSpecs;
		var traits = props.traits;

		var buttonGroups = [];

		if (traitSpecs) {
			var traitSpecsFilter = this.filterTraitSpecs;
			var textItemTraitSpecs = traitSpecs.filter(traitSpecsFilter, this);

			if (textItemTraitSpecs.count() > 0) {
				buttonGroups.push(
					this.createButtonGroupForTraitSpecs('main', textItemTraitSpecs, traits)
				);
			}
		}

		return React.createElement('div', {
			key: 'traitsToolbar',
			className: this.getClassNameStringWithExtensions()
		}, buttonGroups);
	}
};

var BlockTraitsToolbar = React.createClass({
	mixins: [TraitsToolbarMixin],

	filterTraitSpecs(traitOptions) {
		if (traitOptions.has('allowedForBlockTypesByGroupType')) {
			let props = this.props;
			let blockTypeGroup = props.blockTypeGroup;

			let allowedForBlockTypesByGroupType = traitOptions.get('allowedForBlockTypesByGroupType');
			if (allowedForBlockTypesByGroupType === true) {
				return true;
			}
			var allowedForBlockTypes = allowedForBlockTypesByGroupType.get(blockTypeGroup, false);
			if (allowedForBlockTypes === true) {
				return true;
			}
			if (!allowedForBlockTypes) {
				return false;
			}

			//let blockType = props.blockType;
			//TODO: decide whether this is worth doing.
			return true;
		}

		return false;
	},

	toggleTraitWithID(traitID) {
		var actions = this.props.actions;
		actions.toggleBooleanTraitForEditedBlock(traitID);
	},

	replaceInfoAtKeyPathForTraitWithID(info, keyPath, traitID) {
		var actions = this.props.actions;
		actions.changeMapTraitUsingFunctionForEditedBlock(traitID, function(valueBefore) {
			return valueBefore.setIn(keyPath, Immutable.fromJS(info));
		});
	},

	removeTraitWithID(traitID) {
		var actions = this.props.actions;
		actions.removeTraitWithIDForEditedBlock(traitID);
	}
});

var ItemTraitsToolbar = React.createClass({
	mixins: [TraitsToolbarMixin],

	filterTraitSpecs(traitOptions) {
		if (traitOptions.get('allowedForAnyTextItems', false)) {
			return true;
		}

		return false;
	},

	toggleTraitWithID(traitID) {
		var actions = this.props.actions;
		actions.toggleBooleanTraitForEditedTextItem(traitID);
	},

	replaceInfoAtKeyPathForTraitWithID(info, keyPath, traitID) {
		var actions = this.props.actions;
		actions.changeMapTraitUsingFunctionForEditedTextItem(traitID, function(valueBefore) {
			return valueBefore.setIn(keyPath, Immutable.fromJS(info));
		});
	},

	removeTraitWithID(traitID) {
		var actions = this.props.actions;
		actions.removeTraitWithIDForEditedTextItem(traitID);
	}
});


var TextItemEditor = React.createClass({
	getDefaultProps() {
		return {
			text: '',
			traits: {},
			traitSpecs: null,
			baseClassNames: ['textItemEditor']
		};
	},

	getInitialState() {
		return {
			shiftKeyIsPressed: false,
			optionKeyIsPressed: false,
			commandKeyIsPressed: false
		};
	},

	onClick(event) {
		// Prevent block from getting click event.
		event.stopPropagation();
	},

	onModifierKeyChange(modifierKeyCode, isOn) {
		let stateChange = {};

		if (modifierKeyCode === KeyCodes.ShiftModifier) {
			stateChange.shiftKeyIsPressed = isOn
		}
		else if (modifierKeyCode === KeyCodes.OptionModifier) {
			stateChange.optionKeyIsPressed = isOn
		}
		else if (modifierKeyCode === KeyCodes.CommandModifier) {
			stateChange.commandKeyIsPressed = isOn
		}

		this.setState(stateChange);
	},

	getShowCreationOptions() {
		return this.props.text == '';
	},

	render() {
		var {
			block,
			text,
			traits,
			actions,
			blockTypeGroup,
			blockType,
			blockTypeOptions,
			traitSpecs
		} = this.props;
		let {
			shiftKeyIsPressed,
			optionKeyIsPressed,
			commandKeyIsPressed
		} = this.state;

		var showCreationOptions = this.getShowCreationOptions();

		//var textEditorInstructions = 'Press enter to create a new paragraph. Press space twice to create a new sentence.';
		var textEditorInstructions;
		if (optionKeyIsPressed) {
			textEditorInstructions = 'option-return/alt-enter: split text';
		}
		else if (commandKeyIsPressed) {
			textEditorInstructions = 'command-return/control-enter: finish editing';
		}
		else {
			textEditorInstructions = 'return/enter: new paragraph · spacebar twice: finish sentence';
		}

		let instructionsElement = React.createElement('div', {
			key: 'instructions',
			className: 'textItemEditor_instructions'
		}, [
			React.createElement('div', {
				key: 'keyShortcuts',
				className: 'textItemEditor_instructions_keyShortcuts'
			}, textEditorInstructions)
		]);

		var children = [];

		children.push(
			instructionsElement,
			React.createElement(TextItemTextArea, {
				key: 'textAreaHolder',
				text,
				shorter: showCreationOptions,
				actions,
				onModifierKeyChange: this.onModifierKeyChange,
				traitSpecs
			})
		);

		let buttonClass = 'textItemEditor_mainButton';

		if (showCreationOptions) {
			children.push(
				React.createElement(ToolbarButton, {
					key: 'beginLinkButton',
					title: 'Begin Link',
					className: buttonClass
				}),
				React.createElement(ToolbarButton, {
					key: 'beginRunButton',
					title: 'Begin Run',
					className: buttonClass
				}),
				React.createElement(ToolbarButton, {
					key: 'lineBreakButton',
					title: 'Add Line Break',
					className: buttonClass
				}),
				React.createElement(ToolbarButton, {
					key: 'catalogButton',
					title: 'Add Item from Catalog',
					className: buttonClass
				}),
				React.createElement(ToolbarButton, {
					key: 'placeholderButton',
					title: 'Add Item Placeholder',
					className: buttonClass
				})
			)
		}
		else {
			children.push(
				React.createElement(ItemTraitsToolbar, {
					key: 'traitsToolbar',
					traitSpecs,
					traits,
					blockTypeGroup,
					blockType,
					actions,
					className: 'textItemEditor_traitsToolbar'
				})
			);
		}

		if (false) {
			children.push(
				React.createElement('h5', {
					key: 'blockTraitsToolbar_heading',
					className: 'textItemEditor_blockTraitsToolbar_heading'
				}, blockTypeOptions.get('title')),
				React.createElement(BlockTraitsToolbar, {
					key: 'blockTraitsToolbar',
					traitSpecs,
					traits: block.get('traits', Immutable.Map()).toJS(),
					blockTypeGroup,
					blockType,
					actions,
					className: 'textItemEditor_traitsToolbar textItemEditor_blockTraitsToolbar'
				})
			);
		}

		return React.createElement('div', {
			key: 'textItemEditor',
			className: 'textItemEditor',
			id: 'icing-textItemEditor',
			onClick: this.onClick
		}, children);
	}
});

var ParticularEditor = React.createClass({
	getDefaultProps() {
		return {
			traits: {},
			traitSpecs: null,
			baseClassName: 'particularEditor'
		};
	},

	onClick(event) {
		event.stopPropagation();
	},

	onReplaceInfoAtKeyPath(info, infoKeyPath) {
		var props = this.props;
		var blockKeyPath = props.keyPath;
		var actions = props.actions;
		actions.updateValueForBlockAtKeyPath(blockKeyPath, Immutable.Map(), function(valueBefore) {
			return valueBefore.setIn(infoKeyPath, Immutable.fromJS(info));
		});
	},

	render() {
		var props = this.props;

		let {
			block,
			typeGroup,
			type,
			traits,
			traitSpecs,
			blockGroupIDsToTypesMap,
			actions
		} = props;

		var blockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInMap(
			typeGroup, type, blockGroupIDsToTypesMap
		);

		var elements = [];
		if (blockTypeOptions.has('fields')) {
			elements.push(
				React.createElement(EditorFields.FieldsHolder, {
					key: 'fieldsHolder',
					className: 'particularEditor_fieldsHolder',
					fields: blockTypeOptions.get('fields').toJS(),
					values: block.get('value', Immutable.Map()).toJS(),
					onReplaceInfoAtKeyPath: this.onReplaceInfoAtKeyPath
				})
			);
		}

		elements.push(
			/*React.createElement(ItemTraitsToolbar, {
				key: 'traitsToolbar',
				traitSpecs: traitSpecs,
				traits: traits,
				blockTypeGroup: typeGroup,
				blockType: type,
				className: 'textItemEditor_traitsToolbar',
				actions,
			}),
			React.createElement('h5', {
				className: 'textItemEditor_blockTraitsToolbar_heading'
			}, 'All items of block:'),*/
			React.createElement(BlockTraitsToolbar, {
				key: 'blockTraitsToolbar',
				traitSpecs,
				traits: block.get('traits', Immutable.Map()).toJS(),
				blockTypeGroup: typeGroup,
				blockType: type,
				actions,
				className: 'textItemEditor_traitsToolbar textItemEditor_blockTraitsToolbar'
			})
		)

		return React.createElement('div', {
			key: 'particularEditor',
			className: 'particularEditor',
			onClick: this.onClick
		}, elements);
	}
});


var BlockTypeChoices = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			chosenBlockTypeGroup: null,
			chosenBlockType: null
		};
	},

	render() {
		let {
			blockTypeGroups,
			blockGroupIDsToTypesMap,
			chosenBlockTypeGroup,
			onChooseBlockType
		} = this.props;

		var groupElements = blockTypeGroups.map(function(groupOptions) {
			var groupID = groupOptions.get('id');
			var typesMap = blockGroupIDsToTypesMap.get(groupID);
			if (!typesMap) {
				return null;
			}

			var typeElements = typesMap.map(function(typeOptions) {
				if (typeOptions.get('disabled', false)) {
					return null;
				}

				var type = typeOptions.get('id');
				var onClick = onChooseBlockType.bind(null, groupOptions, typeOptions);

				return React.createElement(ToolbarButton, {
					key: ('button-type-' + type),
					ref: type,
					title: typeOptions.get('title'),
					selected: (chosenBlockTypeGroup === groupOptions.get('id') && chosenBlockType === type),
					onClick: onClick
				});
			}, this).toJS();

			var groupTitle = groupOptions.get('title');
			typeElements.splice(0, 0,
				React.createElement('h5', {
					key: 'groupTitle',
					className: this.getChildClassNameStringWithSuffix('_group_title'),
				}, groupTitle)
			);

			return React.createElement('div', {
				key: `group-${groupID}`,
				className: this.getChildClassNameStringWithSuffix('_group'),
			}, typeElements);
		}, this).toJS();

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(),
		}, groupElements);
	}
});

var BlockTypeChooser = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			isCreate: false,
			chosenBlockTypeGroup: null,
			chosenBlockType: null
		};
	},

	getInitialState() {
		return {
			active: false
		};
	},

	onToggleActive() {
		this.setState({
			active: !this.state.active
		});
	},

	onChooseBlockType(typeGroupOptions, typeExtensionOptions, event) {
		this.props.onChooseBlockType(typeGroupOptions, typeExtensionOptions);

		this.setState({
			active: false
		});
	},

	render() {
		let {
			isCreate,
			chosenBlockTypeGroup,
			chosenBlockType,
			blockTypeGroups,
			blockGroupIDsToTypesMap
		} = this.props;

		let {
			active
		} = this.state;

		var classNameExtensions = [];
		var children = [];

		var mainButtonTitle;
		if (isCreate) {
			mainButtonTitle = '＋'; // Full width plus sign, not your usual plus sign.
		}
		else {
			let chosenBlockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInMap(
				chosenBlockTypeGroup, chosenBlockType, blockGroupIDsToTypesMap
			);

			mainButtonTitle = chosenBlockTypeOptions ? chosenBlockTypeOptions.get('title') : `[${chosenBlockType}]`;
		}
		children.push(
			React.createElement(ToolbarButton, {
				key: 'mainButton',
				title: mainButtonTitle,
				onClick: this.onToggleActive,
				baseClassNames: this.getChildClassNamesWithSuffix('_mainButton')
			})
		);

		if (active) {
			children.push(
				React.createElement(BlockTypeChoices, {
					key: 'choices',
					blockTypeGroups,
					blockGroupIDsToTypesMap,
					onChooseBlockType: this.onChooseBlockType,
					baseClassNames: this.getChildClassNamesWithSuffix('_choices')
				})
			);

			classNameExtensions.push('-active');
		}

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});

var BlockToolbar = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			chosenBlockTypeGroup: "text",
			chosenBlockType: "body",
			isReordering: false,
			isFocusedForReordering: false,
			baseClassNames: ["blockItemToolbar"]
		};
	},

	onChooseBlockType(typeGroupOptions, typeExtensionOptions, event) {
		var actions = this.props.actions;
		actions.onChooseBlockType(typeGroupOptions, typeExtensionOptions);
	},

	onMakeFocusForReordering() {
		let {
			actions
		} = this.props;

		actions.focusOnForReordering();
	},

	onKeepHereForReordering() {
		let {
			actions
		} = this.props;

		actions.keepInCurrentSpot();
	},

	render() {
		let {
			chosenBlockTypeGroup,
			chosenBlockType,
			blockTypeGroups,
			blockGroupIDsToTypesMap,
			actions,
			isReordering,
			isFocusedForReordering,
			anotherBlockIsFocusedForReordering
		} = this.props;

		var children = [];

		if (isReordering) {
			if (isFocusedForReordering) {
				children.push(
					React.createElement(SecondaryButton, {
						key: 'keepHereButton',
						className: 'block_reorder_keepHereButton',
						title: 'Keep Here',
						onClick: this.onKeepHereForReordering
					})
				);
			}
			else {
				let hidden = false;
				if (anotherBlockIsFocusedForReordering) {
					hidden = true;
				}

				children.push(
					React.createElement(RearrangeBlockFocusOnThis, {
						key: 'moveThis',
						onClick: this.onMakeFocusForReordering,
						hidden
					})
				);
			}
		}
		else {
			children.push(
				React.createElement(BlockTypeChooser, {
					key: 'typeChooser',
					chosenBlockTypeGroup,
					chosenBlockType,
					blockTypeGroups,
					blockGroupIDsToTypesMap,
					onChooseBlockType: this.onChooseBlockType,
					baseClassNames: this.getChildClassNamesWithSuffix('_typeChooser')
				})
			);
		}

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions()
		}, children);
	}
});

let AddBlockElement = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			addAtEnd: false,
			actions: null,
			baseClassNames: ["blocks_addBlock"]
		}
	},

	getInitialState() {
		return {
			active: false
		};
	},

	onToggleActive() {
		this.setState({
			active: !this.state.active
		});
	},

	onCreateBlockOfType(typeGroupOptions, typeExtensionOptions, event) {
		this.props.onCreateBlockOfType(typeGroupOptions, typeExtensionOptions);

		this.setState({
			active: false
		});
	},

	render() {
		let {
			blockTypeGroups,
			blockGroupIDsToTypesMap
		} = this.props;

		let {
			active
		} = this.state;

		let children = [
			React.createElement(BlockTypeChooser, {
				key: 'typeChooser',
				isCreate: true,
				blockTypeGroups,
				blockGroupIDsToTypesMap,
				onChooseBlockType: this.onCreateBlockOfType,
				baseClassNames: this.getChildClassNamesWithSuffix('_typeChooser')
			})
		];

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions()
		}, children);
	}
})

var ChangeSubsectionElement = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			isCreate: false,
			baseClassNames: ['blocks_changeSubsection']
		};
	},

	getInitialState() {
		return {
			active: false
		};
	},

	onToggleActive(event) {
		if (event) {
			event.stopPropagation();
		}

		this.setState({
			active: !this.state.active
		});
	},

	makeInactive() {
		this.setState({
			active: false
		});
	},

	onCreateSubsectionOfType(subsectionType, event) {
		let {
			actions,
			followingBlockIndex
		} = this.props;
		actions.insertSubsectionOfTypeAtBlockIndex(subsectionType, followingBlockIndex);
	},

	onChangeSubsectionType(subsectionType, event) {
		event.stopPropagation();

		let {
			actions,
			keyPath
		} = this.props;
		actions.changeTypeOfSubsectionAtKeyPath(keyPath, subsectionType);

		this.makeInactive();
	},

	onRemoveSubsection(event) {
		event.stopPropagation();

		let {
			actions,
			keyPath
		} = this.props;
		actions.removeSubsectionAtKeyPath(keyPath);

		this.makeInactive();
	},

	createElementForSubsectionInfo(subsectionInfo) {
		let {
			isCreate,
			selectedSubsectionType
		} = this.props;

		var onClickFunction;
		if (isCreate) {
			onClickFunction = this.onCreateSubsectionOfType;
		}
		else {
			onClickFunction = this.onChangeSubsectionType;
		}

		let subsectionID = subsectionInfo.get('id');

		return React.createElement(ToolbarButton, {
			key: subsectionID,
			baseClassNames: this.getChildClassNamesWithSuffix(`_choices_${subsectionID}`),
			title: subsectionInfo.get('title'),
			selected: (selectedSubsectionType === subsectionID),
			onClick: onClickFunction.bind(this, subsectionID)
		});
	},

	render() {
		let {
			isCreate,
			subsectionsSpecs,
			selectedSubsectionType,
			followingBlockIndex
		} = this.props;
		let {
			active
		} = this.state;

		//var subsectionInfos = ConfigurationStore.getAvailableSubsectionTypesForDocumentSection();

		let classNameExtensions = [];
		var children = [];

		if (isCreate) {
			children.push(
				React.createElement(SecondaryButton, {
					key: 'mainButton',
					baseClassNames: this.getChildClassNamesWithSuffix('_mainButton'),
					title: 'Portion Below',
					onClick: this.onToggleActive
				})
			);
		}
		else {
			classNameExtensions.push('-hasSelectedSubsectionType');

			let selectedSubsectionInfo = findParticularSubsectionOptionsInList(selectedSubsectionType, subsectionsSpecs);

			children.push(
				React.createElement(ToolbarButton, {
					key: 'mainButton',
					baseClassNames: this.getChildClassNamesWithSuffix('_mainButton'),
					title: selectedSubsectionInfo.get('title'),
					onClick: this.onToggleActive
				})
			);
		}

		if (active) {
			var subsectionChoices = subsectionsSpecs.map(function(subsectionInfo) {
				return this.createElementForSubsectionInfo(subsectionInfo);
			}, this).toArray();

			if (!isCreate) {
				subsectionChoices.push(
					React.createElement(ButtonDivider, {
						baseClassNames: this.getChildClassNamesWithSuffix('_divider'),
						key: 'dividerAboveRemove'
					}),
					React.createElement(ToolbarButton, {
						key: 'removeSubsection',
						baseClassNames: this.getChildClassNamesWithSuffix('_removeButton'),
						title: 'Remove Portion',
						onClick: this.onRemoveSubsection
					})
				);
			}

			children.push(
				React.createElement('div', {
					key: 'choices',
					className: this.getChildClassNameStringWithSuffix('_choices'),
				}, subsectionChoices)
			);

			classNameExtensions.push('-active');
		}

		return React.createElement('div', {
			key: ('makeSubsection-' + followingBlockIndex),
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});


var RearrangeBlockMoveHere = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			hidden: false,
			baseClassNames: ['block_reorder_moveHere']
		};
	},

	onMoveHere() {
		let {
			followingBlockIndex,
			actions
		} = this.props;

		actions.moveFocusedBlockForReorderingToBeforeBlockAtIndex(followingBlockIndex);
	},

	render() {
		let {
			followingBlockIndex,
			hidden
		} = this.props;

		var classNames = ['block_reorder'];
		var classNameExtensions = [];
		var children = [];

		children.push(
			React.createElement(SecondaryButton, {
				key: 'moveHereButton',
				//className: 'block_reorder_moveHereButton',
				className: this.getChildClassNameStringWithSuffix('_button'),
				title: 'Move Here',
				onClick: this.onMoveHere
			})
		);

		if (hidden) {
			classNameExtensions.push('-hidden');
		}

		return React.createElement('div', {
			key: ('reorder_moveHere-' + followingBlockIndex),
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});

var RearrangeBlockFocusOnThis = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			hidden: false,
			baseClassNames: ['block_reorder_moveThisButton']
		};
	},

	render() {
		let {
			hidden,
			onClick
		} = this.props;

		let classNameExtensions = [];

		if (hidden) {
			classNameExtensions.push('-hidden'); // Used for CSS animations
		}

		return React.createElement(SecondaryButton, {
			className: this.getClassNameStringWithExtensions(classNameExtensions),
			title: 'Move This',
			onClick,
			hidden
		})
	}
});

var CreateSectionElement = React.createClass({
	mixins: [BaseClassNamesMixin],

	getDefaultProps() {
		return {
			type: 'writing',
			baseClassNames: ['sections_createNewSection']
		};
	},

	render() {
		let {
			type,
			onCreateNewSection,
			onAddExternalSection,
		} = this.props;

		var buttonTitle;
		var externalButtonTitle;
		if (type === 'writing') {
			buttonTitle = 'New Writing';
			externalButtonTitle = 'Use External Writing';
		}
		else if (type === 'catalogLinks') {
			buttonTitle = 'New Links Catalog';
			externalButtonTitle = 'Use External Links Catalog';
		}
		else if (type === 'catalogElements') {
			buttonTitle = 'New Elements Catalog';
			externalButtonTitle = 'Use External Elements Catalog';
		}

		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions()
		}, [
			React.createElement(SecondaryButton, {
				key: 'addNewButton',
				className: this.getChildClassNameStringWithSuffix('_addNewButton'),
				title: buttonTitle,
				onClick: onCreateNewSection
			})
			/*,
			React.createElement(SecondaryButton, {
				key: 'addExternalButton',
				className: this.getChildClassNameStringWithSuffix('_addExternalButton'),
				title: externalButtonTitle,
				onClick: onAddExternalSection
			})*/
		]);
	}
});


var MainToolbar = React.createClass({
	getDefaultProps() {
		return {
		};
	},

	onSave() {
		var actions = this.props.actions;
		actions.saveChanges();
	},

	getIsShowingSettings() {
		return this.props.isShowingSettings;
	},

	onToggleShowSettings() {
		let {
			actions
		} = this.props;

		if (this.getIsShowingSettings()) {
			actions.hideSettings();
		}
		else {
			actions.showSettings();
		}
	},

	getIsPreviewing() {
		return this.props.isPreviewing;
	},

	onTogglePreview() {
		let {
			actions
		} = this.props;

		if (this.getIsPreviewing()) {
			actions.exitHTMLPreview();
		}
		else {
			actions.enterHTMLPreview();
		}
	},

	getIsReordering() {
		return this.props.isReordering;
	},

	onToggleReordering() {
		let {
			actions
		} = this.props;

		if (this.getIsReordering()) {
			actions.finishReordering();
		}
		else {
			actions.beginReordering();
		}
	},

	onCreateNewSection() {

	},

	createSelectForAvailableDocuments() {
		var availableDocuments = ConfigurationStore.getAvailableDocuments();
		var documentCount = availableDocuments.length;

		var options = null;
		if (availableDocuments) {
			if (availableDocuments.length > 1) {
				var options = availableDocuments.map(function(documentInfo) {
					return React.createElement('option', {
						key: documentInfo.ID,
						value: documentInfo.ID
					}, documentInfo.title);
				});
				return React.createElement('select', {
					key: 'availableDocumentsSelect',
					className: 'mainToolbar_availableDocumentsSelect'
				}, options);
			}
			else if (availableDocuments.length === 1) {
				var documentInfo = availableDocuments[0];
				return React.createElement('div', {
					key: documentInfo.ID,
					className: 'mainToolbar_availableDocumentsSingle',
					value: documentInfo.ID
				}, documentInfo.title);
			}
		}
	},

	render() {
		var props = this.props;
		var actions = props.actions;

		var children = [];

		if (ConfigurationStore.getWantsSaveUI()) {
			children.push(
				React.createElement(ToolbarButton, {
					key: 'save',
					title: 'Save',
					onClick: this.onSave
				})
			);
		}

		if (true) {
			children.push(
				React.createElement(ToolbarButton, {
					key: 'reorder',
					title: 'Reorder',
					onClick: this.onToggleReordering,
					selected: this.getIsReordering()
				})
			);
		}

		if (ConfigurationStore.getWantsViewHTMLFunctionality()) {
			children.push(
				React.createElement(ToolbarButton, {
					key: 'html',
					title: 'See HTML',
					onClick: this.onTogglePreview,
					selected: this.getIsPreviewing()
				})
			);
		}

		if (ConfigurationStore.getWantsContentSettingsFunctionality()) {
			children.push(
				React.createElement(ToolbarButton, {
					key: 'settings',
					title: 'Settings',
					onClick: this.onToggleShowSettings,
					selected: this.getIsShowingSettings()
				})
			);
		}

		if (ConfigurationStore.getShowsDocumentTitle()) {
			children.push(
				this.createSelectForAvailableDocuments()
			);
		}

		return React.createElement('div', {
			className: 'mainToolbar'
		}, children);
	}
});

var ElementToolbars = {
	MainToolbar,
	CreateSectionElement,
	BlockToolbar,
	AddBlockElement,
	BlockTraitsToolbar,
	TextItemEditor,
	ParticularEditor,
	ChangeSubsectionElement,
	RearrangeBlockMoveHere,
	ToolbarButton,
	SecondaryButton
};
module.exports = ElementToolbars;
