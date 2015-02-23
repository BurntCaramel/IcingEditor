var React = require('react');
var Toolbars = require('./editor-toolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/store-content.js');
var SettingsStore = require('../stores/store-settings.js');


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
	
	onCreateSubsectionOfType: function(subsectionType) {
		var props = this.props;
		var actions = props.actions;
		actions.insertSubsectionOfTypeAtBlockIndex(subsectionType, props.followingBlockIndex);
	},
	
	onChangeSubsectionType: function(subsectionType) {
		var props = this.props;
		var actions = props.actions;
		actions.changeTypeOfSubsectionAtKeyPath(props.keyPath, subsectionType);
		
		this.onToggleActive();
	},
	
	createElementForSubsectionInfo: function(subsectionInfo) {
		var props = this.props;
		var isCreate = props.isCreate;
		var selectedSubsectionType = props.selectedSubsectionType;
		
		var onClick;
		if (isCreate) {
			onClickFunction = this.onCreateSubsectionOfType;
		}
		else {
			onClickFunction = this.onChangeSubsectionType;
		}
		
		return React.createElement(Toolbars.SecondaryButton, {
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
				React.createElement(Toolbars.SecondaryButton, {
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
				React.createElement(Toolbars.SecondaryButton, {
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

var SubsectionElement = React.createClass({
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
	
	render: function() {
		var props = this.props;
		var state = this.state;
		
		var block = props.block;
		var blockType = block.type;
		var subsectionType = block.subsectionType;
		var keyPath = props.keyPath;
		var actions = props.actions;
		var active = state.active;
		var edited = props.edited;
		
		var classNames = ['subsection', 'subsection-type-' + subsectionType];
		
		var subsectionInfos = SettingsStore.getAvailableSubsectionTypesForDocumentSection();
		var subsectionTitle = null;
		subsectionInfos.some(function(subsectionInfo) {
			if (subsectionInfo.id === subsectionType) {
				subsectionTitle = subsectionInfo.title;
				return true;
			}
		});
		
		if (active) {
			classNames.push('section-active');
		}
		if (edited) {
			classNames.push('section-edited');
		}
		
		var children = [];
		children.push(
			React.createElement(ChangeSubsectionElement, {
				selectedSubsectionType: subsectionType,
				keyPath: keyPath,
				actions: actions
			})
		)
		
		return React.createElement('div', {
			className: classNames.join(' ')
		}, children);
	}
});

var BlockElement = React.createClass({
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
	
	onChangeChosenBlockType: function(blockTypeOptions, event) {
		var props = this.props;
		var type = blockTypeOptions.id;
		var keyPath = props.keyPath;
		var actions = props.actions;
		actions.changeTypeOfBlockAtKeyPath(type, keyPath);
		
		this.onToggleActive();
	},
	
	beginEditing: function(event) {
		var props = this.props;
		
		// If already editing, no need to do anything.
		if (props.edited) {
			return;
		}
		
		var type = props.type;
		var actions = props.actions;
		var keyPath = props.keyPath;
		
		if (type === 'placeholder') {
			actions.editBlockWithKeyPath(keyPath);
		}
		else {
			console.log('EDIT TEXT ITEM BASED BLOCK');
			actions.editTextItemBasedBlockWithKeyPathAddingIfNeeded(keyPath);
		}
	},
	
	render: function() {
		var props = this.props;
		var state = this.state;
		
		var block = props.block;
		var blockType = props.type;
		var subsectionType = props.subsectionType;
		var subsectionChildIndex = props.subsectionChildIndex;
		var keyPath = props.keyPath;
		var actions = props.actions;
		var traitsConfig = props.traitsConfig;
		var active = state.active;
		var edited = props.edited;
		
		var classNames = ['block', 'block-' + blockType, 'block-subsectionType-' + subsectionType];
		
		var childrenInfo = {};
		var children;
		if (blockType === 'placeholder') {
			var placeholderID = block.placeholderID;
			var placeholderElement = React.createElement('div', {
				className: 'block-placeholder-content'
			}, placeholderID);
			children = [placeholderElement];
		}
		else if (blockType === 'subsection') {
			children = [
				React.createElement('div', {
					
				}, block.subsectionType)
			];
		}
		else {
			var textItemsKeyPath = keyPath.concat('textItems');
			children = EditorElementCreator.reactElementsWithTextItems(
				props.textItems, textItemsKeyPath, actions, blockType, traitsConfig, childrenInfo
			);
			
			if (children.length === 0) {
				classNames.push('block-textItemsIsEmpty');
				children.push(React.createElement('span'));
			}
		}
		
		var toolbarActions = {
			onToggleActive: this.onToggleActive,
			onChangeChosenBlockType: this.onChangeChosenBlockType
		};
		
		children.push(
			React.createElement(Toolbars.BlockToolbar, {
				key: 'blockToolbar',
				chosenBlockTypeID: blockType,
				actions: toolbarActions,
				active: state.active
			})
		);
		
		if (edited) {
			if (blockType === 'placeholder') {
				children.push(
					React.createElement(Toolbars.PlaceholderEditor, {
						key: 'placeholderEditor',
						actions: actions,
						keyPath: keyPath,
						placeholderID: block.placeholderID
					})
				);
			}
		}
		
		if (active) {
			classNames.push('block-active');
		}
		if (edited) {
			classNames.push('block-edited');
		}
		
		return React.createElement('div', {
			className: classNames.join(' '),
			"data-subsection-child-index": (subsectionChildIndex + 1), // Change from zero to one based.
			onClick: this.beginEditing
		}, children);
	}
});

var TextItem = React.createClass({
	getDefaultProps: function() {
		return {
			traits: {}
		};
	},
	
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	beginEditing: function(event) {
		var props = this.props;
		var actions = props.actions;
		var keyPath = props.keyPath;
		actions.editTextItemWithKeyPath(keyPath);
		
		event.stopPropagation(); // Don't bubble to block
	},
	
	render: function() {
		var props = this.props;
		var text = props.text;
		var classes = ['textItem'];
		var id = '';
		
		if (props.edited) {
			classes.push('textItem-edited');
			id = 'icing-textItem-edited';
		}
		
		if (props.traits.bold) {
			classes.push('textItem-hasTrait-bold');
		}
		if (props.traits.italic) {
			classes.push('textItem-hasTrait-italic');
		}
		
		var contentChildren = [];
		
		if (props.edited) {
			contentChildren.push(
				React.createElement(Toolbars.TextItemEditor, {
					key: ('edited-' + props.key),
					text: text,
					traits: props.traits,
					actions: props.actions,
					blockType: props.blockType,
					availableTraits: props.traitsConfig
				})
			);
		}
		
		contentChildren.push(
			React.createElement('span', {
				key: 'text',
				className: 'text'
			}, text)
		);
		
		return React.createElement('span', {
			key: 'mainElement',
			id: id,
			className: classes.join(' '),
			onClick: this.beginEditing
		}, contentChildren);
	}
});
/*
var PlaceholderItem = React.createClass({
	getDefaultProps: function() {
		return {
			traits: {}
		};
	}
});
*/
var EditorElementCreator = {};

EditorElementCreator.BlockElement = BlockElement;
EditorElementCreator.TextItem = TextItem;

EditorElementCreator.reactElementsWithTextItems = function(textItems, keyPath, actions, blockType, traitsConfig, outputInfo) {
	if (textItems) {
		var editedTextItemIdentifier = actions.getEditedTextItemIdentifier();
		
		var editedItem = null;
		
		var elements = textItems.map(function(textItem, textItemIndex) {
			var props = {
				keyPath: keyPath.concat(textItemIndex),
				actions: actions,
				blockType: blockType,
				traitsConfig: traitsConfig
			};
	
			if (textItem.identifier) {
				var identifier = textItem.identifier;
				props.identifier = identifier;
				props.key = identifier;
				
				if (editedTextItemIdentifier === identifier) {
					props.edited = true;
					editedItem = textItem;
				}
			}
			if (textItem.traits) {
				props.traits = textItem.traits || {};
			}
			if (textItem.text) {
				props.text = textItem.text;
			}
	
			return React.createElement(TextItem, props);
		});
		/*
		if (editedItem) {
			elements.push(
				React.createElement(Toolbars.TextItemEditor, {
					text: editedItem.text,
					traits: editedItem.traits,
					actions: actions,
					availableTraits: traits,
					key: ('edited-' + editedTextItemIdentifier)
				})
			);
		}
		*/
		if (outputInfo) {
			outputInfo.editedItem = editedItem;
			outputInfo.hasEditedItem = (editedItem !== null);
		}
		
		return elements;
	}
	else {
		return [];
	}
};

EditorElementCreator.reactElementsWithBlocks = function(blocks, actions, traitsConfig) {
	var editedBlockIdentifier = actions.getEditedBlockIdentifier();
	
	var currentSubsectionType = 'normal';
	var currentSubsectionChildIndex = 0;
	
	var elementsForBlocks = blocks.map(function(block, blockIndex) {
		var props = {
			key: block.identifier,
			block: block,
			type: block.type,
			subsectionType: currentSubsectionType,
			subsectionChildIndex: currentSubsectionChildIndex,
			actions: actions,
			traitsConfig: traitsConfig,
			keyPath: ['blocks', blockIndex]
		};
		if (block.traits) {
			props.traits = block.traits;
		}
		if (block.textItems) {
			props.textItems = block.textItems;
		}
		if (block.identifier === editedBlockIdentifier) {
			props.edited = true;
		}
		
		var elementToReturn;
		
		if (block.type === 'subsection') {
			elementToReturn = React.createElement(SubsectionElement, props);
			currentSubsectionType = block.subsectionType;
			currentSubsectionChildIndex = 0;
		}
		else {
			elementToReturn = React.createElement(BlockElement, props);
			currentSubsectionChildIndex++;
		}
		
		return elementToReturn;
	});
	
	var elements = [];
	var blockCount = blocks.length;
	var previousBlockWasSubsection = false;
	for (var blockIndex = 0; blockIndex < blockCount; blockIndex++) {
		var blockType = blocks[blockIndex].type;
		var currentBlockIsSubsection = (blockType === 'subsection');
		
		if (!currentBlockIsSubsection && !previousBlockWasSubsection) {
			elements.push(
				/*React.createElement(CreateSubsectionElement, {
					followingBlockIndex: blockIndex,
					actions: actions
				})*/
				React.createElement(ChangeSubsectionElement, {
					isCreate: true,
					followingBlockIndex: blockIndex,
					actions: actions
				})	
			);
		}
		
		previousBlockWasSubsection = currentBlockIsSubsection;
		
		elements.push(elementsForBlocks[blockIndex]);
	}
	
	return elements;
};

EditorElementCreator.MainElement = React.createClass({
	getDefaultProps: function() {
		return {
			contentImmutable: null,
			specsImmutable: null,
			actions: {}
		};
	},
	
	updateTextItemEditorPosition: function() {
		var masterNode = this.getDOMNode();
		var activeTextItem = masterNode.getElementsByClassName('textItem-active')[0];
		var textItemEditor = masterNode.getElementsByClassName('textItemEditor')[0];
		
		if (activeTextItem && textItemEditor) {
			var offsetTop = activeTextItem.offsetTop;
			textItemEditor.style.top = offsetTop + 'px';
		}
	},
	
	componentDidMount: function() {
		ContentStore.on('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.on('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentWillUnmount: function() {  
		ContentStore.off('contentChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedItemChangedForDocumentSection', this.contentChangedForDocumentSection);
		ContentStore.off('editedBlockChangedForDocumentSection', this.contentChangedForDocumentSection);
	},
	
	componentDidUpdate: function(prevProps, prevState) {
		this.updateTextItemEditorPosition();
	},
	
	contentChangedForDocumentSection: function(documentID, sectionID) {
		var props = this.props;
		if (
			(documentID === props.documentID) ||
			(sectionID === props.sectionID)
		) {
			this.forceUpdate();
		}
	},
	
	render: function() {
		var props = this.props;
		var contentImmutable = props.contentImmutable;
		var specsImmutable = props.specsImmutable;
		var actions = props.actions;
		
		var classNames = ['blocks'];
	
		var elements = [];
	
		if (contentImmutable && contentImmutable.get('blocks')) {
			var content = contentImmutable.toJS();
			var blocks = content.blocks;
			var traitsConfig = specsImmutable.get('traits', Immutable.Map()).toJS();
	
			elements = EditorElementCreator.reactElementsWithBlocks(blocks, actions, traitsConfig);
		}
		else {
			elements = React.createElement('div', {}, 'Loading…');
		}
	
		var isEditingBlock = (actions.getEditedBlockIdentifier() != null);
		if (isEditingBlock) {
			classNames.push('blocks-hasEditedBlock')
		}
	
		return React.createElement('div', {
			key: 'blocks',
			className: classNames.join(' ')
		}, elements);
	}
});

module.exports = EditorElementCreator;