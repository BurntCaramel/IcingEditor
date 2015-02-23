var AppDispatcher = require('../app-dispatcher');
var MicroEvent = require('microevent');
var qwest = require('qwest');


var SettingsStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


var getSettingsJSON = function() {
	if (window && window.burntIcing) {
		return window.burntIcing.settingsJSON;
	}
	else {
		return null;
	}
};

var getKeyFromObject = function(object, key, fallback) {
	if (typeof fallback === 'undefined') {
		fallback = null;
	}
	
	if (!object || (typeof object[key] === 'undefined')) {
		return fallback;
	}
	
	return object[key];
}

var getKeyFromSettingsJSON = function(key, fallback) {
	if (typeof fallback === 'undefined') {
		fallback = null;
	}
	
	var settingsJSON = getSettingsJSON();
	if (!settingsJSON || (typeof settingsJSON[key] === 'undefined')) {
		return fallback;
	}
	
	return settingsJSON[key];
};

SettingsStore.getActionURL = function() {
	return getKeyFromSettingsJSON('actionURL');
};

SettingsStore.getWantsSaveFunctionality = function() {
	return getKeyFromSettingsJSON('wantsSaveFunctionality', true);
};
	
SettingsStore.getWantsViewHTMLFunctionality = function() {
	return getKeyFromSettingsJSON('wantsViewHTMLFunctionality', false);
};

SettingsStore.getWantsPlaceholderFunctionality = function() {
	return getKeyFromSettingsJSON('wantsPlaceholderFunctionality', false);
};

SettingsStore.getAvailableBlockTypesForDocumentSectionAlternate = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{'id': 'body', 'title': 'Body'},
		{'id': 'heading', 'title': 'Heading'},
		{'id': 'subhead1', 'title': 'Subheading'},
		{'id': 'subhead2', 'title': 'Subheading B'},
		{'id': 'subhead3', 'title': 'Subheading C'},
		//{'id': 'figure', 'title': 'Figure'},
		//{'id': 'media', 'title': 'Media'},
		//{'id': 'quote', 'title': 'Quote'},
		{'id': 'placeholder', 'title': 'Particular'},
		{'id': 'subsection', 'title': 'Subsection'}
		//{'id': 'external', 'title': 'External Element'},
		//{'id': 'placeholder', 'title': 'Placeholder'}
	];
};

SettingsStore.getAvailableBlockTypesForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{'id': 'body', 'title': 'Paragraph'},
		{'id': 'heading', 'title': 'Heading 1'},
		{'id': 'subhead1', 'title': 'Heading 2'},
		{'id': 'subhead2', 'title': 'Heading 3'},
		{'id': 'subhead3', 'title': 'Heading 4'},
		{'id': 'placeholder', 'title': 'Particular'},
		{'id': 'subsection', 'title': 'Subsection'}
	];
};

SettingsStore.getAvailableSubsectionTypesForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{'id': 'normal', 'title': 'Normal'},
		{'id': 'unorderedList', 'title': 'Unordered List'},
		{'id': 'orderedList', 'title': 'Ordered List'}
	];
};

SettingsStore.getAvailableBlockTypesGroupedForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{
			"id": "text",
			"types": [
				{'id': 'body', 'title': 'Body'},
				{'id': 'heading', 'title': 'Heading'},
				{'id': 'subhead1', 'title': 'Subheading'},
				{'id': 'subhead2', 'title': 'Subheading B'},
				{'id': 'subhead3', 'title': 'Subheading C'}
			]
		},
		{
			"id": "media",
			"types": [
				{"id": "externalImage", "title": "External Image"},
				{"id": "youTubeVideo", "title": "YouTube Video"},
				{"id": "vimeoVideo", "title": "Vimeo Video"}
				//{"id": "iframe", "title": "HTML iframe"}
			]
		},
		{
			"id": "particular",
			"types": [
				{'id': 'placeholder', 'title': 'Placeholder'},
				{'id': 'streetAddress', 'title': 'Street Address'}
			]
		},
		{
			"id": "section",
			"types": [
				{'id': 'list', 'title': 'List'},
				{'id': 'quote', 'title': 'Quote'}
			]
		}
		
	];
};

SettingsStore.getInitialDocumentState = function() {
	return getKeyFromSettingsJSON('initialDocumentState', {});
};

SettingsStore.getInitialAvailableDocuments = function() {
	return getKeyFromObject(SettingsStore.getInitialDocumentState(), 'availableDocuments', []);
};

SettingsStore.getInitialDocumentID = function() {
	return getKeyFromObject(SettingsStore.getInitialDocumentState(), 'documentID');
};

SettingsStore.getInitialDocumentSectionID = function() {
	return getKeyFromObject(SettingsStore.getInitialDocumentState(), 'documentSectionID');
};

SettingsStore.getInitialContentJSONForDocument = function(documentID) {
	var initialContentJSON = getKeyFromObject(SettingsStore.getInitialDocumentState(), 'contentJSONByDocumentID');
	//var initialContentJSON = getKeyFromSettingsJSON('initialContentJSONByDocumentID');
	//return getKeyFromObject(initialContentJSON, documentID);
	if (!initialContentJSON) {
		return null;
	}
	
	if (initialContentJSON[documentID]) {
		return initialContentJSON[documentID];
	}
	
	return null;
};

var availableDocuments = null;
SettingsStore.getAvailableDocuments = function() {
	if (!availableDocuments) {
		availableDocuments = SettingsStore.getInitialAvailableDocuments();
	}
	
	return availableDocuments;
};

var currentDocumentID = null;
SettingsStore.getCurrentDocumentID = function() {
	if (!currentDocumentID) {
		currentDocumentID = SettingsStore.getInitialDocumentID();
	}
	
	return currentDocumentID;
};
SettingsStore.setCurrentDocumentID = function(newDocumentID) {
	currentDocumentID = newDocumentID;
};

SettingsStore.getAvailableSectionIDsForDocumentID = function(documentID) {
	return [];
};

var currentDocumentSectionID = null;
SettingsStore.getCurrentSectionID = function() {
	if (!currentDocumentSectionID) {
		currentDocumentSectionID = SettingsStore.getInitialDocumentSectionID();
	}
	return currentDocumentSectionID;
};


SettingsStore.getContentSpecificationJSONForDocumentSection = function(documentID, sectionID) {
	//var contentSpecs = require('./dummy-content-specs.json');
	//return contentSpecs;
};


module.exports = SettingsStore;