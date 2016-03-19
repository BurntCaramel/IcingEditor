import AppDispatcher from '../app-dispatcher';
var Immutable = require('immutable');
let objectAssign = require('object-assign');
var MicroEvent = require('microevent');
var ContentStore = require('./ContentStore');
var ConfigurationStore = require('./ConfigurationStore');
var qwest = require('qwest');
let ContentActions = require('../actions/ContentActions');

var ContentActionsEventIDs = require('../actions/ContentActionsEventIDs');
var documentEventIDs = ContentActionsEventIDs.document;
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;


var documentSectionActivity = Immutable.Map({});

var ContentLoadingStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


let isLoadingContentForDocument = function(documentID, sectionID) {
	var isLoading = documentSectionActivity.getIn([documentID, 'isLoading'], false);
	return isLoading;
};
	
function setLoadingContentForDocument(documentID, isLoading) {
	var isLoadingCurrently = isLoadingContentForDocument(documentID);
	if (isLoadingCurrently === isLoading) {
		return;
	}
	
	documentSectionActivity = documentSectionActivity.setIn([documentID, 'isLoading'], isLoading);
	
	ContentLoadingStore.trigger('isLoadingDidChangeForDocument', documentID, isLoading);
};

function receiveLoadedContentForDocument(documentID, documentContent) {
	let specsURLs = null;
	
	let contentBySectionsJSON = documentContent['sections'];
	if (!contentBySectionsJSON) {
		// Old documents without 'sections' key.
		// TODO: remove
		contentBySectionsJSON = documentContent;
	}
	else {
		specsURLs = documentContent['specsURLs'];
	}
	
	for (let sectionID in contentBySectionsJSON) {
		if (!contentBySectionsJSON.propertyIsEnumerable(sectionID)) {
			continue;
		}
		
		var contentJSON = contentBySectionsJSON[sectionID];
		var shouldEditFirstBlock = false;
		
		if (!contentJSON) {
			contentJSON = {
				"blocks": [
					ContentStore.newTextBlockWithDefaultType().toJSON()
				]
			};
			shouldEditFirstBlock = true;
		}
		
		
		let documentSectionActions = ContentActions.getActionsForDocumentSection(documentID, sectionID);
		documentSectionActions.setContentJSON(contentJSON);
		
		if (shouldEditFirstBlock) {
			documentSectionActions.editBlockWithKeyPath(['blocks', 0]);
		}
	};
	
	ContentActions.setSpecsURLsForDocumentWithID(documentID, specsURLs);
}
	
let loadContentForDocument = function(documentID) {
	var isLoading = isLoadingContentForDocument(documentID);
	if (isLoading) {
		return;
	}
	
	var actionURL = ConfigurationStore.getActionURL('document/');
	if (actionURL == null) {
		var initialContent = ConfigurationStore.getInitialContentJSONForDocument(documentID);
		if (initialContent) {
			// Make asynchronous, important for app dispatch
			setTimeout(() => {
				receiveLoadedContentForDocument(documentID, initialContent);
				setLoadingContentForDocument(documentID, false);
			}, 0);
		}
		return;
	}
	
	setLoadingContentForDocument(documentID, true);
	
	qwest.get(actionURL + documentID + '/', null, {
		dataType: 'json',
		responseType: 'json'
	})
	.then(function(documentContent) {
		receiveLoadedContentForDocument(documentID, documentContent);
	})
	.catch(function(message) {
		ContentLoadingStore.trigger('loadContentDidFailForDocumentWithMessage', documentID, message);
	})
	.complete(function() {
		setLoadingContentForDocument(documentID, false);
	});
};


AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		
	case (documentEventIDs.loadContent):
		loadContentForDocument(payload.documentID);
		break;
	
	}
});

objectAssign(ContentLoadingStore, {
	isLoadingContentForDocument
});

module.exports = ContentLoadingStore;