var React = require('react');
var AppDispatcher = require('../app-dispatcher');
var SettingsStore = require('../stores/store-settings');
var PreviewStore = require('../stores/store-preview');
var Immutable = require('immutable');
var eventIDs = require('../actions/actions-content-eventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

var EditorFields = require('./editor-fields');
let {
	ButtonMixin,
	BaseClassNamesMixin
} = require('../ui/ui-mixins');

var BlockTypesAssistant = require('../assistants/block-types-assistant');
var findParticularBlockTypeOptionsWithGroupAndTypeInList = BlockTypesAssistant.findParticularBlockTypeOptionsWithGroupAndTypeInList;


var TextItemTextArea = React.createClass({
	getInitialState: function() {
		return {
			spaceWasJustPressed: false
		};
	},
	
	componentWillMount: function() {
		var actions = this.props.actions;
		actions.registerSelectedTextRangeFunctionForEditedItem(this.getTextSelectionRange);
	},
	
	componentWillUnmount: function() {
		var actions = this.props.actions;
		actions.unregisterSelectedTextRangeFunctionForEditedItem();
	},
	
	onChange: function() {
		var actions = this.props.actions;
		var text = this.refs.textarea.getDOMNode().value;
		actions.setTextForEditedTextItem(text);
	},
	
	hasNoText: function() {
		var text = this.refs.textarea.getDOMNode().value;
		return (text.length === 0);
	},
	
	getTextSelectionRange: function() {
		var textarea = this.refs.textarea.getDOMNode();
		return {
			"start": textarea.selectionStart,
			"end": textarea.selectionEnd
		};
	},
	
	selectionIsCaretAtBeginning: function() {
		var textSelectionRange = this.getTextSelectionRange();
		return (textSelectionRange.start === 0 && textSelectionRange.end === 0);
	},
	
	onKeyDown: function(e) {
		e.stopPropagation();
		
		var actions = this.props.actions;
		
		//console.log('key down', e.which);
		if (e.which == 32) { // Space key
			if (this.state.spaceWasJustPressed) {
				actions.addNewTextItemAfterEditedTextItem();
				this.setState({spaceWasJustPressed: false});
				e.preventDefault();
			}
			else {
				this.setState({spaceWasJustPressed: true});
			}
		}
		else {
			this.setState({spaceWasJustPressed: false});
		}
		
		if (e.which == 8) { // Delete/Backspace key
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
		else if (e.which == 9) { // Tab key
			if (e.shiftKey) {
				actions.editPreviousItemBeforeEditedTextItem();
			}
			else {
				actions.editNextItemAfterEditedTextItem();
			}
	
			e.preventDefault();
		}
	},
	
	onKeyPress: function(e) {
		e.stopPropagation();
		
		var actions = this.props.actions;
		
		//console.log('key press', e);

		if (e.which == 13) { // Return/enter key.
			if (e.shiftKey) {
				actions.addLineBreakAfterEditedTextItem();
			}
			// Command key
			else if (e.metaKey) {
				actions.finishEditing();
			}
			// Option key
			else if (e.altKey) {
				actions.addNewTextItemAfterEditedTextItem();
			}
			else {
				if (this.hasNoText()) {
					actions.splitBlockBeforeEditedTextItem();
				}
				else {
					var textSelectionRange = this.getTextSelectionRange();
					actions.splitTextInRangeOfEditedTextItem(textSelectionRange);
					
					// If text was selected, just break it into its own item but not into its own block.
					if (textSelectionRange.start === textSelectionRange.end) {
						actions.splitBlockBeforeEditedTextItem();
					}
				}
			}
			
			e.preventDefault();
		}
	},
	
	componentDidMount: function() {
		var node = this.getDOMNode();
		node.focus();
	},
	
	render: function() {
		var text = this.props.text;
		
		return React.createElement('textarea', {
			ref: 'textarea',
			value: text,
			className: 'editedTextItemTextArea',
			width: 10,
			height: 20,
			//key: 'textarea',
			onChange: this.onChange,
			onKeyDown: this.onKeyDown,
			onKeyPress: this.onKeyPress
		});
	}
});

var ToolbarButton = React.createClass({
	mixins: [ButtonMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['toolbarButton']
		};
	}
});

var SecondaryButton = React.createClass({
	mixins: [ButtonMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['secondaryButton']
		};
	}
});

