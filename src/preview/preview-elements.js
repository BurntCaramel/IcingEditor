var React = require('react');
var UIMixins = require('../ui/ui-mixins');
//var Toolbars = require('./editor-toolbars');
var Immutable = require('immutable');


var PreviewBlockElement = React.createClass({
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
			children = PreviewElementCreator.reactElementsWithTextItems(props.textItems, textItemsKeyPath, actions, blockType, traitsConfig, childrenInfo);
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


var PreviewElementCreator = {
	
};

PreviewElementCreator.PreviewBlockElement = PreviewBlockElement;
	
PreviewElementCreator.reactElementsWithTextItems = function(textItems, keyPath, actions, blockType, traitsConfig, outputInfo) {
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
			
			return React.createElement('span', {}, textItem.text);
			//return React.createElement(TextItem, props);
		});
		
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

PreviewElementCreator.reactElementsForWrappingSubsectionChildren = function(subsectionType, subsectionElements) {
	var subsectionTypesToHolderTagNames = {
		"unorderedList": "ul",
		"orderedList": "ol",
		"quote": "blockquote"
	};
	var elementsToReturn = [];
	var tagName = subsectionTypesToHolderTagNames[subsectionType];
	if (tagName) {
		// Wrap elements in holder element.
		elementsToReturn = [
			React.createElement(tagName, {}, subsectionElements)
		];
	}
	else {
		elementsToReturn = subsectionElements;
	}
	return elementsToReturn;
};

PreviewElementCreator.reactElementForSubsectionChild = function(subsectionType, blockType, contentElements) {
	var subsectionTypesToChildTagNames = {
		"unorderedList": "li",
		"orderedList": "li"
	};
	var tagNameForSubsectionChild = subsectionTypesToChildTagNames[subsectionType];
	var tagNameForBlock = PreviewElementCreator.tagNameForBlockType(blockType);
	
	if (tagNameForSubsectionChild) {
		if (blockType === 'body') {
			// Paragraph elements by default just use the, for example, <li> instead of <li><p>
			return React.createElement(tagNameForSubsectionChild, {}, contentElements);
		}
		else {
			return React.createElement(tagNameForSubsectionChild, {},
				React.createElement(tagNameForBlock, {}, contentElements)
			);
		}
	}
	else {
		return React.createElement(tagNameForBlock, {}, contentElements);
	}
};
	
PreviewElementCreator.tagNameForBlockType = function(blockType) {
	var tagNamesToBlockTypes = {
		"body": "p",
		"heading": "h1",
		"subhead1": "h2",
		"subhead2": "h3",
		"subhead3": "h4"
	};
	var tagName = tagNamesToBlockTypes[blockType];
	if (!tagName) {
		tagName = 'div';
	}
	return tagName;
};
	
PreviewElementCreator.reactElementsWithBlocks = function(blocks, traitsConfig) {
	var mainElements = [];
	var currentSubsectionType = 'normal';
	var currentSubsectionElements = [];
	
	blocks.forEach(function(block, blockIndex) {
		var props = {
			key: block.identifier,
			block: block,
			type: block.type,
			subsectionType: currentSubsectionType,
			traitsConfig: traitsConfig,
			keyPath: ['blocks', blockIndex]
		};
		if (block.traits) {
			props.traits = block.traits;
		}
		if (block.textItems) {
			props.textItems = block.textItems;
		}
		
		var elements = [];
		if (block.textItems) {
			elements = elements.concat(block.textItems.map(function(textItem, textItemIndex) {
				var traits = textItem.traits;
				
				var element = textItem.text;
				if (traits.italic) {
					element = React.createElement('em', {}, element);
				}
				if (traits.bold) {
					element = React.createElement('strong', {}, element);
				}
				
				return element;
			}));
		}
		
		if (block.type === 'placeholder') {
			return;
		}
		
		if (block.type === 'subsection') {
			// Wrap last elements.
			if (currentSubsectionElements.length > 0) {
				mainElements = mainElements.concat(
					PreviewElementCreator.reactElementsForWrappingSubsectionChildren(
						currentSubsectionType, currentSubsectionElements
					)
				);
				currentSubsectionElements = [];
			}
			
			currentSubsectionType = block.subsectionType;
		}
		else {
			currentSubsectionElements.push(
				PreviewElementCreator.reactElementForSubsectionChild(
					currentSubsectionType, block.type, elements
				)
			);
		}
		
		//return React.createElement(PreviewBlockElement, props);
	});
	
	if (currentSubsectionElements.length > 0) {
		mainElements = mainElements.concat(
			PreviewElementCreator.reactElementsForWrappingSubsectionChildren(
				currentSubsectionType, currentSubsectionElements
			)
		);
	}
	
	return mainElements;
};

PreviewElementCreator.MainElement = React.createClass({
	getDefaultProps: function() {
		return {
			contentImmutable: null,
			specsImmutable: null,
			actions: {}
		};
	},
	
	render: function() {
		var props = this.props;
		var contentImmutable = props.contentImmutable;
		var specsImmutable = props.specsImmutable;
		
		var classNames = ['blocks'];
	
		var elements = [];
	
		if (contentImmutable) {
			var content = contentImmutable.toJS();
			var blocks = content.blocks;
			var traitsConfig = specsImmutable.get('traits', Immutable.Map()).toJS();
	
			elements = PreviewElementCreator.reactElementsWithBlocks(blocks, traitsConfig);
		}
		else {
			elements = React.createElement('div', {}, 'Loading…');
		}
	
		return React.createElement('div', {
			key: 'blocks',
			className: classNames.join(' ')
		}, elements);
	}
});

PreviewElementCreator.previewHTMLWithContent = function(contentImmutable, specsImmutable) {
	var previewElement = React.createElement(PreviewElementCreator.MainElement, {
		key: 'main',
		contentImmutable: contentImmutable,
		specsImmutable: specsImmutable
	});
	
	var previewHTML = React.renderToStaticMarkup(previewElement);
	
	previewHTML = previewHTML.replace(/^<div class="blocks">|<\/div>$/gm, '');
	
	var inlineTagNames = {
		"span": true,
		"strong": true,
		"em": true
	};
	
	var holdingTagNames = {
		"ul": true,
		"ol": true,
		"blockquote": true
	};
	
	previewHTML = previewHTML.replace(/<(\/?)([^>]+)>/gm, function(match, closingSlash, tagName, offset, string) {
		// Inline elements are kept as-is
		if (inlineTagNames[tagName]) {
			return match;
		}
		// Block elements are given line breaks for nicer presentation.
		else {
			if (closingSlash.length > 0) {
				return '<' + closingSlash + tagName + '>' + "\n";
				//return "\n" + '<' + closingSlash + tagName + '>' + "\n";
			}
			else {
				if (holdingTagNames[tagName]) {
					return '<' + tagName + '>' + "\n";
				}
				else {
					return '<' + tagName + '>';
				}
			}
		}
	});
	
	return previewHTML;
}
	
PreviewElementCreator.reactElementWithContentAndActions = function(contentImmutable, specsImmutable, actions) {
	return React.createElement(PreviewElementCreator.MainElement, {
		key: 'main',
		contentImmutable: contentImmutable,
		specsImmutable: specsImmutable,
		actions: actions
	});
};

module.exports = PreviewElementCreator;