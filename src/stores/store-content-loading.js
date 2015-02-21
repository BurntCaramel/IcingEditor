var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');
var ContentStore = require('./store-content');
var SettingsStore = require('./store-settings');
var qwest = require('qwest');
var ContentActionsEventIDs = require('../actions/actions-content-eventIDs');
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;


var documentSectionActivity = Immutable.Map({});

var ContentStoreLoading = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


ContentStoreLoading.isLoadingContentForDocument = function(documentID, sectionID) {
	var isLoading = documentSectionActivity.getIn([documentID, 'isLoading'], false);
	return isLoading;
};
	
function setLoadingContentForDocument(documentID, isLoading) {
	var isLoadingCurrent = isLoadingContentForDocument(documentID);
	if (isLoadingCurrent === isLoading) {
		return;
	}
	
	documentSectionActivity = documentSectionActivity.setIn([documentID, 'isLoading'], isLoading);
	
	ContentStoreLoading.trigger('isLoadingDidChangeForDocument', documentID, isLoading);
};

function receiveLoadedContentForDocument(documentID, contentBySectionsJSON) {
	for (sectionID in contentBySectionsJSON) {
		if (!contentBySectionsJSON.propertyIsEnumerable(sectionID)) {
			continue;
		}
		
		var contentJSON = contentBySectionsJSON[sectionID];
		ContentStore.setContentFromJSONForDocumentSection(documentID, sectionID, contentJSON);
	};
}
	
ContentStoreLoading.loadContentForDocument = function(documentID) {
	var isLoading = ContentStoreLoading.isLoadingContentForDocument(documentID);
	if (isLoading) {
		return;
	}
	
	var actionURL = SettingsStore.getActionURL();
	if (actionURL == null) {
		var initialContent = SettingsStore.getInitialContentJSONForDocument(documentID);
		if (initialContent) {
			receiveLoadedContentForDocument(documentID, initialContent);
		}
		return;
	}
	
	setLoadingContentForDocument(documentID, true);
	
	qwest.get(actionURL + documentID + '/', {
	}, {
		dataType: 'json',
		responseType: 'json'
	})
	.then(function(contentBySectionsJSON) {
		receiveLoadedContentForDocument(documentID, contentBySectionsJSON);
	})
	.catch(function(message) {
		ContentStoreLoading.trigger('loadContentDidFailForDocumentWithMessage', documentID, message);
	})
	.complete(function() {
		setLoadingContentForDocument(documentID, false);
	});
};


AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.loadContent):
		loadContentForDocument(payload.documentID);
		break;
	
	}
});

module.exports = ContentStoreLoading;