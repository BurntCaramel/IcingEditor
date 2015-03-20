/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
var Immutable = require('immutable');


var HTMLRepresentationAssistant = {
	
};

let getAttributeValueForInfoAndSourceValue = function(attributeValueRepresentation, sourceValue) {
	let attributeValue = null;
	
	if (typeof attributeValueRepresentation === 'string') {
		attributeValue = attributeValueRepresentation;
	}
	else if (Immutable.List.isList(attributeValueRepresentation)) {
		let keyPath = attributeValueRepresentation;
		attributeValue = sourceValue.getIn(keyPath);
	}
	else if (Immutable.Map.isMap(attributeValueRepresentation)) {
		let attributeOptions = attributeValueRepresentation;
		
		if (attributeOptions.has('checkIsPresent')) {
			let checkIsPresentInfo = attributeOptions.get('checkIsPresent');
			let valueToCheck = getAttributeValueForInfoAndSourceValue(checkIsPresentInfo, sourceValue);
			if (valueToCheck == null) {
				return null;
			}
		}
		
		if (attributeOptions.has('text')) {
			attributeValue = attributeOptions.get('text');
		}
		else if (attributeOptions.has('join')) {
			let join = attributeOptions.get('join');
			let pieces = [];
			let allPresent = join.every(function(attributeInfoToCheck) {
				let valueToCheck = getAttributeValueForInfoAndSourceValue(attributeInfoToCheck, sourceValue);
				if (valueToCheck == null) {
					return false;
				}
				
				pieces.push(valueToCheck);
				return true;
			});
			
			if (allPresent) {
				attributeValue = pieces.join('');
			}
		}
		else if (attributeOptions.has('firstWhichIsPresent')) {
			let firstWhichIsPresent = attributeOptions.get('firstWhichIsPresent');
			firstWhichIsPresent.forEach(function(attributeInfoToCheck) {
				let valueToCheck = getAttributeValueForInfoAndSourceValue(attributeInfoToCheck, sourceValue);
				if (valueToCheck != null) {
					attributeValue = valueToCheck;
					return false; // break
				}
			});
		}
	}
	
	return attributeValue;
};

HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue = function(HTMLRepresentation, sourceValue) {
	var reactElementForElementOptions = function(elementOptions, index) {
		let indexPath = this;
		
		/*if (typeof elementOptions === 'string') {
			return elementOptions;
		}
		else if (Immutable.List.isList(elementOptions)) {
			let keyPath = elementOptions;
			return sourceValue.getIn(keyPath);
		}
		else if (Immutable.Map.isMap(elementOptions)) {*/
		
		// Referenced Element
		if (elementOptions.get('placeOriginalElement', false)) {
			return sourceValue.get('originalElement', null);
		}
		// Element
		else if (elementOptions.has('tagName')) {
			let tagName = elementOptions.get('tagName');
	
			let attributes = elementOptions.get('attributes');
			let attributesReady = {};
			if (attributes && sourceValue) {
				attributesReady = attributes.map(function(attributeValueRepresentation, attributeName) {
					return getAttributeValueForInfoAndSourceValue(attributeValueRepresentation, sourceValue);
				}).toJS();
			}
	
			let children = elementOptions.get('children');
			let childrenReady = null;
			if (children) {
				childrenReady = children.map(reactElementForElementOptions, indexPath.concat(index)).toJS();
			}
	
			let indexPathString = indexPath.join('/')
			attributesReady.key = `indexPath-${indexPath.join()}`
	
			return React.createElement(tagName, attributesReady, childrenReady);
		}
		// Text
		else {
			return getAttributeValueForInfoAndSourceValue(elementOptions, sourceValue);
		}
			//}
	};
	
	return HTMLRepresentation.map(reactElementForElementOptions, []).toJS();
};

module.exports = HTMLRepresentationAssistant;