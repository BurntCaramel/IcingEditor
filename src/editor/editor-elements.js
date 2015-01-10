var React = require('react');
var Toolbars = require('./editor-toolbars');


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
	
	render: function() {
		var props = this.props;
		var state = this.state;
		
		var type = props.type;
		var keyPath = props.keyPath;
		var actions = props.actions;
		var traits = props.traits;
		var active = state.active;
		
		var childrenInfo = {};
		var children = ElementCreator.reactElementsWithTextItems(props.textItems, keyPath.concat('textItems'), actions, traits, childrenInfo);
		
		var toolbarActions = {
			onToggleActive: this.onToggleActive,
			onChangeChosenBlockType: this.onChangeChosenBlockType
		};
		
		children.push(
			React.createElement(Toolbars.BlockToolbar, {
				key: 'blockToolbar',
				chosenBlockTypeID: type,
				actions: toolbarActions,
				active: state.active
			})
		);
		
		var classNames = ['block', 'block-' + type];
		
		if (childrenInfo.hasEditedItem || active) {
			classNames.push('block-active');
		}
		
		return React.createElement('div', {className: classNames.join(' ')}, children);
	}
});

var TextItem = React.createClass({
	getDefaultProps: function() {
		return {
			attributes: {}
		};
	},
	
	getInitialState: function() {
		return {
			active: false
		};
	},
	
	render: function() {
		var props = this.props;
		var text = props.text;
		var classes = ['textItem'];
		var id = '';
		
		if (props.active) {
			classes.push('textItem-active');
			id = 'icing-textItem-active';
		}
		
		if (props.attributes.bold) {
			classes.push('textItem-bold');
		}
		if (props.attributes.italic) {
			classes.push('textItem-italic');
		}
		
		return React.createElement('span', {
			id: id,
			className: classes.join(' '),
			onClick: this.makeActive
		}, text);
	},
	
	makeActive: function(event) {
		var props = this.props;
		var actions = props.actions;
		var identifier = props.identifier;
		var keyPath = props.keyPath;
		actions.editTextItemWithIdentifier(identifier, keyPath);
	}
});
/*
var PlaceholderItem = React.createClass({
	getDefaultProps: function() {
		return {
			attributes: {}
		};
	}
});
*/
var ElementCreator = {
	BlockElement: BlockElement,
	TextItem: TextItem,
	
	reactElementsWithTextItems: function(textItems, keyPath, actions, traits, outputInfo) {
		if (textItems) {
			var editedTextItemIdentifier = actions.getEditedTextItemIdentifier();
			
			var editedItem = null;
			
			var elements = textItems.map(function(textItem, textItemIndex) {
				var props = {
					actions: actions,
					keyPath: keyPath.concat(textItemIndex)
				};
		
				if (textItem.identifier) {
					var identifier = textItem.identifier;
					props.identifier = identifier;
					props.key = identifier;
					
					if (editedTextItemIdentifier === identifier) {
						props.active = true;
						editedItem = textItem;
					}
				}
				if (textItem.attributes) {
					props.attributes = textItem.attributes || {};
				}
				if (textItem.text) {
					props.text = textItem.text;
				}
		
				return React.createElement(TextItem, props);
			});
			
			if (editedItem) {
				elements.push(
					React.createElement(Toolbars.TextItemEditor, {
						text: editedItem.text,
						attributes: editedItem.attributes,
						actions: actions,
						availableTraits: traits,
						key: ('edited-' + editedTextItemIdentifier)
					})
				);
			}
			
			if (outputInfo) {
				outputInfo.hasEditedItem = (editedItem !== null);
			}
			
			return elements;
		}
		else {
			return [];
		}
	},
	
	reactElementsWithBlocks: function(blocks, actions, traits) {
		if (blocks) {
			var elements = blocks.map(function(block, blockIndex) {
				var props = {
					type: block.type,
					actions: actions,
					traits: traits,
					keyPath: ['blocks', blockIndex]
				};
				if (block.identifier) {
					props.key = block.identifier;
				}
				if (block.attributes) {
					props.attributes = block.attributes;
				}
				if (block.textItems) {
					props.textItems = block.textItems;
				}
		
				return React.createElement(BlockElement, props);
			});
			
			return elements;
		}
		else {
			return [];
		}
	},
	
	reactElementWithContentAndActions: function(content, actions) {
		content = content.toJS();
		var blocks = content.blocks;
		var traits = content.traits;
		var elements = this.reactElementsWithBlocks(blocks, actions, traits);
		return React.createElement('div', {className: 'blocks'}, elements);
	}
};

module.exports = ElementCreator;