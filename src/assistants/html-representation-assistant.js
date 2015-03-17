var React = require('react');
var Immutable = require('immutable');


var HTMLRepresentationAssistant = {
	
};

HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue = function(HTMLRepresentation, value) {
	var reactElementForElementOptions = function(elementOptions, index) {
		let indexPath = this;
		
		var tagName = elementOptions.get('tagName');
		var attributes = elementOptions.get('attributes');
		var attributesReady = {};
		if (attributes && value) {
			attributesReady = attributes.map(function(attributeValueRepresentation, attributeName) {
				if (typeof attributeValueRepresentation === 'string') {
					return attributeValueRepresentation;
				}
				else if (Immutable.List.isList(attributeValueRepresentation)) {
					let attributeKeyPath = attributeValueRepresentation;
					if (attributeKeyPath.get(0) === 'fields') {
						let attributeKeyPathForFields = attributeKeyPath.slice(1);
						return value.getIn(attributeKeyPathForFields);
					}
				}
				
				return '';
			}).toJS();
		}
		
		var children = elementOptions.get('children');
		var childrenReady = null;
		if (children) {
			childrenReady = children.map(reactElementForElementOptions, indexPath.concat(index)).toJS();
		}
		
		let indexPathString = indexPath.join('/')
		attributesReady.key = `indexPath-${indexPath.join()}`
		
		return React.createElement(tagName, attributesReady, childrenReady);
	};
	
	return HTMLRepresentation.map(reactElementForElementOptions, []).toJS();
};

module.exports = HTMLRepresentationAssistant;