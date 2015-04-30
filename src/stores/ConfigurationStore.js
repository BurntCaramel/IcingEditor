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

ConfigurationStore.getWantsSaveUI = function() {
	return getKeyFromSettingsJSON('wantsSaveUI', true);
};
	
ConfigurationStore.getWantsViewHTMLFunctionality = function() {
	return getKeyFromSettingsJSON('wantsViewHTMLFunctionality', false);
};

ConfigurationStore.getWantsMultipleSectionsFunctionality = function() {
	return getKeyFromSettingsJSON('wantsMultipleSectionsFunctionality', true);
};

ConfigurationStore.getWantsContentSettingsFunctionality = function() {
	return getKeyFromSettingsJSON('wantsContentSettingsFunctionality', true);
};

ConfigurationStore.getShowsDocumentTitle = function() {
	return false;
};

ConfigurationStore.getAvailableSectionTypes = function() {
	return Immutable.fromJS([
		{
			"id": "writing", // Can be used for articles, notes, prose, sources to quote from
			"title": "Writing"
		},
		{
			"id": "catalog", // Can be used for information, reusable bits, footnotes/sidenotes
			"title": "Catalog"
		},
		{
			"id": "form", // Can be used for specific information
			"title": "Form"
		}
		/*
		// Uses isExternal boolean instead, with above type still specified.
		{
			"id": "external", // External writing or catalog to be brought into a document: has a URL where this library is published.
			"title": "External"
		}
		*/
	]);
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