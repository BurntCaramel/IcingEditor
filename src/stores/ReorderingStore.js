var AppDispatcher = require('../app-dispatcher');
var Immutable = require('immutable');
var MicroEvent = require('microevent');
var ContentActionsEventIDs = require('../actions/ContentActionsEventIDs');
var documentSectionEventIDs = ContentActionsEventIDs.documentSection;

let ContentStore = require('./ContentStore');


//var documentSectionActivity = Immutable.Map({});

var ReorderingStore = {
	on: MicroEvent.prototype.bind,
	trigger: MicroEvent.prototype.trigger,
	off: MicroEvent.prototype.unbind
};


var isReordering = false;
ReorderingStore.getIsReordering = function() {
	return isReordering;
};

let FocusStateRecord = Immutable.Record({
	documentID: null,
	sectionID: null,
	blockKeyPath: null,
	blockIdentifier: null
});
var focusState = new FocusStateRecord();

let beginReordering = function() {
	if (!isReordering) {
		isReordering = true;
		ReorderingStore.trigger('didBeginReordering');
	}
};

let focusOnBlockAtKeyPathInDocumentSection = function(documentID, sectionID, blockKeyPath) {
	//let block = ContentStore.getContentObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath);
	let blockIdentifier = ContentStore.getIdentifierOfObjectAtKeyPathForDocumentSection(documentID, sectionID, blockKeyPath);
	
	focusState = focusState.merge({
		documentID,
		sectionID,
		blockKeyPath,
		blockIdentifier
	});
	
	ReorderingStore.trigger('focusedBlockDidChange');
};

let finishFocusingOnBlock = function() {
	focusState = new FocusStateRecord();
};

let keepFocusedBlockAtCurrentSpot = function() {
	finishFocusingOnBlock();
	
	ReorderingStore.trigger('focusedBlockDidChange');
};

ReorderingStore.getFocusedBlockKeyPathForDocumentSection = function(documentID, sectionID) {
	if (focusState.documentID == documentID && focusState.sectionID == sectionID) {
		return focusState.blockKeyPath.toArray();
	}
	else {
		return null;
	}
};

ReorderingStore.getFocusedBlockIdentifierForDocumentSection = function(documentID, sectionID) {
	if (focusState.documentID == documentID && focusState.sectionID == sectionID) {
		return focusState.blockIdentifier;
	}
	else {
		return null;
	}
};

let finishReordering = function() {
	if (isReordering) {
		isReordering = false;
		finishFocusingOnBlock();
		
		ReorderingStore.trigger('didFinishReordering');
	}
};


ReorderingStore.dispatchToken = AppDispatcher.register( function(payload) {
	switch (payload.eventID) {
		
	case (documentSectionEventIDs.beginReordering):
		beginReordering();
		break;
	
	case (documentSectionEventIDs.finishReordering):
		finishReordering();
		break;
	
	case (documentSectionEventIDs.blockAtKeyPath.focusOnForReordering):
		focusOnBlockAtKeyPathInDocumentSection(payload.documentID, payload.sectionID, payload.blockKeyPath);
		break;
	
	case (documentSectionEventIDs.focusedBlockForReordering.keepAtCurrentSpot):
		keepFocusedBlockAtCurrentSpot();
		break;
	
	case (documentSectionEventIDs.focusedBlockForReordering.moveToBeforeBlockAtIndex):
		AppDispatcher.waitFor([ContentStore.dispatchToken]);
		finishFocusingOnBlock();
		break;
	
	}
});

module.exports = ReorderingStore;