var React = require('react');
var Toolbars = require('./editor-toolbars');
var Immutable = require('immutable');
var ContentStore = require('../stores/store-content.js');
//var SettingsStore = require('../stores/store-settings.js');


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
		var type = props.type;
		if (type === 'placeholder') {
			var actions = props.actions;
			var keyPath = props.keyPath;
			actions.editBlockWithKeyPath(keyPath);
		}
	},
	
	render: function() {
		var props = this.props;
		var state = this.state;
		
		var block = props.block;
		var blockType = props.type;
		var keyPath = props.keyPath;
		var actions = props.actions;
		var traitsConfig = props.traitsConfig;
		var active = state.active;
		var edited = props.edited;
		
		var childrenInfo = {};
		var children;
		if (blockType === 'placeholder') {
			var placeholderID = block.placeholderID;
			var placeholderElement = React.createElement('div', {
				className: 'block-placeholder-content'
			}, placeholderID);
			children = [placeholderElement];
		}
		else {
			var textItemsKeyPath = keyPath.concat('textItems');
			children = EditorElementCreator.reactElementsWithTextItems(props.textItems, textItemsKeyPath, actions, blockType, traitsConfig, childrenInfo);
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
		
		var classNames = ['block', 'block-' + blockType];
		
		if (active) {
			classNames.push('block-active');
		}
		if (edited) {
			classNames.push('block-edited');
		}
		
		return React.createElement('div', {
			className: classNames.join(' '),
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
	
	var elements = blocks.map(function(block, blockIndex) {
		var props = {
			key: block.identifier,
			block: block,
			type: block.type,
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

		return React.createElement(BlockElement, props);
	});
	
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