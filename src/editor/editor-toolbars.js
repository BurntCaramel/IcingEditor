var React = require('react');
var AppDispatcher = require('../app-dispatcher');
var SettingsStore = require('../stores/store-settings');
var PreviewStore = require('../stores/store-preview');
var eventIDs = require('../actions/actions-content-eventIDs');
var documentSectionEventIDs = eventIDs.documentSection;

var UIMixins = require('../ui/ui-mixins');
var ButtonMixin = UIMixins.ButtonMixin;


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
		var actions = this.props.actions;
		console.log('key down', e.which);
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
		
		if (true) {
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
		}
	},
	
	onKeyPress: function(e) {
		var actions = this.props.actions;
		console.log('key press', e);
		if (true) {
			if (e.which == 13) { // Return/enter key.
				if (e.shiftKey) {
					actions.addLineBreakAfterEditedTextItem();
				}
				// Command key
				else if (e.metaKey) {
					console.log('FINSIH EDITING');
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
					}
				}
				
				e.preventDefault();
			}
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

var TextItemAttributesToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			bold: false,
			italic: false,
			link: null
		};
	},
	
	onToggleBold: function() {
		var actions = this.props.actions;
		actions.toggleBoldForEditedTextItem();
	},
	
	onToggleItalic: function() {
		var actions = this.props.actions;
		actions.toggleItalicForEditedTextItem();
	},
	
	onToggleEditLink: function() {
		
	},
	
	onToggleShowIdentifier: function() {
		
	},
	
	onToggleShowTraits: function() {
		
	},
	
	onSplit: function() {
		console.log('onSplit');
		//var actions = this.props.actions;
		//actions.splitTextInRangeOfEditedTextItem(null);
	},
	
	render: function() {
		var props = this.props;
		
		return React.createElement('div', {
			className: 'textItemEditor-toolbar'
		}, [
			React.createElement(ToolbarButton, {
				key: ('button-bold'),
				title: 'Bold',
				selected: props.bold,
				onClick: this.onToggleBold
			}),
			React.createElement(ToolbarButton, {
				key: ('button-italic'),
				title: 'Italic',
				selected: props.italic,
				onClick: this.onToggleItalic
			}),
			React.createElement(ToolbarDivider),
			React.createElement(ToolbarButton, {
				key: ('button-link'),
				title: (props.link != null) ? 'Edit Link' : 'Link',
				selected: props.link != null,
				onClick: this.onToggleEditLink
			}),
			React.createElement(ToolbarDivider),
			React.createElement(ToolbarButton, {
				key: ('button-identifier'),
				title: 'Identifier',
				selected: props.identifier != null,
				onClick: this.onToggleShowIdentifier
			}),
			React.createElement(ToolbarButton, {
				key: ('button-split'),
				className: 'textItemEditor-toolbar-split',
				title: 'Split',
				onClick: this.onSplit
			})
		]);
	}
});

var ItemTraitsToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			enabledTraits: {}
		};
	},
	
	onToggleTrait: function(traitID) {
		console.log('toggle trait', traitID);
		var actions = this.props.actions;
		actions.toggleTraitForEditedTextItem(traitID);
	},
	
	createButtonsForTextItemTraitSpecs: function(traitSpecs, chosenTraits) {
		return traitSpecs.map(function(textItemTraitSpec) {
			var traitID = textItemTraitSpec.id;
			var onToggleTrait = this.onToggleTrait.bind(this, traitID);
			return React.createElement(ToolbarButton, {
				key: ('button-' + traitID),
				title: textItemTraitSpec.title,
				selected: !!(chosenTraits[traitID]),
				onClick: onToggleTrait
			});
		}, this);
	},
	
	createButtonGroupForTextItemTraitSpecs: function(groupID, traitSpecs, chosenTraits) {
		var buttons = this.createButtonsForTextItemTraitSpecs(traitSpecs, chosenTraits);
		return React.createElement('div', {
			key: groupID,
			className: ('itemEditor-traits-toolbar-' + groupID)
		}, buttons);
	},
	
	render: function() {
		var props = this.props;
		var availableTraits = props.availableTraits;
		var traits = props.traits;
		
		var buttonGroups = [];
		
		if (availableTraits) {
			var itemsByBlock = availableTraits.itemsByBlock;
			var itemsByAnyBlock = itemsByBlock['*'];
		
			var textItemTraits = itemsByAnyBlock.text;
			buttonGroups.push(this.createButtonGroupForTextItemTraitSpecs('anyBlockType', textItemTraits, traits));
		}
		
		return React.createElement('div', {
			className: props.className,
			key: 'holder'
		}, buttonGroups);
	}
});

