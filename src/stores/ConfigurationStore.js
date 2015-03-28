var AppDispatcher = require('../app-dispatcher');
var MicroEvent = require('microevent');
var Immutable = require('immutable');
var qwest = require('qwest');


var ConfigurationStore = {
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

ConfigurationStore.getActionURL = function(path) {
	let actionURL = getKeyFromSettingsJSON('actionURL');
	if (actionURL && path) {
		actionURL += path;
	}
	return actionURL;
};

ConfigurationStore.getActionsFunctions = function() {
	return getKeyFromSettingsJSON('actionFunctions');
};

ConfigurationStore.wantsMainToolbar = function() {
	return getKeyFromSettingsJSON('wantsMainToolbar', true);
};

ConfigurationStore.getWantsSaveFunctionality = function() {
	return getKeyFromSettingsJSON('wantsSaveFunctionality', true);
};
	
ConfigurationStore.getWantsViewHTMLFunctionality = function() {
	return getKeyFromSettingsJSON('wantsViewHTMLFunctionality', false);
};

ConfigurationStore.getWantsContentSettingsFunctionality = function() {
	return getKeyFromSettingsJSON('wantsContentSettingsFunctionality', true);
};

ConfigurationStore.getWantsPlaceholderFunctionality = function() {
	return getKeyFromSettingsJSON('wantsPlaceholderFunctionality', false);
};

ConfigurationStore.getShowsDocumentTitle = function() {
	return false;
};

ConfigurationStore.getAvailableBlockTypesForDocumentSectionAlternate = function(documentID, sectionID) { //TODO: documentID, sectionID
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

ConfigurationStore.getAvailableBlockTypesForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{'id': 'body', 'title': 'Paragraph'},
		{'id': 'heading', 'title': 'Heading 1'},
		{'id': 'subhead1', 'title': 'Heading 2'},
		{'id': 'subhead2', 'title': 'Heading 3'},
		{'id': 'subhead3', 'title': 'Heading 4'},
		{'id': 'placeholder', 'title': 'Particular'}
	];
};

ConfigurationStore.getAvailableSubsectionTypesForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
	return [
		{'id': 'normal', 'title': 'Normal'},
		{'id': 'unorderedList', 'title': 'Unordered List'},
		{'id': 'orderedList', 'title': 'Ordered List'}
	];
};

ConfigurationStore.getAvailableBlockTypesGroups = function() {
	return Immutable.fromJS([
		{
			"id": "text",
			"title": "Text"
		},
		{
			"id": "media",
			"title": "Media"
		},
		{
			"id": "particular",
			"title": "Particular"
		}
	]);
}

ConfigurationStore.getAvailableBlockTypesGroupedForDocumentSection = function(documentID, sectionID) { //TODO: documentID, sectionID
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

ConfigurationStore.getInitialDocumentState = function() {
	return getKeyFromSettingsJSON('initialDocumentState', {});
};

ConfigurationStore.getInitialAvailableDocuments = function() {
	return getKeyFromObject(ConfigurationStore.getInitialDocumentState(), 'availableDocuments', []);
};

ConfigurationStore.getInitialDocumentID = function() {
	return getKeyFromObject(ConfigurationStore.getInitialDocumentState(), 'documentID');
};

ConfigurationStore.getInitialDocumentSectionID = function() {
	return getKeyFromObject(ConfigurationStore.getInitialDocumentState(), 'documentSectionID');
};

ConfigurationStore.getInitialContentJSONForDocument = function(documentID) {
	var initialContentJSON = getKeyFromObject(ConfigurationStore.getInitialDocumentState(), 'contentJSONByDocumentID');
	//console.log('initialContentJSON', initialContentJSON);
	
	if (!initialContentJSON) {
		return null;
	}
	
	if (initialContentJSON[documentID]) {
		return initialContentJSON[documentID];
	}
	
	return null;
};


var availableDocuments = null;
ConfigurationStore.getAvailableDocuments = function() {
	if (!availableDocuments) {
		availableDocuments = ConfigurationStore.getInitialAvailableDocuments();
	}
	
	return availableDocuments;
};

ConfigurationStore.getAvailableSectionIDsForDocumentID = function(documentID) {
	return [];
};


var currentDocumentID = null;
var currentDocumentSectionID = null;

ConfigurationStore.getCurrentDocumentID = function() {
	if (!currentDocumentID) {
		currentDocumentID = ConfigurationStore.getInitialDocumentID();
	}
	
	return currentDocumentID;
};
ConfigurationStore.setCurrentDocumentID = function(newDocumentID) {
	currentDocumentID = newDocumentID;
	
	this.trigger('currentDocumentDidChange');
};

ConfigurationStore.getCurrentDocumentSectionID = function() {
	if (!currentDocumentSectionID) {
		currentDocumentSectionID = ConfigurationStore.getInitialDocumentSectionID();
	}
	return currentDocumentSectionID;
};


module.exports = ConfigurationStore;