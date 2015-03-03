var React = require('react');
var Immutable = require('immutable');


var HTMLRepresentationAssistant = {
	
};

HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue = function(HTMLRepresentation, value) {
	var reactElementForElementOptions = function(elementOptions) {
		var tagName = elementOptions.get('tagName');
		var attributes = elementOptions.get('attributes');
		var attributesReady = {};
		if (attributes && value) {
			attributesReady = attributes.map(function(attributeValueRepresentation, attributeName) {
				if (typeof attributeValueRepresentation === 'string') {
					return attributeValueRepresentation;
				}
				else if (Immutable.List.isList(attributeValueRepresentation)) {
					var attributeKeyPath = attributeValueRepresentation;
					return value.getIn(attributeKeyPath);
				}
			}).toJS();
		}
		
		var children = elementOptions.get('children');
		var childrenReady = null;
		if (children) {
			childrenReady = children.map(reactElementForElementOptions).toJS();
		}
		
		return React.createElement(tagName, attributesReady, childrenReady);
	};
	
	return HTMLRepresentation.map(reactElementForElementOptions).toJS();
};

module.exports = HTMLRepresentationAssistant;