var TextItemEditor = React.createClass({
	getDefaultProps: function() {
		return {
			text: '',
			traits: {},
			availableTraits: {}
		};
	},
	
	render: function() {
		var props = this.props;
		var text = props.text;
		var traits = props.traits;
		var actions = props.actions;
		var blockType = props.blockType;
		var availableTraits = props.availableTraits;
		
		return React.createElement('div', {
			key: 'textItemEditor',
			className: 'textItemEditor',
			id: 'icing-textItemEditor'
		}, [
			React.createElement(TextItemTextArea, {
				text: text,
				actions: actions,
				availableTraits: availableTraits,
				key: 'textAreaHolder'
			}),
			/*React.createElement(TextItemAttributesToolbar, {
				actions: actions,
				availableTraits: availableTraits,
				bold: traits.bold,
				italic: traits.italic,
				key: 'oldTraitsToolbar',
			}),*/
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
				}, 'Press return/enter to split text')
			]),
			React.createElement(ItemTraitsToolbar, {
				actions: actions,
				availableTraits: availableTraits,
				traits: traits,
				blockType: blockType,
				key: 'traitsToolbar',
				className: 'textItemEditor_traitsToolbar'
			}),
		]);
	}
});

var PlaceholderEditor = React.createClass({
	getIDField: function() {
		var IDField = this.refs.IDField;
		return IDField.getDOMNode();
	},
	
	componentDidMount: function() {
		this.getIDField().focus();
	},
	
	hasNoText: function() {
		var text = this.refs.IDField.getDOMNode().value;
		return (text.length === 0);
	},
	
	onKeyDown: function(e) {
		var actions = this.props.actions;
		console.log('key down', e.which);
		
		if (true) {
			if (e.which == 8) { // Delete/Backspace key
				if (this.hasNoText()) {
					console.log('REMOVE ME');
					actions.removeEditedBlock();
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
		}
	},
	
	onKeyPress: function(e) {
		var actions = this.props.actions;
		if (true) {
			if (e.which == 13) { // Return/enter key.
				actions.insertRelatedBlockAfterEditedBlock();
				
				e.preventDefault();
			}
		}
	},
	
	onChange: function() {
		var placeholderID = this.getIDField().value;
		var props = this.props;
		var actions = props.actions;
		var keyPath = props.keyPath;
		actions.changePlaceholderIDOfBlockAtKeyPath(placeholderID, keyPath);
	},
	
	render: function() {
		var props = this.props;
		var placeholderID = this.props.placeholderID;
		return React.createElement('div', {
			className: 'placeholderEditor',
		}, React.createElement('input', {
			ref: 'IDField',
			type: 'text',
			value: placeholderID,
			className: 'placeholderEditor-IDField',
			onChange: this.onChange,
			onKeyDown: this.onKeyDown,
			onKeyPress: this.onKeyPress
		}));
	}
});

var BlockTypeChooser = React.createClass({
	getDefaultProps: function() {
		return {
			chosenBlockTypeID: 'body'
		};
	},
	
	onToggleActive: function() {
		var actions = this.props.actions;
		actions.onToggleActive();
	},
	
	onChangeChosenBlockType: function(blockTypeOptions, event) {
		var actions = this.props.actions;
		actions.onChangeChosenBlockType(blockTypeOptions, event);
	},
	
	makeButtonForBlockTypeOptions: function(blockTypeOptions, chosenBlockTypeID, onClick) {
		return React.createElement(ToolbarButton, {
			key: ('button-type-' + blockTypeOptions.id),
			ref: blockTypeOptions.id,
			title: blockTypeOptions.title,
			selected: chosenBlockTypeID === blockTypeOptions.id,
			onClick: onClick
		});
	},
	
	render: function() {
		var props = this.props;
		var chosenBlockTypeID = props.chosenBlockTypeID;
		var availableBlockTypes = props.availableBlockTypes;
		var actions = props.actions;
		var active = props.active;
		
		var children;
		if (active) {
			children = availableBlockTypes.map(function(blockTypeOptions) {
				var onChangeChosenBlockType = this.onChangeChosenBlockType.bind(this, blockTypeOptions);
				return this.makeButtonForBlockTypeOptions(blockTypeOptions, chosenBlockTypeID, onChangeChosenBlockType);
			}, this);
		}
		else {
			var chosenBlockTypeOptions = availableBlockTypes.filter(function(blockTypeOptions) {
				return (blockTypeOptions.id === chosenBlockTypeID);
			}, this);
			if (chosenBlockTypeOptions) {
				chosenBlockTypeOptions = chosenBlockTypeOptions[0];
			}
			else {
				chosenBlockTypeOptions = null;
			}
			
			var button = this.makeButtonForBlockTypeOptions(chosenBlockTypeOptions, chosenBlockTypeID, this.onToggleActive);
			
			children = [
				button
			];
		}
		
		var classes = ['blockItemToolbar_typeChooser'];
		if (active) {
			classes.push('blockItemToolbar_typeChooser-active');
		}
		
		return React.createElement('div', {
			className: classes.join(' ')
		}, children);
	}
});

var BlockToolbar = React.createClass({
	getDefaultProps: function() {
		return {
			chosenBlockTypeID: 'body',
			availableBlockTypes: SettingsStore.getAvailableBlockTypesForDocumentSection()
		};
	},
	
	onToggleActive: function() {
		var actions = this.props.actions;
		actions.onToggleActive();
	},
	
	onChangeChosenBlockType: function(blockTypeOptions, event) {
		var actions = this.props.actions;
		actions.onChangeChosenBlockType(blockTypeOptions, event);
	},
	
	makeButtonForBlockTypeOptions: function(blockTypeOptions, chosenBlockTypeID, onClick) {
		return React.createElement(ToolbarButton, {
			key: ('button-type-' + blockTypeOptions.id),
			ref: blockTypeOptions.id,
			title: blockTypeOptions.title,
			selected: chosenBlockTypeID === blockTypeOptions.id,
			onClick: onClick
		});
	},
	
	render: function() {
		var props = this.props;
		var chosenBlockTypeID = props.chosenBlockTypeID;
		var availableBlockTypes = props.availableBlockTypes;
		var actions = props.actions;
		var active = props.active;
		
		var children = [
			React.createElement(BlockTypeChooser, {
				chosenBlockTypeID: chosenBlockTypeID,
				availableBlockTypes: availableBlockTypes,
				actions: actions,
				active: active
			})/*,
			React.createElement(SecondaryButton, {
				title: 'Rearrange',
				actions: actions
			})*/
		];
		
		var classes = ['blockItemToolbar'];
		if (active) {
			classes.push('blockItemToolbar-active');
		}
		
		return React.createElement('div', {
			className: classes.join(' ')
		}, children);
	}
});

var MainToolbar = React.createClass({
	getDefaultProps: function() {
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
					title: 'Preview',
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
	MainToolbar: MainToolbar,
	BlockToolbar: BlockToolbar,
	TextItemEditor: TextItemEditor,
	PlaceholderEditor: PlaceholderEditor
};
module.exports = ElementToolbars;