var ToolbarDivider = React.createClass({
	render: function() {
		//var text = ' · ';
		var text = ' ';
		return React.createElement('span', {
			className: 'toolbarDivider'
		}, text);
	}
});

var TraitButton = React.createClass({
	getDefaultProps: function() {
		return {
			traitSpec: {},
			traitValue: null
		};
	},
	
	getInitialState: function() {
		return {
			showFields: false
		}
	},
	
	toggleShowFields: function(event) {
		if (event) {
			event.stopPropagation();
		}
		
		this.setState({
			showFields: !this.state.showFields
		});
	},
	
	toggleTrait: function(event) {
		event.stopPropagation();
		
		var props = this.props;
		props.toggleTrait();
	},
	
	changeTraitInfo: function(changeInfo) {
		var props = this.props;
		props.changeTraitInfo(changeInfo);
	},
	
	removeTrait: function(event) {
		event.stopPropagation();
		
		var props = this.props;
		props.removeTrait();
		
		this.toggleShowFields();
	},
	
	render: function() {
		var props = this.props;
		
		var traitSpec = props.traitSpec;
		var traitID = traitSpec.get('id');
		var traitValue = props.traitValue;
		var isFields = traitSpec.has('fields');
		
		var isSelected = (traitValue != null && traitValue != false);
		var onClick;
		var showFields = this.state.showFields;
		var buttonClassNameExtensions = [];
		if (isFields) {
			onClick = this.toggleShowFields;
			if (showFields) {
				buttonClassNameExtensions.push('-showingFields');
			}
		}
		else {
			onClick = this.toggleTrait;
		}
		
		var mainButton = React.createElement(ToolbarButton, {
			key: ('button-' + traitID),
			title: traitSpec.get('title'),
			selected: isSelected,
			onClick: onClick,
			additionalClassNameExtensions: buttonClassNameExtensions
		});
		
		var children = [
			mainButton
		];
		
		if (showFields) {
			children.push(
				React.createElement('div', {
					className: 'traitFieldsHolder',
				}, [
					React.createElement(EditorFields.FieldsHolder, {
						fields: traitSpec.get('fields').toJS(),
						values: traitValue,
						onChangeInfo: this.changeTraitInfo
					}),
					React.createElement(SecondaryButton, {
						key: 'removeButton',
						title: 'Remove',
						className: 'removeButton',
						onClick: this.removeTrait
					})
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
	
	getDefaultProps: function() {
		return {
		};
	},
	
	createButtonsForTraitSpecs: function(traitSpecs, chosenTraits) {
		var actions = this.props.actions;
		
		return traitSpecs.map(function(traitSpec) {
			if (traitSpec.get('disabled', false)) {
				return null;
			}
			
			var traitID = traitSpec.get('id');
			var traitValue = chosenTraits[traitID];
			
			return React.createElement(TraitButton, {
				key: `trait-${traitID}`,
				traitSpec: traitSpec,
				traitValue: traitValue,
				actions: actions,
				className: 'buttonHolder',
				toggleTrait: this.toggleTraitWithID.bind(this, traitID),
				changeTraitInfo: this.changeTraitInfoWithID.bind(this, traitID),
				removeTrait: this.removeTraitWithID.bind(this, traitID),
			});
		}, this).toJS();
	},
	
	createButtonGroupForTraitSpecs: function(groupID, traitSpecs, chosenTraits) {
		var buttons = this.createButtonsForTraitSpecs(traitSpecs, chosenTraits);
		return React.createElement('div', {
			key: groupID,
			className: this.getClassNameStringWithChildSuffix(`-${groupID}`)
		}, buttons);
	},
	
	render: function() {
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
	
	filterTraitSpecs: function(traitOptions) {
		if (traitOptions.has('allowedForBlockTypesByGroupType')) {
			let props = this.props;
			let blockTypeGroup = props.blockTypeGroup;
			
			let allowedForBlockTypesByGroupType = traitOptions.get('allowedForBlockTypesByGroupType');
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
	
	toggleTraitWithID: function(traitID) {
		var actions = this.props.actions;
		actions.toggleBooleanTraitForEditedBlock(traitID);
	},
	
	changeTraitInfoWithID: function(traitID, changeInfo) {
		var actions = this.props.actions;
		actions.changeMapTraitUsingFunctionForEditedBlock(traitID, function(valueBefore) {
			return valueBefore.mergeDeep(changeInfo);
		});
	},
	
	removeTraitWithID: function(traitID) {
		var actions = this.props.actions;
		actions.removeTraitWithIDForEditedBlock(traitID);
	}
});

var ItemTraitsToolbar = React.createClass({
	mixins: [TraitsToolbarMixin],
	
	filterTraitSpecs: function(traitOptions) {
		if (traitOptions.get('allowedForAnyTextItems', false)) {
			return true;
		}
		
		return false;
	},
	
	toggleTraitWithID: function(traitID) {
		var actions = this.props.actions;
		actions.toggleBooleanTraitForEditedTextItem(traitID);
	},
	
	changeTraitInfoWithID: function(traitID, changeInfo) {
		var actions = this.props.actions;
		actions.changeMapTraitUsingFunctionForEditedTextItem(traitID, function(valueBefore) {
			return valueBefore.mergeDeep(changeInfo);
		});
	},
	
	removeTraitWithID: function(traitID) {
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
	
	onClick(event) {
		// Prevent block from getting click event.
		event.stopPropagation();
	},
	
	render() {
		var props = this.props;
		var {
			block,
			text,
			traits,
			actions,
			blockTypeGroup,
			blockType,
			traitSpecs
		} = props;
		
		//var textEditorInstructions = 'Press enter to create a new paragraph. Press space twice to create a new sentence.';
		var textEditorInstructions = 'enter: new paragraph · spacebar twice: new sentence';
		
		return React.createElement('div', {
			key: 'textItemEditor',
			className: 'textItemEditor',
			id: 'icing-textItemEditor',
			onClick: this.onClick
		}, [
			React.createElement(TextItemTextArea, {
				key: 'textAreaHolder',
				text,
				actions,
				traitSpecs
			}),
			React.createElement('div', {
				key: 'instructions',
				className: 'textItemEditor_instructions'
			}, [
				/*React.createElement('div', {
					key: 'instructions-traits',
					className: 'instructions_traits'
				}, 'Use the buttons below'),*/
				React.createElement('div', {
					key: 'instructions-split',
					className: 'textItemEditor_instructions_split'
				}, textEditorInstructions)
			]),
			React.createElement(ItemTraitsToolbar, {
				key: 'traitsToolbar',
				traitSpecs,
				traits,
				blockTypeGroup,
				blockType,
				actions,
				className: 'textItemEditor_traitsToolbar'
			}),
			React.createElement('h5', {
				className: 'textItemEditor_blockTraitsToolbar_heading'
			}, 'All items inside this block:'),
			React.createElement(BlockTraitsToolbar, {
				key: 'blockTraitsToolbar',
				traitSpecs,
				traits: block.get('traits', Immutable.Map()).toJS(),
				blockTypeGroup,
				blockType,
				actions,
				className: 'textItemEditor_traitsToolbar textItemEditor_blockTraitsToolbar'
			})
		]);
	}
});

var ParticularEditor = React.createClass({
	getDefaultProps: function() {
		return {
			traits: {},
			traitSpecs: null,
			baseClassName: 'particularEditor'
		};
	},
	
	onClick(event) {
		event.stopPropagation();
	},
	
	changeFieldsInfo: function(changeInfo) {
		var props = this.props;
		var keyPath = props.keyPath;
		var actions = props.actions;
		actions.updateValueForBlockAtKeyPath(keyPath, Immutable.Map(), function(valueBefore) {
			return valueBefore.mergeDeep(changeInfo);
		});
	},
	
	render: function() {
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
		
		var blockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInList(
			typeGroup, type, blockGroupIDsToTypesMap
		);
		
		var elements = [];
		if (blockTypeOptions.has('fields')) {
			elements.push(
				React.createElement(EditorFields.FieldsHolder, {
					fields: blockTypeOptions.get('fields').toJS(),
					values: block.get('value', Immutable.Map()).toJS(),
					onChangeInfo: this.changeFieldsInfo
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
			className: 'particularEditor',
			onClick: this.onClick
		}, elements);
	}
});


var BlockTypeChooser = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			baseClassNames: ['blockItemToolbar_typeChooser'],
		};
	},
	
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	onToggleActive: function() {
		this.setState({
			active: !this.state.active
		});
	},
	
	onChangeChosenBlockType: function(typeGroupOptions, typeExtensionOptions, event) {
		event.stopPropagation();
		
		var actions = this.props.actions;
		actions.onChangeChosenBlockType(typeGroupOptions, typeExtensionOptions, event);
		
		this.setState({
			active: false
		});
	},
	
	render: function() {
		// PROPS
		var props = this.props;
		var chosenBlockTypeGroup = props.chosenBlockTypeGroup;
		var chosenBlockType = props.chosenBlockType;
		var blockTypeGroups = props.blockTypeGroups;
		var blockGroupIDsToTypesMap = props.blockGroupIDsToTypesMap;
		var actions = props.actions;
		// STATE
		var state = this.state;
		var active = state.active;
		
		var classNameExtensions = [];
		var children = [];
		
		var chosenBlockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInList(
			chosenBlockTypeGroup, chosenBlockType, blockGroupIDsToTypesMap
		);
		
		children.push(
			React.createElement(ToolbarButton, {
				key: 'mainButton',
				baseClassNames: this.getClassNamesWithChildSuffix('_mainButton'),
				title: chosenBlockTypeOptions.get('title'),
				onClick: this.onToggleActive
			})
		);
		
		if (active) {
			var groupElements = blockTypeGroups.map(function(groupOptions) {
				var groupID = groupOptions.get('id');
				var typesMap = blockGroupIDsToTypesMap.get(groupID);
				var typeElements = typesMap.map(function(typeOptions) {
					var type = typeOptions.get('id');
					var onClick = this.onChangeChosenBlockType.bind(this, groupOptions, typeOptions);
					
					return React.createElement(ToolbarButton, {
						key: ('button-type-' + type),
						ref: type,
						title: typeOptions.get('title'),
						selected: chosenBlockTypeGroup === groupOptions.get('id') && chosenBlockType === type,
						onClick: onClick
					});
				}, this).toJS();
				
				var groupTitle = groupOptions.get('title');
				typeElements.splice(0, 0,
					React.createElement('h5', {
						className: this.getClassNameStringWithChildSuffix('_choices_group_title'),
					}, groupTitle)
				);
				
				return React.createElement('div', {
					className: this.getClassNameStringWithChildSuffix('_choices_group'),
				}, typeElements);
			}, this).toJS();
			
			children.push(
				React.createElement('div', {
					className: this.getClassNameStringWithChildSuffix('_choices'),
				}, groupElements)
			);
		}
		
		if (active) {
			classNameExtensions.push('-active');
		}
		
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(classNameExtensions)
		}, children);
	}
});

var BlockToolbar = React.createClass({
	mixins: [BaseClassNamesMixin],
	
	getDefaultProps: function() {
		return {
			chosenBlockTypeGroup: "text",
			chosenBlockType: "body",
			baseClassNames: ["blockItemToolbar"]
		};
	},
	
	onClick(event) {
		event.stopPropagation();	
	},
	
	render: function() {
		var props = this.props;
		var actions = props.actions;
		
		var children = [
			React.createElement(BlockTypeChooser, {
				key: 'typeChooser',
				chosenBlockTypeGroup: props.chosenBlockTypeGroup,
				chosenBlockType: props.chosenBlockType,
				blockTypeGroups: props.blockTypeGroups,
				blockGroupIDsToTypesMap: props.blockGroupIDsToTypesMap,
				actions: actions,
				baseClassNames: this.getClassNamesWithChildSuffix('_typeChooser')
			})/*,
			React.createElement(SecondaryButton, {
				title: 'Rearrange',
				actions: actions
			})*/
		];
		
		return React.createElement('div', {
			className: this.getClassNameStringWithExtensions(),
			onClick: this.onClick
		}, children);
	}
});

var ChangeSubsectionElement = React.createClass({
	getDefaultProps: function() {
		return {
			isCreate: false
		};
	},
	
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	onToggleActive: function() {
		this.setState({
			active: !this.state.active
		});
	},
	
	onCreateSubsectionOfType: function(subsectionType, event) {
		event.stopPropagation();
		
		let {
			actions
		} = this.props;
		actions.insertSubsectionOfTypeAtBlockIndex(subsectionType, props.followingBlockIndex);
	},
	
	onChangeSubsectionType: function(subsectionType, event) {
		event.stopPropagation();
		
		let {
			actions
		} = this.props;
		actions.changeTypeOfSubsectionAtKeyPath(props.keyPath, subsectionType);
		
		this.onToggleActive();
	},
	
	createElementForSubsectionInfo: function(subsectionInfo) {
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
		
		return React.createElement(SecondaryButton, {
			key: subsectionInfo.id,
			baseClassNames: ['blocks_makeSubsection_choices_' + subsectionInfo.id],
			title: subsectionInfo.title,
			selected: (selectedSubsectionType === subsectionInfo.id),
			onClick: onClickFunction.bind(this, subsectionInfo.id)
		});
	},
	
	render: function() {
		var props = this.props;
		var isCreate = props.isCreate;
		
		var subsectionInfos = SettingsStore.getAvailableSubsectionTypesForDocumentSection();
		
		var classNames = ['blocks_makeSubsection'];
		var children = [];
		
		if (props.isCreate) {
			children.push(
				React.createElement(SecondaryButton, {
					key: 'mainButton',
					baseClassNames: ['blocks_makeSubsection_mainButton'],
					title: 'Make Subsection',
					onClick: this.onToggleActive
				})
			);
		}
		else {
			classNames.push('blocks_changeSubsection-hasSelectedSubsectionType')
			
			var selectedSubsectionType = props.selectedSubsectionType;
			var selectedSubsectionInfo = null;
			subsectionInfos.some(function(subsectionInfo) {
				if (subsectionInfo.id === selectedSubsectionType) {
					selectedSubsectionInfo = subsectionInfo;
					return true;
				}
			});
			
			children.push(
				React.createElement(SecondaryButton, {
					key: 'mainButton',
					baseClassNames: ['blocks_makeSubsection_mainButton'],
					title: selectedSubsectionInfo.title,
					onClick: this.onToggleActive
				})
			);
		}
		
		if (this.state.active) {
			var subsectionChoices = subsectionInfos.map(function(subsectionInfo) {
				return this.createElementForSubsectionInfo(subsectionInfo);
			}, this);
			
			children.push(
				React.createElement('div', {
					className: 'blocks_makeSubsection_choices',
				}, subsectionChoices)
			);
			
			classNames.push(
				'blocks_makeSubsection-active'
			);
		}
		
		return React.createElement('div', {
			key: ('makeSubsection-' + props.followingBlockIndex),
			className: classNames.join(' ')
		}, children);
	}
});

var MainToolbar = React.createClass({
	getDefaultProps() {
		return {
		};
	},
	
	onSave: function() {
		var actions = this.props.actions;
		actions.saveChanges();
	},
	
	onTogglePreview: function() {
		var actions = this.props.actions;
		
		var isPreviewing = PreviewStore.getIsPreviewing();
		if (isPreviewing) {
			actions.exitHTMLPreview();
		}
		else {
			actions.enterHTMLPreview();
		}
	},
	
	createSelectForAvailableDocuments: function() {
		var availableDocuments = SettingsStore.getAvailableDocuments();
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
	
	render: function() {
		var props = this.props;
		var actions = props.actions;
		
		var children = [];
		
		if (SettingsStore.getWantsSaveFunctionality()) {
			children.push(
				React.createElement(ToolbarButton, {
					title: 'Save',
					onClick: this.onSave
				})
			);
		}
		
		if (SettingsStore.getWantsViewHTMLFunctionality()) {
			children.push(
				React.createElement(ToolbarButton, {
					title: 'See HTML',
					onClick: this.onTogglePreview,
					selected: PreviewStore.getIsPreviewing()
				})
			);
		}
		
		children.push(
			this.createSelectForAvailableDocuments()
		);
		
		return React.createElement('div', {
			className: 'mainToolbar'
		}, children);
	}
});

var ElementToolbars = {
	MainToolbar,
	BlockToolbar,
	BlockTraitsToolbar,
	TextItemEditor,
	ParticularEditor,
	ChangeSubsectionElement,
	ToolbarButton,
	SecondaryButton
};
module.exports = ElementToolbars;