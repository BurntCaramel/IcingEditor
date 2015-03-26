/**
	Copyright 2015 Patrick George Wyndham Smith
*/

var React = require('react');
var Immutable = require('immutable');


var HTMLRepresentationAssistant = {
	
};

let checkOptionsShouldShow = function(options, sourceValue) {
	if (options.has('checkIsPresent')) {
		let checkIsPresentInfo = options.get('checkIsPresent');
		let valueToCheck = getAttributeValueForInfoAndSourceValue(checkIsPresentInfo, sourceValue);
		if (valueToCheck === null || valueToCheck === false) {
			return false;
		}
	}
	
	if (options.has('checkIsFilled')) {
		let checkIsFilledInfo = options.get('checkIsFilled');
		let valueToCheck = getAttributeValueForInfoAndSourceValue(checkIsFilledInfo, sourceValue);
		if (typeof valueToCheck !== 'string' || valueToCheck.trim() === '') {
			return false;
		}
	}
	
	return true;
}

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
		
		if (!checkOptionsShouldShow(attributeOptions, sourceValue)) {
			return null;
		}
		
		if (attributeOptions.has('text')) {
			attributeValue = getAttributeValueForInfoAndSourceValue(attributeOptions.get('text'), sourceValue);
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
		/*else if (attributeOptions.has('every')) {
			
		}
		else if (attributeOptions.has('any')) {
			
		}
		*/
	}
	
	return attributeValue;
};

HTMLRepresentationAssistant.createReactElementsForHTMLRepresentationAndValue = function(HTMLRepresentation, sourceValue) {
	var reactElementForElementOptions = function(elementOptions, index) {
		let indexPath = this;
		indexPath = indexPath.concat(index);
		
		if (!checkOptionsShouldShow(elementOptions, sourceValue)) {
			return null;
		}
		
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
				childrenReady = children.map(reactElementForElementOptions, indexPath).toJS();
			}
	
			let indexPathString = indexPath.join('/')
			attributesReady.key = `indexPath-${indexPath.join()}`
	
			return React.createElement(tagName, attributesReady, childrenReady);
		}
		else if (elementOptions.get('lineBreak', false)) {
			return React.createElement('br');
		}
		// Text
		else {
			return getAttributeValueForInfoAndSourceValue(elementOptions, sourceValue);
		}
	};
	
	return HTMLRepresentation.map(reactElementForElementOptions, []).toJS();
};

module.exports = HTMLRepresentationAssistant;