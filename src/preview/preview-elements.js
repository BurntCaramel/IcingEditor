let React = require('react');
let UIMixins = require('../ui/ui-mixins');
//var Toolbars = require('./editor-toolbars');
let Immutable = require('immutable');

let BlockTypesAssistant = require('../assistants/block-types-assistant');
let {
	findParticularBlockTypeOptionsWithGroupAndTypeInList
} = BlockTypesAssistant;

let HTMLRepresentationAssistant = require('../assistants/html-representation-assistant');


var PreviewElementCreator = {
	
};


PreviewElementCreator.reactElementForWrappingChildWithTraits = function(child, traits) {
	let element = child;
	
	if (traits.has('italic')) {
		element = React.createElement('em', {}, element);
	}
	
	if (traits.has('bold')) {
		element = React.createElement('strong', {}, element);
	}
	
	if (traits.has('link')) {
		var link = traits.get('link');
		var linkTypeChoice = link.get('typeChoice');
		var linkType = linkTypeChoice.get('selectedChoiceID');
		var selectedChoiceValues = linkTypeChoice.get('selectedChoiceValues');
		if (linkType === 'URL') {
			element = React.createElement('a', {
				href: selectedChoiceValues.get('URL')
			}, element);
		}
		else if (linkType === 'email') {
			element = React.createElement('a', {
				href: 'mailto:' + selectedChoiceValues.get('emailAddress')
			}, element);
		}
	}
	
	return element;
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

PreviewElementCreator.reactElementsForSubsectionChild = function(subsectionType, blockTypeGroup, blockType, contentElements, traits, blockTypeOptions) {
	var subsectionTypesToChildTagNames = {
		"unorderedList": "li",
		"orderedList": "li"
	};
	var tagNameForSubsectionChild = subsectionTypesToChildTagNames[subsectionType];
	
	var tagNameForBlock = blockTypeOptions.get('HTMLTagNameForBlock', null);
	if (blockTypeGroup === 'text') {
		tagNameForBlock = PreviewElementCreator.tagNameForTextBlockType(blockType);
		
		// Paragraph elements by default go bare, e.g. <li> instead of <li><p>
		if (tagNameForSubsectionChild && blockType === 'body') {
			tagNameForBlock = null;
		}
	}
	
	var innerElements;
	if (tagNameForBlock) {
		// Nest inside, e.g. <li><h2>
		innerElements = [
			React.createElement(tagNameForBlock, {}, contentElements)
		]
	}
	else {
		innerElements = contentElements;
	}
	
	/*
	if (traits) {
		innerElements = [
			PreviewElementCreator.reactElementForWrappingChildWithTraits(innerElements, traits)
		];
	}
	*/
	
	if (tagNameForSubsectionChild) {
		return [
			React.createElement(tagNameForSubsectionChild, {},
				innerElements
			)
		];
	}
	else {
		return innerElements;
	}
};
	
PreviewElementCreator.tagNameForTextBlockType = function(blockType) {
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
	
PreviewElementCreator.reactElementsWithBlocks = function(blocksImmutable, specsImmutable) {
	var traitsSpecs = specsImmutable.get('traits', Immutable.Map());
	var blockGroupIDsToTypesMap = specsImmutable.get('blockTypesByGroups', Immutable.Map());
	
	var mainElements = [];
	var currentSubsectionType = specsImmutable.get('defaultSectionType', 'normal');
	var currentSubsectionElements = [];
	
	blocksImmutable.forEach(function(block, blockIndex) {
		var typeGroup = block.get('typeGroup');
		var type = block.get('type');
		
		if (typeGroup === 'subsection') {
			// Wrap last elements.
			if (currentSubsectionElements.length > 0) {
				mainElements = mainElements.concat(
					PreviewElementCreator.reactElementsForWrappingSubsectionChildren(
						currentSubsectionType, currentSubsectionElements
					)
				);
				currentSubsectionElements = [];
			}
			
			currentSubsectionType = type;
		}
		else {
			var blockTypeOptions = findParticularBlockTypeOptionsWithGroupAndTypeInList(
				typeGroup, type, blockGroupIDsToTypesMap
			);
		
			var elements = [];
		
			if (typeGroup === 'particular' || typeGroup === 'media') {
				var value = block.get('value', Immutable.Map());
				var HTMLRepresentation = blockTypeOptions.get('innerHTMLRepresentation');
				if (HTMLRepresentation) {
					elements = elements.concat(
						HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue(HTMLRepresentation, value)
					);
				}
			}
			else if (typeGroup === 'text') {
				elements = elements.concat(block.get('textItems').map(function(textItem) {
					let element = textItem.get('text');
					let traits = textItem.get('traits');
					
					if (traits) {
						element = PreviewElementCreator.reactElementForWrappingChildWithTraits(element, traits);
					}
				
					return element;
				}).toJS());
			}
			
			
			let traits = block.get('traits');
			if (traits) {
				elements = [
					PreviewElementCreator.reactElementForWrappingChildWithTraits(elements, traits)
				];
			}
			
		
			currentSubsectionElements = currentSubsectionElements.concat(
				PreviewElementCreator.reactElementsForSubsectionChild(
					currentSubsectionType, typeGroup, type, elements, traits, blockTypeOptions
				)
			);
		}
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
			var blocksImmutable = contentImmutable.get('blocks');
	
			elements = PreviewElementCreator.reactElementsWithBlocks(blocksImmutable, specsImmutable);
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
		"em": true,
		"a": true
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